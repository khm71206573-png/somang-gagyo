"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BiblePlanTopBar } from "@/components/bible-plan/BiblePlanTopBar";
import { BiblePlanFilterChips } from "@/components/bible-plan/BiblePlanFilterChips";
import { BiblePlanCard } from "@/components/bible-plan/BiblePlanCard";
import { BiblePlanStartBar } from "@/components/bible-plan/BiblePlanStartBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { biblePlanFilters, activeBiblePlanFilterId } from "@/lib/mock-data";
import { matchesBiblePlanFilter } from "@/lib/biblePlanFilters";
import { useBiblePlanList } from "@/hooks/useBiblePlanList";
import { useStartBiblePlan } from "@/hooks/useStartBiblePlan";
import { toDateString } from "@/lib/supabase/queries/utils";
import { rememberSelectedPlanId } from "@/lib/biblePlanSelection";

export default function BiblePlanSelectPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useBiblePlanList();
  const { mutateAsync: startPlan, isPending } = useStartBiblePlan();

  const [activeFilterId, setActiveFilterId] = useState(activeBiblePlanFilterId);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => toDateString(new Date()));
  const [startError, setStartError] = useState<string | null>(null);

  const visiblePlans = useMemo(
    () => (data ?? []).filter((plan) => matchesBiblePlanFilter(plan, activeFilterId)),
    [data, activeFilterId],
  );

  const selectedPlan = data?.find((plan) => plan.id === selectedPlanId) ?? null;

  async function handleStart() {
    if (!selectedPlanId) return;
    setStartError(null);

    try {
      const memberPlanId = await startPlan({ planId: selectedPlanId, startedAt });
      // 새로 추가한 플랜이 통독탭에서 바로 열리게 한다.
      rememberSelectedPlanId(memberPlanId);
      router.push("/bible-progress");
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : "통독 플랜을 시작하지 못했어요.",
      );
    }
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background pb-[160px]">
      <BiblePlanTopBar />
      <BiblePlanFilterChips
        chips={biblePlanFilters}
        activeChipId={activeFilterId}
        onChipChange={setActiveFilterId}
      />
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : visiblePlans.length === 0 ? (
        <p className="mt-stack-md px-margin-main text-center text-body-md text-muted-foreground">
          {data.length === 0
            ? "등록된 통독 플랜이 없어요."
            : "조건에 맞는 플랜이 없어요."}
        </p>
      ) : (
        <main className="mt-stack-md flex flex-1 flex-col gap-4 px-margin-main pb-stack-lg">
          {visiblePlans.map((plan) => (
            <BiblePlanCard
              key={plan.id}
              plan={plan}
              isSelected={plan.id === selectedPlanId}
              onSelect={setSelectedPlanId}
            />
          ))}
        </main>
      )}
      <BiblePlanStartBar
        selectedPlanTitle={selectedPlan?.title ?? null}
        startedAt={startedAt}
        onStartedAtChange={setStartedAt}
        onStart={handleStart}
        isPending={isPending}
        error={startError}
      />
    </div>
  );
}
