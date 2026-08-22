"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface DeleteBiblePlanInput {
  memberPlanId: string;
}

/**
 * 진행 중인 통독 플랜을 통째로 삭제한다.
 * reading_logs는 member_plans를 on delete cascade로 참조하므로 완독 기록도 함께 지워진다.
 * 삭제 후에는 플랜이 없는 상태가 되어 다시 고를 수 있다.
 */
async function deleteBiblePlan({ memberPlanId }: DeleteBiblePlanInput) {
  const supabase = createClient();

  const { error } = await supabase
    .from("member_plans")
    .delete()
    .eq("id", memberPlanId);

  if (error) {
    throw new Error(error.message ?? "통독 플랜을 삭제하지 못했어요.");
  }
}

export function useDeleteBiblePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBiblePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-progress"] });
      queryClient.invalidateQueries({ queryKey: ["bible-plans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
