export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
export const WEEKDAY_LABELS_CHURCH = [
  "주일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

export function toDateString(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 주어진 날짜가 속한 주의 시작일(주일)을 "YYYY-MM-DD"로 돌려준다. */
export function weekStartDateString(date: Date = new Date()) {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return toDateString(start);
}

export function monthDayOf(dateStr: string) {
  const [, month, day] = dateStr.split("-").map(Number);
  return { month, day };
}

export function toMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDate(a: Date, b: Date) {
  return toMidnight(a).getTime() === toMidnight(b).getTime();
}

export function formatDateLabel(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_LABELS_CHURCH[date.getDay()]}`;
}

export function formatTimeAgo(isoString: string) {
  const date = new Date(isoString);
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "어제";
  if (diffDay < 7) return `${diffDay}일 전`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek}주 전`;

  return `${Math.floor(diffDay / 30)}개월 전`;
}

export function avatarFallback(name: string) {
  return `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(name)}`;
}

export function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
