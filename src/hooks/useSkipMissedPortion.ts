"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchExpectedDayInfo } from "@/lib/supabase/queries/reading-plan";

/**
 * 밀린 날짜는 건너뛰고 오늘 일차부터 다시 시작한다.
 * 건너뛴 날은 완독 기록으로 남지 않는다 (진행표에는 "읽기 전"으로 남는다).
 */
async function skipMissedPortion(memberPlanId: string) {
  const supabase = createClient();
  const info = await fetchExpectedDayInfo(supabase, memberPlanId);

  if (!info || info.expectedDay <= info.currentDay) {
    return;
  }

  const { error } = await supabase
    .from("member_plans")
    .update({ current_day: info.expectedDay })
    .eq("id", memberPlanId);

  if (error) {
    throw new Error(error.message ?? "다시 시작하지 못했어요.");
  }
}

export function useSkipMissedPortion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: skipMissedPortion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
