import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CalendarDay,
  CalendarEventDot,
  CalendarMonthData,
  ScheduleEvent,
} from "@/lib/mock-data";
import { WEEKDAY_LABELS, avatarFallback, monthDayOf, toDateString } from "./utils";

export interface CalendarPageData {
  profileImageUrl: string;
  calendarMonth: CalendarMonthData;
  selectedDateLabel: string;
  scheduleEvents: ScheduleEvent[];
}

async function fetchMonthDots(
  supabase: SupabaseClient,
  year: number,
  month: number,
) {
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const monthEnd = `${nextMonth.y}-${String(nextMonth.m).padStart(2, "0")}-01`;

  // 생일은 profiles에 birth_date 컬럼이 없어 events(type='birthday')로만 표시한다.
  const { data: events } = await supabase
    .from("events")
    .select("event_date, type")
    .gte("event_date", monthStart)
    .lt("event_date", monthEnd);

  const dotMap = new Map<number, Set<CalendarEventDot>>();

  for (const event of events ?? []) {
    const { day } = monthDayOf(event.event_date);
    const dot: CalendarEventDot = event.type === "birthday" ? "birthday" : "church";
    if (!dotMap.has(day)) dotMap.set(day, new Set());
    dotMap.get(day)!.add(dot);
  }

  return dotMap;
}

function buildCalendarMonth(
  year: number,
  month: number,
  dotMap: Map<number, Set<CalendarEventDot>>,
  todayDate: number,
): CalendarMonthData {
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
      isSelected: d === todayDate,
      dots: dots && dots.size > 0 ? Array.from(dots) : undefined,
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

async function fetchTodaySchedule(
  supabase: SupabaseClient,
  todayStr: string,
): Promise<ScheduleEvent[]> {
  const { data: events } = await supabase
    .from("events")
    .select("id, title, description, location, start_time, type")
    .eq("event_date", todayStr)
    .order("start_time", { ascending: true });

  return (events ?? []).map((event) => ({
    id: event.id,
    type: event.type === "birthday" ? "birthday" : "church",
    title: event.title,
    subtitle: event.location ?? event.description ?? "",
    time: event.start_time ? event.start_time.slice(0, 5) : undefined,
  }));
}

export async function fetchCalendarPageData(
  supabase: SupabaseClient,
): Promise<CalendarPageData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const todayStr = toDateString(now);

  const [{ data: profile }, dotMap, scheduleEvents] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    fetchMonthDots(supabase, year, month),
    fetchTodaySchedule(supabase, todayStr),
  ]);

  return {
    profileImageUrl:
      profile?.avatar_url ?? avatarFallback(profile?.name ?? "성도"),
    calendarMonth: buildCalendarMonth(year, month, dotMap, now.getDate()),
    selectedDateLabel: `${month}월 ${now.getDate()}일 일정`,
    scheduleEvents,
  };
}
