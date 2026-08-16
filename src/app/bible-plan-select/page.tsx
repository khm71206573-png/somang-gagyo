"use client";

import { BiblePlanTopBar } from "@/components/bible-plan/BiblePlanTopBar";
import { BiblePlanFilterChips } from "@/components/bible-plan/BiblePlanFilterChips";
import { BiblePlanCard } from "@/components/bible-plan/BiblePlanCard";
import { BiblePlanStartBar } from "@/components/bible-plan/BiblePlanStartBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { biblePlanFilters, activeBiblePlanFilterId } from "@/lib/mock-data";
import { useBiblePlanList } from "@/hooks/useBiblePlanList";

export default function BiblePlanSelectPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useBiblePlanList();

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-background pb-[120px]">
      <BiblePlanTopBar />
      <BiblePlanFilterChips
        chips={biblePlanFilters}
        activeChipId={activeBiblePlanFilterId}
      />
      {isLoading ? (
        <LoadingState />
      ) : isError || !data ? (
        <ErrorState
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      ) : data.length === 0 ? (
        <p className="mt-stack-md px-margin-main text-center text-body-md text-muted-foreground">
          등록된 통독 플랜이 없어요.
        </p>
      ) : (
        <main className="mt-stack-md flex flex-1 flex-col gap-4 px-margin-main pb-stack-lg">
          {data.map((plan) => (
            <BiblePlanCard key={plan.id} plan={plan} />
          ))}
        </main>
      )}
      <BiblePlanStartBar />
    </div>
  );
}
