/**
 * 한국 공휴일 표를 생성해 src/lib/holidays.ts 로 저장한다.
 *
 * 음력 기반 공휴일(설날·추석·부처님오신날)은 korean-lunar-calendar 로 변환하고,
 * 대체공휴일은 「공휴일에 관한 법률 시행령」 규칙대로 계산한다.
 *
 * 실행: node scripts/generate-holidays.mjs
 * (음력 변환에 쓰는 korean-lunar-calendar는 devDependency로 들어 있다)
 *
 * 정부가 그때그때 지정하는 임시공휴일(예: 선거일, 특별 지정일)은 포함되지 않는다.
 * 필요하면 관리자 화면에서 일정으로 등록해 쓰면 된다.
 */
import { writeFileSync } from "node:fs";
import KoreanLunarCalendar from "korean-lunar-calendar";

const START_YEAR = 2025;
const END_YEAR = 2035;

const pad = (n) => String(n).padStart(2, "0");
const key = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const dateOf = (year, month, day) => new Date(year, month - 1, day);
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** 음력 날짜를 양력 Date로 바꾼다. */
function lunarToSolar(year, lunarMonth, lunarDay) {
  const cal = new KoreanLunarCalendar();
  if (!cal.setLunarDate(year, lunarMonth, lunarDay, false)) {
    throw new Error(`음력 변환 실패: ${year}-${lunarMonth}-${lunarDay}`);
  }
  const s = cal.getSolarCalendar();
  return dateOf(s.year, s.month, s.day);
}

const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;

function buildYear(year) {
  /** @type {{ date: Date, name: string, substituteRule: "none" | "weekend" | "sundayOnly" | "childrensDay" }[]} */
  const base = [];

  base.push({ date: dateOf(year, 1, 1), name: "신정", substituteRule: "none" });
  base.push({ date: dateOf(year, 3, 1), name: "삼일절", substituteRule: "weekend" });
  base.push({ date: dateOf(year, 5, 5), name: "어린이날", substituteRule: "childrensDay" });
  base.push({ date: dateOf(year, 6, 6), name: "현충일", substituteRule: "none" });
  base.push({ date: dateOf(year, 8, 15), name: "광복절", substituteRule: "weekend" });
  base.push({ date: dateOf(year, 10, 3), name: "개천절", substituteRule: "weekend" });
  base.push({ date: dateOf(year, 10, 9), name: "한글날", substituteRule: "weekend" });
  base.push({ date: dateOf(year, 12, 25), name: "성탄절", substituteRule: "weekend" });
  base.push({
    date: lunarToSolar(year, 4, 8),
    name: "부처님오신날",
    substituteRule: "weekend",
  });

  // 설날·추석은 앞뒤 하루씩 붙은 3일 연휴
  const seollal = lunarToSolar(year, 1, 1);
  const chuseok = lunarToSolar(year, 8, 15);
  const holidayRuns = [
    { center: seollal, names: ["설날 연휴", "설날", "설날 연휴"] },
    { center: chuseok, names: ["추석 연휴", "추석", "추석 연휴"] },
  ];

  for (const run of holidayRuns) {
    for (let offset = -1; offset <= 1; offset += 1) {
      base.push({
        date: addDays(run.center, offset),
        name: run.names[offset + 1],
        substituteRule: "sundayOnly",
      });
    }
  }

  return { base, holidayRuns };
}

function generate() {
  /** @type {Map<string, string>} */
  const holidays = new Map();
  /** 대체공휴일 계산 전에 "이미 공휴일인 날"을 모아둔다. */
  const yearData = [];

  for (let year = START_YEAR - 1; year <= END_YEAR + 1; year += 1) {
    const data = buildYear(year);
    yearData.push(data);
    for (const item of data.base) {
      // 같은 날에 두 공휴일이 겹치면 이름을 합쳐서 보여준다. (예: 어린이날·부처님오신날)
      const existing = holidays.get(key(item.date));
      holidays.set(
        key(item.date),
        existing && existing !== item.name ? `${existing}·${item.name}` : item.name,
      );
    }
  }

  const isHoliday = (date) => holidays.has(key(date));

  /** 그 날 다음의 첫 번째 평일(공휴일이 아닌 날)을 찾는다. */
  function nextFreeWeekday(date) {
    let cursor = addDays(date, 1);
    while (isWeekend(cursor) || isHoliday(cursor)) {
      cursor = addDays(cursor, 1);
    }
    return cursor;
  }

  const substitutes = new Map();

  for (const { base, holidayRuns } of yearData) {
    for (const item of base) {
      if (item.substituteRule === "none" || item.substituteRule === "sundayOnly") {
        continue;
      }

      const overlapsHoliday =
        item.substituteRule === "childrensDay" &&
        (holidays.get(key(item.date)) ?? "").includes("·");

      if (isWeekend(item.date) || overlapsHoliday) {
        substitutes.set(key(nextFreeWeekday(item.date)), "대체공휴일");
      }
    }

    // 설날·추석 연휴는 일요일과 겹칠 때만 대체공휴일이 생기고, 연휴가 끝난 뒤로 붙는다.
    for (const run of holidayRuns) {
      const runDays = [-1, 0, 1].map((offset) => addDays(run.center, offset));
      if (runDays.some((day) => day.getDay() === 0)) {
        substitutes.set(key(nextFreeWeekday(runDays[2])), "대체공휴일");
      }
    }
  }

  for (const [date, name] of substitutes) {
    if (!holidays.has(date)) holidays.set(date, name);
  }

  const entries = Array.from(holidays.entries())
    .filter(([date]) => {
      const year = Number(date.slice(0, 4));
      return year >= START_YEAR && year <= END_YEAR;
    })
    .sort(([a], [b]) => a.localeCompare(b));

  const lines = entries.map(([date, name]) => `  "${date}": "${name}",`).join("\n");

  const file = `/**
 * 한국 공휴일 표 (${START_YEAR}~${END_YEAR}년).
 *
 * scripts/generate-holidays.mjs 로 생성한 파일이라 직접 고치지 말 것.
 * 음력 공휴일은 korean-lunar-calendar 로 변환했고 대체공휴일도 함께 계산되어 있다.
 * 정부가 따로 지정하는 임시공휴일은 포함되지 않는다.
 */
const HOLIDAYS: Record<string, string> = {
${lines}
};

/** yyyy-mm-dd 날짜의 공휴일 이름. 공휴일이 아니면 null. */
export function holidayName(dateStr: string): string | null {
  return HOLIDAYS[dateStr] ?? null;
}

/** 해당 연월(1~12)에 속한 공휴일을 { 일: 이름 } 으로 돌려준다. */
export function holidaysInMonth(year: number, month: number): Map<number, string> {
  const prefix = \`\${year}-\${String(month).padStart(2, "0")}-\`;
  const result = new Map<number, string>();

  for (const [date, name] of Object.entries(HOLIDAYS)) {
    if (date.startsWith(prefix)) {
      result.set(Number(date.slice(8, 10)), name);
    }
  }

  return result;
}
`;

  writeFileSync(new URL("../src/lib/holidays.ts", import.meta.url), file);
  console.log(`생성 완료: ${entries.length}일 (${START_YEAR}~${END_YEAR})`);
}

generate();
