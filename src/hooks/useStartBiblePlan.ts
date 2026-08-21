"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface StartBiblePlanInput {
  planId: string;
  /** yyyy-mm-dd */
  startedAt: string;
}

async function startBiblePlan({ planId, startedAt }: StartBiblePlanInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요해요.");
  }

  // 통독은 한 번에 하나만 진행한다. 기존 플랜은 비활성으로 내린다.
  const { error: deactivateError } = await supabase
    .from("member_plans")
    .update({ is_active: false })
    .eq("member_id", user.id)
    .eq("is_active", true);

  if (deactivateError) {
    throw new Error(deactivateError.message ?? "기존 플랜 정리에 실패했어요.");
  }

  const { error } = await supabase.from("member_plans").insert({
    member_id: user.id,
    plan_id: planId,
    started_at: startedAt,
    current_day: 1,
    is_active: true,
  });

  if (error) {
    throw new Error(error.message ?? "통독 플랜을 시작하지 못했어요.");
  }
}

export function useStartBiblePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startBiblePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-progress"] });
      queryClient.invalidateQueries({ queryKey: ["bible-plans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
