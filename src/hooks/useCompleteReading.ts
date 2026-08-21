"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface CompleteReadingInput {
  memberPlanId: string;
  planDayId: string;
  /** 현재 진행 중인 일차 */
  currentDay: number;
  /** 플랜 전체 일수 (마지막 날 이후로 넘어가지 않도록) */
  totalDays: number;
  /** true면 완독 표시를 취소한다 */
  isCompleted: boolean;
}

async function completeReading({
  memberPlanId,
  planDayId,
  currentDay,
  totalDays,
  isCompleted,
}: CompleteReadingInput) {
  const supabase = createClient();

  if (isCompleted) {
    const { error } = await supabase
      .from("reading_logs")
      .delete()
      .eq("member_plan_id", memberPlanId)
      .eq("plan_day_id", planDayId);

    if (error) {
      throw new Error(error.message ?? "완독 표시를 취소하지 못했어요.");
    }

    // 되돌릴 때는 진행 일차도 함께 되돌린다.
    const { error: planError } = await supabase
      .from("member_plans")
      .update({ current_day: Math.max(currentDay - 1, 1) })
      .eq("id", memberPlanId);

    if (planError) {
      throw new Error(planError.message ?? "진행 상황을 되돌리지 못했어요.");
    }
    return;
  }

  const { error } = await supabase.from("reading_logs").insert({
    member_plan_id: memberPlanId,
    plan_day_id: planDayId,
  });

  // 이미 기록된 분량(unique 위반)이면 성공으로 본다.
  if (error && error.code !== "23505") {
    throw new Error(error.message ?? "완독 표시에 실패했어요.");
  }

  const nextDay = totalDays > 0 ? Math.min(currentDay + 1, totalDays) : currentDay + 1;

  const { error: planError } = await supabase
    .from("member_plans")
    .update({ current_day: nextDay })
    .eq("id", memberPlanId);

  if (planError) {
    throw new Error(planError.message ?? "진행 상황을 저장하지 못했어요.");
  }
}

export function useCompleteReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
