"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchBibleProgressData } from "@/lib/supabase/queries/bibleProgress";

/**
 * @param selectedMemberPlanId 통독탭에서 고른 플랜. 없으면 첫 번째 플랜을 보여준다.
 */
export function useBibleProgressData(selectedMemberPlanId?: string | null) {
  return useQuery({
    queryKey: ["bible-progress", selectedMemberPlanId ?? null],
    queryFn: () => fetchBibleProgressData(createClient(), selectedMemberPlanId),
    staleTime: 30 * 1000,
  });
}
