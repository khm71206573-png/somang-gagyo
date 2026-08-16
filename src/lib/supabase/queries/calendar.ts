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

  const [{ data: events }, { data: members }] = await Promise.all([
    supabase
      .from("events")
      .select("event_date, type")
      .gte("event_date", monthStart)
      .lt("event_date", monthEnd),
    supabase
      .from("members")
      .select("birth_date")
      .eq("status", "approved")
      .not("birth_date", "is", null),
  ]);

  const dotMap = new Map<number, Set<CalendarEventDot>>();

  for (const event of events ?? []) {
    const { day } = monthDayOf(event.event_date);
    const dot: CalendarEventDot = event.type === "birthday" ? "birthday" : "church";
    if (!dotMap.has(day)) dotMap.set(day, new Set());
    dotMap.get(day)!.add(dot);
  }

  for (const member of members ?? []) {
    if (!member.birth_date) continue;
    const { month: birthMonth, day } = monthDayOf(member.birth_date);
    if (birthMonth !== month) continue;
    if (!dotMap.has(day)) dotMap.set(day, new Set());
    dotMap.get(day)!.add("birthday");
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
  const { month: todayMonth, day: todayDay } = monthDayOf(todayStr);

  const [{ data: events }, { data: members }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, description, location, start_time, type")
      .eq("event_date", todayStr)
      .order("start_time", { ascending: true }),
    supabase
      .from("members")
      .select("id, name, profile_image_url, birth_date")
      .eq("status", "approved")
      .not("birth_date", "is", null),
  ]);

  const churchEvents: ScheduleEvent[] = (events ?? []).map((event) => ({
    id: event.id,
    type: event.type === "birthday" ? "birthday" : "church",
    title: event.title,
    subtitle: event.location ?? event.description ?? "",
    time: event.start_time ? event.start_time.slice(0, 5) : undefined,
  }));

  const birthdayEvents: ScheduleEvent[] = (members ?? [])
    .filter((member) => {
      if (!member.birth_date) return false;
      const { month, day } = monthDayOf(member.birth_date);
      return month === todayMonth && day === todayDay;
    })
    .map((member) => ({
      id: `birthday-${member.id}`,
      type: "birthday" as const,
      title: `${member.name}님 생일`,
      subtitle: "축하 메시지를 보내보세요",
      avatarUrl: member.profile_image_url ?? avatarFallback(member.name),
    }));

  return [...churchEvents, ...birthdayEvents];
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

  const [{ data: member }, dotMap, scheduleEvents] = await Promise.all([
    supabase
      .from("members")
      .select("name, profile_image_url")
      .eq("id", user.id)
      .maybeSingle(),
    fetchMonthDots(supabase, year, month),
    fetchTodaySchedule(supabase, todayStr),
  ]);

  return {
    profileImageUrl:
      member?.profile_image_url ?? avatarFallback(member?.name ?? "성도"),
    calendarMonth: buildCalendarMonth(year, month, dotMap, now.getDate()),
    selectedDateLabel: `${month}월 ${now.getDate()}일 일정`,
    scheduleEvents,
  };
}
