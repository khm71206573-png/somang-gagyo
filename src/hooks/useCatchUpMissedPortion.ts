"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchExpectedDayInfo } from "@/lib/supabase/queries/reading-plan";

/**
 * 밀린 날짜를 모두 읽은 것으로 표시하고 오늘 일차로 진행을 옮긴다.
 * 오늘 분량은 건드리지 않는다 — 그건 여전히 "읽었어요" 버튼으로 따로 체크한다.
 */
async function catchUpMissedPortion(memberPlanId: string) {
  const supabase = createClient();
  const info = await fetchExpectedDayInfo(supabase, memberPlanId);

  if (!info || info.expectedDay <= info.currentDay) {
    return;
  }

  const missedDayNumbers = Array.from(
    { length: info.expectedDay - info.currentDay },
    (_, i) => info.currentDay + i,
  );

  const { data: missedPlanDays, error: planDaysError } = await supabase
    .from("plan_days")
    .select("id")
    .eq("plan_id", info.planId)
    .in("day_number", missedDayNumbers);

  if (planDaysError) {
    throw new Error(planDaysError.message ?? "밀린 분량을 확인하지 못했어요.");
  }

  if (missedPlanDays && missedPlanDays.length > 0) {
    // 한 번의 insert에 여러 행을 넣으면 그중 하나라도 unique 위반이면
    // 전체가 롤백된다. upsert + ignoreDuplicates로 이미 기록된 날은
    // 건너뛰고 나머지만 넣는다.
    const { error: insertError } = await supabase.from("reading_logs").upsert(
      missedPlanDays.map((planDay) => ({
        member_plan_id: memberPlanId,
        plan_day_id: planDay.id,
      })),
      { onConflict: "member_plan_id,plan_day_id", ignoreDuplicates: true },
    );

    if (insertError) {
      throw new Error(insertError.message ?? "밀린 분량을 표시하지 못했어요.");
    }
  }

  const { error: planError } = await supabase
    .from("member_plans")
    .update({ current_day: info.expectedDay })
    .eq("id", memberPlanId);

  if (planError) {
    throw new Error(planError.message ?? "진행 상황을 저장하지 못했어요.");
  }
}

export function useCatchUpMissedPortion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catchUpMissedPortion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-progress"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
