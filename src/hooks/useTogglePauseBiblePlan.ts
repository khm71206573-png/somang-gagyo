"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toDateString, toMidnight } from "@/lib/supabase/queries/utils";

export interface TogglePauseBiblePlanInput {
  memberPlanId: string;
  /** 지금 일시중지 상태인지. true면 다시 시작하고, false면 일시중지한다. */
  isPaused: boolean;
}

const UNDEFINED_COLUMN = "42703";
const MIGRATION_MESSAGE =
  "일시중지 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요.";

/**
 * 통독 플랜을 일시중지하거나 다시 시작한다.
 *
 * 일시중지: paused_at에 오늘을 적어 둔다. 그날 이후로는 "며칠차여야 하는지"를
 * 오늘이 아니라 paused_at 기준으로 세기 때문에 밀린 분량이 쌓이지 않는다.
 * 다시 시작: 쉬었던 날수만큼 started_at을 뒤로 밀어 중단한 지점에서 이어간다.
 */
async function togglePauseBiblePlan({
  memberPlanId,
  isPaused,
}: TogglePauseBiblePlanInput) {
  const supabase = createClient();

  if (!isPaused) {
    const { error } = await supabase
      .from("member_plans")
      .update({ paused_at: toDateString(new Date()) })
      .eq("id", memberPlanId);

    if (error) {
      throw new Error(
        error.code === UNDEFINED_COLUMN
          ? MIGRATION_MESSAGE
          : (error.message ?? "일시중지하지 못했어요."),
      );
    }
    return;
  }

  const { data: plan, error: readError } = await supabase
    .from("member_plans")
    .select("started_at, paused_at")
    .eq("id", memberPlanId)
    .maybeSingle();

  if (readError) {
    throw new Error(
      readError.code === UNDEFINED_COLUMN
        ? MIGRATION_MESSAGE
        : (readError.message ?? "통독 정보를 불러오지 못했어요."),
    );
  }

  if (!plan?.paused_at) {
    throw new Error("일시중지 상태가 아니에요.");
  }

  const pausedDays = Math.max(
    Math.floor(
      (toMidnight(new Date()).getTime() -
        toMidnight(new Date(`${plan.paused_at}T00:00:00`)).getTime()) / 86400000,
    ),
    0,
  );

  const resumedStart = new Date(`${plan.started_at}T00:00:00`);
  resumedStart.setDate(resumedStart.getDate() + pausedDays);

  const { error } = await supabase
    .from("member_plans")
    .update({ started_at: toDateString(resumedStart), paused_at: null })
    .eq("id", memberPlanId);

  if (error) {
    throw new Error(error.message ?? "다시 시작하지 못했어요.");
  }
}

export function useTogglePauseBiblePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: togglePauseBiblePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
