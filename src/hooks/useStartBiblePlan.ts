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

  // 여러 플랜을 동시에 진행할 수 있어 기존 플랜은 그대로 두고 새로 추가한다.
  const { data, error } = await supabase
    .from("member_plans")
    .insert({
      member_id: user.id,
      plan_id: planId,
      started_at: startedAt,
      current_day: 1,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    // 23505 = 유니크 위반. 같은 플랜을 이미 진행 중일 때 걸린다.
    if (error.code === "23505") {
      throw new Error("이미 진행 중인 플랜이에요.");
    }
    throw new Error(error.message ?? "통독 플랜을 시작하지 못했어요.");
  }

  return data.id as string;
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
