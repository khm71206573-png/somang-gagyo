"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchCalendarPageData } from "@/lib/supabase/queries/calendar";

export function useCalendarPageData() {
  return useQuery({
    queryKey: ["calendar"],
    queryFn: () => fetchCalendarPageData(createClient()),
    staleTime: 60 * 1000,
  });
}
