"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchCalendarPageData } from "@/lib/supabase/queries/calendar";

export function useCalendarPageData(selectedDate?: string) {
  return useQuery({
    // 날짜를 바꿀 때마다 그 날 일정과 해당 달의 표시를 다시 받아온다.
    queryKey: ["calendar", selectedDate ?? "today"],
    queryFn: () => fetchCalendarPageData(createClient(), selectedDate),
    staleTime: 60 * 1000,
  });
}
