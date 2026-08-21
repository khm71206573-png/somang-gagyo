import type { ScheduleEventType } from "@/lib/mock-data";

export interface EventCategoryMeta {
  value: ScheduleEventType;
  label: string;
  /** 달력 점 색 */
  dotClassName: string;
  /** 일정 카드 라벨 색 */
  textClassName: string;
}

export const EVENT_CATEGORIES: EventCategoryMeta[] = [
  {
    value: "church",
    label: "교회일정",
    dotClassName: "bg-primary",
    textClassName: "text-primary",
  },
  {
    value: "gagyo",
    label: "가교일정",
    dotClassName: "bg-cta",
    textClassName: "text-cta",
  },
  {
    value: "birthday",
    label: "생일",
    dotClassName: "bg-secondary",
    textClassName: "text-secondary",
  },
  {
    value: "other",
    label: "기타",
    dotClassName: "bg-tertiary",
    textClassName: "text-tertiary",
  },
];

const BY_VALUE = new Map(EVENT_CATEGORIES.map((item) => [item.value, item]));

export function eventCategory(value: ScheduleEventType): EventCategoryMeta {
  return BY_VALUE.get(value) ?? EVENT_CATEGORIES[0];
}
