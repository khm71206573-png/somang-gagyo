"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toDateString } from "@/lib/supabase/queries/utils";

export interface ResetBiblePlanInput {
  memberPlanId: string;
}

/**
 * 진행 중인 통독 플랜을 처음 상태로 되돌린다.
 * 완독 기록을 모두 지우고 1일차·오늘 시작으로 맞춰, 밀린 분량 알림과
 * 전체 진행표까지 함께 초기화된다. (플랜 자체는 그대로 유지)
 */
async function resetBiblePlan({ memberPlanId }: ResetBiblePlanInput) {
  const supabase = createClient();

  const { error: logError } = await supabase
    .from("reading_logs")
    .delete()
    .eq("member_plan_id", memberPlanId);

  if (logError) {
    throw new Error(logError.message ?? "완독 기록을 지우지 못했어요.");
  }

  const { error: planError } = await supabase
    .from("member_plans")
    .update({ current_day: 1, started_at: toDateString(new Date()) })
    .eq("id", memberPlanId);

  if (planError) {
    throw new Error(planError.message ?? "통독 진행을 초기화하지 못했어요.");
  }
}

export function useResetBiblePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetBiblePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
