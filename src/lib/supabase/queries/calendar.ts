import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CalendarDay,
  CalendarEventDot,
  CalendarMonthData,
  ScheduleEvent,
  ScheduleEventType,
} from "@/lib/mock-data";
import { holidayName, holidaysInMonth } from "@/lib/holidays";
import { repeatShortLabel } from "@/lib/eventRecurrence";
import { expandEventRows, fetchEventsInWindow, type EventOccurrence } from "./events";
import { WEEKDAY_LABELS, avatarFallback, monthDayOf, toDateString } from "./utils";

export interface CalendarPageData {
  profileImageUrl: string;
  calendarMonth: CalendarMonthData;
  selectedDateLabel: string;
  /** 선택한 날짜가 공휴일이면 이름 */
  selectedHolidayName: string | null;
  scheduleEvents: ScheduleEvent[];
}

const VALID_TYPES: ScheduleEventType[] = ["church", "gagyo", "birthday", "other"];

function toEventType(value: unknown): ScheduleEventType {
  return VALID_TYPES.includes(value as ScheduleEventType)
    ? (value as ScheduleEventType)
    : "church";
}

/** 반복 일정까지 펼친 뒤 날짜별 점을 모은다. */
function buildDotMap(occurrences: EventOccurrence[]) {
  const dotMap = new Map<number, Set<CalendarEventDot>>();

  for (const occurrence of occurrences) {
    const { day } = monthDayOf(occurrence.date);
    if (!dotMap.has(day)) dotMap.set(day, new Set());
    dotMap.get(day)!.add(toEventType(occurrence.event.type));
  }

  return dotMap;
}

function buildCalendarMonth(
  year: number,
  month: number,
  dotMap: Map<number, Set<CalendarEventDot>>,
  selectedDate: number | null,
): CalendarMonthData {
  const holidayMap = holidaysInMonth(year, month);
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const days: CalendarDay[] = [];

  for (let i = firstWeekday - 1; i >= 0; i--) {
    days.push({ date: daysInPrevMonth - i, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dots = dotMap.get(d);
    days.push({
      date: d,
      isCurrentMonth: true,
      isSelected: d === selectedDate,
      dots: dots && dots.size > 0 ? Array.from(dots) : undefined,
      holidayName: holidayMap.get(d),
    });
  }

  const remainder = days.length % 7;
  if (remainder !== 0) {
    for (let d = 1; d <= 7 - remainder; d++) {
      days.push({ date: d, isCurrentMonth: false });
    }
  }

  return {
    label: `${year}년 ${month}월`,
    weekdayLabels: WEEKDAY_LABELS,
    days,
  };
}

/** 하루치 일정 목록 (반복 일정 포함) */
function buildScheduleFor(
  occurrences: EventOccurrence[],
  dateStr: string,
): ScheduleEvent[] {
  return occurrences
    .filter((occurrence) => occurrence.date === dateStr)
    .map(({ event }) => ({
      id: event.id,
      type: toEventType(event.type),
      title: event.title,
      subtitle: event.location ?? event.description ?? "",
      time: event.start_time ? event.start_time.slice(0, 5) : undefined,
      repeatLabel: repeatShortLabel(event.repeat_type) ?? undefined,
    }));
}

/**
 * 달력 화면 데이터를 가져온다.
 * selectedDate(yyyy-mm-dd)를 주면 그 날짜가 속한 달을 보여주고 그 날의 일정을 반환한다.
 */
export async function fetchCalendarPageData(
  supabase: SupabaseClient,
  selectedDate?: string,
): Promise<CalendarPageData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const target = selectedDate
    ? new Date(`${selectedDate}T00:00:00`)
    : new Date();
  const year = target.getFullYear();
  const month = target.getMonth() + 1;
  const dateStr = toDateString(target);

  // 이 달 전체를 한 번에 가져와 달력 점과 그날 일정 목록을 함께 만든다.
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const monthEnd = toDateString(new Date(year, month, 0));

  const [{ data: profile }, eventRows] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    fetchEventsInWindow(supabase, monthStart, monthEnd),
  ]);

  const occurrences = expandEventRows(eventRows, monthStart, monthEnd);
  const dotMap = buildDotMap(occurrences);
  const scheduleEvents = buildScheduleFor(occurrences, dateStr);

  return {
    profileImageUrl:
      profile?.avatar_url ?? avatarFallback(profile?.name ?? "성도"),
    calendarMonth: buildCalendarMonth(year, month, dotMap, target.getDate()),
    selectedDateLabel: `${month}월 ${target.getDate()}일 일정`,
    selectedHolidayName: holidayName(dateStr),
    scheduleEvents,
  };
}
