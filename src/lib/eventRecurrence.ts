import { WEEKDAY_LABELS, toDateString } from "@/lib/supabase/queries/utils";

export type EventRepeatType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export const EVENT_REPEAT_OPTIONS: { value: EventRepeatType; label: string }[] = [
  { value: "none", label: "반복 안 함" },
  { value: "daily", label: "매일" },
  { value: "weekly", label: "매주" },
  { value: "monthly", label: "매월" },
  { value: "yearly", label: "매년" },
];

const VALID_REPEAT_TYPES = EVENT_REPEAT_OPTIONS.map((option) => option.value);

export function toEventRepeatType(value: unknown): EventRepeatType {
  return VALID_REPEAT_TYPES.includes(value as EventRepeatType)
    ? (value as EventRepeatType)
    : "none";
}

export interface RecurringEvent {
  /** 반복의 기준이 되는 시작일 (yyyy-mm-dd) */
  eventDate: string;
  repeatType: EventRepeatType;
  /** 반복 종료일. null이면 계속 반복한다. */
  repeatUntil: string | null;
}

/** 한 번의 확장에서 만들어낼 수 있는 최대 일정 수 (무한 루프 안전장치) */
const MAX_OCCURRENCES = 500;

function parseDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month, day };
}

/** 그 달에 실제로 존재하는 날짜일 때만 문자열을 돌려준다 (2월 31일 같은 날 걸러내기) */
function validDateString(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return toDateString(date);
}

function daysBetween(from: string, to: string) {
  const a = parseDate(from);
  const b = parseDate(to);
  const fromDate = new Date(a.year, a.month - 1, a.day);
  const toDate = new Date(b.year, b.month - 1, b.day);
  return Math.round((toDate.getTime() - fromDate.getTime()) / 86400000);
}

/**
 * 반복 일정이 [windowStart, windowEnd] 구간에서 실제로 열리는 날짜들.
 * 날짜 문자열(yyyy-mm-dd)은 사전순 비교가 곧 날짜 비교라 그대로 비교한다.
 */
export function expandEventDates(
  event: RecurringEvent,
  windowStart: string,
  windowEnd: string,
): string[] {
  const { eventDate: start, repeatType, repeatUntil } = event;

  // 반복 종료일이 창보다 앞이면 그 날까지만 본다.
  const limit = repeatUntil && repeatUntil < windowEnd ? repeatUntil : windowEnd;
  if (start > limit) return [];

  if (repeatType === "none") {
    return start >= windowStart ? [start] : [];
  }

  const { year: startYear, month: startMonth, day: startDay } = parseDate(start);
  const results: string[] = [];

  if (repeatType === "daily" || repeatType === "weekly") {
    const step = repeatType === "weekly" ? 7 : 1;
    // 창 시작보다 이른 반복은 건너뛰고 첫 회차부터 센다.
    let index = 0;
    if (start < windowStart) {
      index = Math.ceil(daysBetween(start, windowStart) / step);
    }

    for (; results.length < MAX_OCCURRENCES; index += 1) {
      const dateStr = toDateString(
        new Date(startYear, startMonth - 1, startDay + index * step),
      );
      if (dateStr > limit) break;
      if (dateStr >= windowStart) results.push(dateStr);
    }

    return results;
  }

  if (repeatType === "monthly") {
    let year = startYear;
    let month = startMonth;

    // 창 시작이 한참 뒤면 그 달부터 훑는다.
    if (start < windowStart) {
      const windowStartParts = parseDate(windowStart);
      year = windowStartParts.year;
      month = windowStartParts.month;
    }

    for (let i = 0; i < MAX_OCCURRENCES; i += 1) {
      // 31일 일정처럼 그 달에 없는 날짜는 그 달만 건너뛴다.
      const dateStr = validDateString(year, month, startDay);
      if (dateStr) {
        if (dateStr > limit) break;
        if (dateStr >= windowStart && dateStr >= start) results.push(dateStr);
      } else if (validDateString(year, month, 1)! > limit) {
        break;
      }

      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    return results;
  }

  // yearly : 같은 월·일에 반복 (2월 29일은 윤년에만)
  let year = startYear;
  if (start < windowStart) {
    year = parseDate(windowStart).year;
  }

  for (let i = 0; i < MAX_OCCURRENCES; i += 1, year += 1) {
    const dateStr = validDateString(year, startMonth, startDay);
    if (dateStr) {
      if (dateStr > limit) break;
      if (dateStr >= windowStart && dateStr >= start) results.push(dateStr);
    } else if (validDateString(year, 1, 1)! > limit) {
      break;
    }
  }

  return results;
}

/** 목록·카드에 붙이는 짧은 배지 문구 */
export function repeatShortLabel(repeatType: EventRepeatType): string | null {
  if (repeatType === "none") return null;
  return EVENT_REPEAT_OPTIONS.find((option) => option.value === repeatType)?.label ?? null;
}

/** "매주 화요일", "매월 15일" 처럼 반복 규칙을 풀어 쓴 문구 */
export function repeatDescription(
  repeatType: EventRepeatType,
  eventDate: string,
  repeatUntil?: string | null,
): string | null {
  if (repeatType === "none") return null;

  const { year, month, day } = parseDate(eventDate);
  let label: string;

  switch (repeatType) {
    case "daily":
      label = "매일";
      break;
    case "weekly":
      label = `매주 ${WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()]}요일`;
      break;
    case "monthly":
      label = `매월 ${day}일`;
      break;
    default:
      label = `매년 ${month}월 ${day}일`;
  }

  if (repeatUntil) {
    const until = parseDate(repeatUntil);
    return `${label} (${until.year}년 ${until.month}월 ${until.day}일까지)`;
  }

  return label;
}
