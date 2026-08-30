/**
 * QT 책 지면에는 "08 / 31 / 월요일"만 있고 연도가 없다.
 * 그래서 사진에서 읽은 월·일에 연도를 붙이는 일은 앱 몫이다.
 * 오늘 날짜에서 가장 가까운 연도를 골라 연말·연초에 1년이 어긋나지 않게 한다.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** 며칠 이상 벌어지면 등록 화면에서 확인하라고 알린다. */
const WARN_AFTER_DAYS = 3;

function toUtcDate(year: number, month: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day));

  // 2월 30일 같은 값은 Date가 다음 달로 넘겨버리므로 되돌려 확인한다.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface ResolvedDevotionDate {
  /** 연도를 붙인 YYYY-MM-DD. 월·일을 못 읽었으면 기준 날짜를 그대로 쓴다. */
  devotionDate: string;
  /** 사진 속 날짜가 기준 날짜와 많이 다를 때 등록 화면에 띄울 문구 */
  warning: string | null;
}

/**
 * @param monthDay "MM-DD" (사진에서 읽은 값, 없을 수 있음)
 * @param today    "YYYY-MM-DD" (등록하는 사람 기기의 오늘)
 */
export function resolveDevotionDate(
  monthDay: string | null,
  today: string,
): ResolvedDevotionDate {
  const todayMatch = today.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const todayDate = todayMatch
    ? toUtcDate(
        Number(todayMatch[1]),
        Number(todayMatch[2]),
        Number(todayMatch[3]),
      )
    : null;

  if (!todayDate) {
    throw new Error("기준 날짜가 올바르지 않아요.");
  }

  const monthDayMatch = monthDay?.match(/^(\d{2})-(\d{2})$/);

  if (!monthDayMatch) {
    return {
      devotionDate: formatDate(todayDate),
      warning: "사진에서 날짜를 읽지 못했어요. 날짜를 직접 확인해주세요.",
    };
  }

  const month = Number(monthDayMatch[1]);
  const day = Number(monthDayMatch[2]);
  const todayYear = todayDate.getUTCFullYear();

  // 연말에 찍은 다음 해 지면, 연초에 찍은 지난 해 지면까지 감안해 앞뒤 연도를 함께 본다.
  const candidates = [todayYear - 1, todayYear, todayYear + 1]
    .map((year) => toUtcDate(year, month, day))
    .filter((date): date is Date => date !== null);

  if (candidates.length === 0) {
    return {
      devotionDate: formatDate(todayDate),
      warning: "사진에서 읽은 날짜가 올바르지 않아요. 날짜를 직접 확인해주세요.",
    };
  }

  const nearest = candidates.reduce((best, candidate) =>
    Math.abs(candidate.getTime() - todayDate.getTime()) <
    Math.abs(best.getTime() - todayDate.getTime())
      ? candidate
      : best,
  );

  const diffDays = Math.round(
    Math.abs(nearest.getTime() - todayDate.getTime()) / DAY_MS,
  );

  return {
    devotionDate: formatDate(nearest),
    warning:
      diffDays > WARN_AFTER_DAYS
        ? `사진에 적힌 날짜는 ${month}월 ${day}일이에요. 오늘과 ${diffDays}일 차이가 나니 날짜를 확인해주세요.`
        : null,
  };
}
