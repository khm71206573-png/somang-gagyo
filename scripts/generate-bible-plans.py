#!/usr/bin/env python3
"""교회에서 흔히 쓰는 통독 플랜과 날짜별 분량(plan_days)을 SQL 마이그레이션으로 생성한다."""

OT = [
    ("창세기", 50), ("출애굽기", 40), ("레위기", 27), ("민수기", 36), ("신명기", 34),
    ("여호수아", 24), ("사사기", 21), ("룻기", 4),
    ("사무엘상", 31), ("사무엘하", 24), ("열왕기상", 22), ("열왕기하", 25),
    ("역대상", 29), ("역대하", 36), ("에스라", 10), ("느헤미야", 13), ("에스더", 10),
    ("욥기", 42), ("시편", 150), ("잠언", 31), ("전도서", 12), ("아가", 8),
    ("이사야", 66), ("예레미야", 52), ("예레미야애가", 5), ("에스겔", 48), ("다니엘", 12),
    ("호세아", 14), ("요엘", 3), ("아모스", 9), ("오바댜", 1), ("요나", 4), ("미가", 7),
    ("나훔", 3), ("하박국", 3), ("스바냐", 3), ("학개", 2), ("스가랴", 14), ("말라기", 4),
]

NT = [
    ("마태복음", 28), ("마가복음", 16), ("누가복음", 24), ("요한복음", 21),
    ("사도행전", 28),
    ("로마서", 16), ("고린도전서", 16), ("고린도후서", 13), ("갈라디아서", 6),
    ("에베소서", 6), ("빌립보서", 4), ("골로새서", 4),
    ("데살로니가전서", 5), ("데살로니가후서", 3),
    ("디모데전서", 6), ("디모데후서", 4), ("디도서", 3), ("빌레몬서", 1),
    ("히브리서", 13), ("야고보서", 5), ("베드로전서", 5), ("베드로후서", 3),
    ("요한일서", 5), ("요한이서", 1), ("요한삼서", 1), ("유다서", 1),
    ("요한계시록", 22),
]

GOSPELS = NT[:4]
PSALMS = [("시편", 150)]
PROVERBS = [("잠언", 31)]
JOHN = [("요한복음", 21)]


def flatten(books):
    """[(책이름, 장), ...] 평탄화"""
    out = []
    for name, chapters in books:
        for c in range(1, chapters + 1):
            out.append((name, c))
    return out


def unit_for(book):
    return "편" if book == "시편" else "장"


def label(chunk):
    """연속한 장 목록을 '창세기 1-3장' 형태 문자열로."""
    parts = []
    i = 0
    while i < len(chunk):
        book = chunk[i][0]
        start = chunk[i][1]
        end = start
        while i + 1 < len(chunk) and chunk[i + 1][0] == book:
            i += 1
            end = chunk[i][1]
        u = unit_for(book)
        parts.append(f"{book} {start}{u}" if start == end else f"{book} {start}-{end}{u}")
        i += 1
    return ", ".join(parts)


def split_days(chapters, days):
    """장 목록을 days개로 최대한 고르게 나눈다 (앞쪽 날에 나머지를 배분)."""
    total = len(chapters)
    base, extra = divmod(total, days)
    out = []
    idx = 0
    for d in range(days):
        size = base + (1 if d < extra else 0)
        out.append(chapters[idx:idx + size])
        idx += size
    return out


def split_days_cycling(chapters, days):
    """
    장 수가 일수보다 적은 본문(신약·시편 등)을 매일 한 장씩 읽도록 순환시킨다.
    맥체인 통독표가 신약과 시편을 한 해에 두 번 이상 읽는 방식을 따른 것.
    """
    if len(chapters) >= days:
        return split_days(chapters, days)
    return [[chapters[d % len(chapters)]] for d in range(days)]


def minutes(n_chapters):
    return max(round(n_chapters * 3.5), 3)


def sql_escape(text):
    return text.replace("'", "''")


class Plan:
    def __init__(self, title, description, days, books, difficulty,
                 featured=False, ribbon=None, ribbon_variant=None, tracks=None):
        self.title = title
        self.description = description
        self.days = days
        self.books = books
        self.difficulty = difficulty
        self.featured = featured
        self.ribbon = ribbon
        self.ribbon_variant = ribbon_variant
        self.tracks = tracks  # [(라벨, books), ...] 여러 본문을 동시에 읽는 플랜

    def day_passages(self):
        if self.tracks:
            per_track = []
            for track in self.tracks:
                books, repeat = track[1], (track[2] if len(track) > 2 else 1)
                per_track.append(split_days(flatten(books) * repeat, self.days))
            rows = []
            for d in range(self.days):
                chunks = [t[d] for t in per_track if t[d]]
                rows.append((
                    " / ".join(label(c) for c in chunks),
                    sum(len(c) for c in chunks),
                ))
            return rows
        return [(label(c), len(c)) for c in split_days(flatten(self.books), self.days)]

    def chapters_per_day_label(self):
        rows = self.day_passages()
        counts = [n for _, n in rows]
        lo, hi = min(counts), max(counts)
        unit = "편" if self.books == PSALMS else "장"
        return f"하루 {lo}{unit}" if lo == hi else f"하루 {lo}-{hi}{unit}"

    def minutes_label(self):
        rows = self.day_passages()
        avg = sum(n for _, n in rows) / len(rows)
        return f"하루 약 {minutes(avg)}분"


PLANS = [
    Plan("1년 1독", "창세기부터 요한계시록까지 차례대로 1년에 완독",
         365, OT + NT, 2, featured=True, ribbon="추천", ribbon_variant="primary"),
    Plan("맥체인 성경읽기", "구약 1독·신약 2독, 매일 세 본문을 나누어 읽는 고전 통독표",
         365, None, 3,
         tracks=[
             ("구약 역사서", OT[:17], 1),
             ("구약 시가·선지서", OT[17:], 1),
             ("신약", NT, 2),
         ]),
    Plan("6개월 통독", "하루 조금 더, 반년 만에 성경 전체를 완독",
         180, OT + NT, 3),
    Plan("90일 속독", "빠른 속도로 성경 전체의 흐름을 한 번에 파악하기",
         90, OT + NT, 3),
    Plan("2년 1독", "하루 두 장 남짓, 부담 없이 천천히 완독",
         730, OT + NT, 1, ribbon="부담 없이", ribbon_variant="secondary"),
    Plan("신약 100일", "신약 27권을 100일 동안, 예수님의 생애와 초대교회까지",
         100, NT, 1, ribbon="처음이라면", ribbon_variant="secondary-container"),
    Plan("사복음서 40일", "신약의 네 복음서로 예수님의 생애를 40일간 따라가기",
         40, GOSPELS, 1),
    Plan("요한복음 21일", "신약 입문으로 좋은 요한복음, 하루 한 장씩 21일",
         21, JOHN, 1),
    Plan("시편 30일", "시편 150편을 한 달 동안, 기도의 언어를 배우기",
         30, PSALMS, 1),
    Plan("잠언 31일", "하루 한 장씩 읽는 지혜서, 한 달 습관 만들기",
         31, PROVERBS, 1),
]


def main():
    lines = [
        "-- ============================================================",
        "-- 통독 플랜 시드 데이터",
        "-- 교회에서 흔히 쓰는 통독 플랜과 날짜별 분량을 채운다.",
        "-- 장 배분은 실제 성경 장수(구약 929장 + 신약 260장 = 1189장)를 기준으로",
        "-- 플랜 일수에 맞춰 고르게 나눈 값이다.",
        "-- ============================================================",
        "",
    ]

    for plan in PLANS:
        rows = plan.day_passages()
        assert len(rows) == plan.days, (plan.title, len(rows), plan.days)
        assert all(p for p, _ in rows), f"빈 분량이 있는 플랜: {plan.title}"

        ribbon_label = f"'{sql_escape(plan.ribbon)}'" if plan.ribbon else "null"
        ribbon_variant = f"'{plan.ribbon_variant}'" if plan.ribbon_variant else "null"

        values = ",\n".join(
            f"    ({i + 1}, '{sql_escape(p)}', '{minutes(n)}분')"
            for i, (p, n) in enumerate(rows)
        )

        lines.append(f"-- {plan.title} ({plan.days}일)")
        lines.append("with new_plan as (")
        lines.append("  insert into bible_plans (")
        lines.append("    title, description, total_days, minutes_per_day, chapters_per_day,")
        lines.append("    difficulty, is_featured, ribbon_label, ribbon_variant")
        lines.append("  )")
        lines.append("  values (")
        lines.append(f"    '{sql_escape(plan.title)}',")
        lines.append(f"    '{sql_escape(plan.description)}',")
        lines.append(f"    {plan.days},")
        lines.append(f"    '{plan.minutes_label()}',")
        lines.append(f"    '{plan.chapters_per_day_label()}',")
        lines.append(f"    {plan.difficulty},")
        lines.append(f"    {'true' if plan.featured else 'false'},")
        lines.append(f"    {ribbon_label},")
        lines.append(f"    {ribbon_variant}")
        lines.append("  )")
        lines.append("  returning id")
        lines.append(")")
        lines.append("insert into plan_days (plan_id, day_number, passage, duration_label)")
        lines.append("select new_plan.id, d.day_number, d.passage, d.duration_label")
        lines.append("from new_plan,")
        lines.append("  (values")
        lines.append(values)
        lines.append("  ) as d(day_number, passage, duration_label);")
        lines.append("")

    out = "\n".join(lines)
    path = "supabase/migrations/20260821010000_seed_bible_plans.sql"
    with open(path, "w") as f:
        f.write(out)

    print(f"wrote {path}")
    for plan in PLANS:
        rows = plan.day_passages()
        print(f"  {plan.title:16s} {plan.days:4d}일  {plan.chapters_per_day_label():12s} "
              f"{plan.minutes_label():12s} 첫날: {rows[0][0]}")


if __name__ == "__main__":
    main()
