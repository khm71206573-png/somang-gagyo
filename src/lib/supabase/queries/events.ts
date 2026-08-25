import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingColumnError } from "@/lib/supabase/errors";
import {
  expandEventDates,
  toEventRepeatType,
  type EventRepeatType,
} from "@/lib/eventRecurrence";

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string | null;
  type: string;
  event_date: string;
  repeat_type: EventRepeatType;
  repeat_until: string | null;
}

const BASE_COLUMNS =
  "id, title, description, location, start_time, type, event_date";

/**
 * [windowStart, windowEnd] 구간에 걸릴 수 있는 일정 행을 가져온다.
 * 반복 일정은 시작일이 창보다 앞서도 창 안에서 열릴 수 있으므로,
 * "창 끝 이전에 시작한 반복 일정"과 "창 안의 단일 일정"을 함께 가져온 뒤
 * 실제 날짜 계산은 expandEventDates가 맡는다.
 *
 * 반복 컬럼이 아직 없는 DB에서는 예전처럼 단일 일정만 조회한다.
 */
export async function fetchEventsInWindow(
  supabase: SupabaseClient,
  windowStart: string,
  windowEnd: string,
): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("events")
    .select(`${BASE_COLUMNS}, repeat_type, repeat_until`)
    .lte("event_date", windowEnd)
    .or(`event_date.gte.${windowStart},repeat_type.neq.none`)
    .order("start_time", { ascending: true });

  if (!error) {
    return (data ?? [])
      .map((row) => ({
        ...row,
        repeat_type: toEventRepeatType(row.repeat_type),
        repeat_until: (row.repeat_until as string | null) ?? null,
      }))
      .filter(
        (row) =>
          // 종료된 반복 일정은 여기서 걸러 창 계산을 가볍게 한다.
          !row.repeat_until || row.repeat_until >= windowStart,
      ) as EventRow[];
  }

  if (!isMissingColumnError(error)) return [];

  const { data: legacy } = await supabase
    .from("events")
    .select(BASE_COLUMNS)
    .gte("event_date", windowStart)
    .lte("event_date", windowEnd)
    .order("start_time", { ascending: true });

  return (legacy ?? []).map((row) => ({
    ...row,
    repeat_type: "none" as const,
    repeat_until: null,
  })) as EventRow[];
}

export interface EventOccurrence {
  date: string;
  event: EventRow;
}

/** 창 안에서 실제로 열리는 (날짜, 일정) 목록을 날짜순으로 만든다. */
export function expandEventRows(
  rows: EventRow[],
  windowStart: string,
  windowEnd: string,
): EventOccurrence[] {
  const occurrences: EventOccurrence[] = [];

  for (const row of rows) {
    const dates = expandEventDates(
      {
        eventDate: row.event_date,
        repeatType: row.repeat_type,
        repeatUntil: row.repeat_until,
      },
      windowStart,
      windowEnd,
    );

    for (const date of dates) {
      occurrences.push({ date, event: row });
    }
  }

  return occurrences.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return (a.event.start_time ?? "").localeCompare(b.event.start_time ?? "");
  });
}
