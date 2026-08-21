"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchGroupPageData } from "@/lib/supabase/queries/group";

export function useGroupPageData(selectedDate?: string) {
  return useQuery({
    // 날짜별로 따로 캐시해 달력에서 날짜를 바꿀 때마다 해당 자료를 받아온다.
    queryKey: ["group", selectedDate ?? "today"],
    queryFn: () => fetchGroupPageData(createClient(), selectedDate),
    staleTime: 60 * 1000,
  });
}
