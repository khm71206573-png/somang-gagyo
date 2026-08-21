"use client";

import { BibleProgressTopBar } from "@/components/bible-progress/BibleProgressTopBar";
import { PlanSelectorChip } from "@/components/bible-progress/PlanSelectorChip";
import { ProgressSummaryCard } from "@/components/bible-progress/ProgressSummaryCard";
import { MissedPortionAlert } from "@/components/bible-progress/MissedPortionAlert";
import { TodayPortionCard } from "@/components/bible-progress/TodayPortionCard";
import { WeekTracker } from "@/components/bible-progress/WeekTracker";
import { ReadingTogetherCard } from "@/components/bible-progress/ReadingTogetherCard";
import { OverallProgressSection } from "@/components/bible-progress/OverallProgressSection";
import { ResetProgressSection } from "@/components/bible-progress/ResetProgressSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useState } from "react";
import { useBibleProgressData } from "@/hooks/useBibleProgressData";
import { useCompleteReading } from "@/hooks/useCompleteReading";

export default function BibleProgressPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useBibleProgressData();
  const { mutate: completeReading, isPending } = useCompleteReading();
  const [completeError, setCompleteError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        message="아직 시작한 통독 플랜이 없어요."
        actionLabel="플랜 선택하러 가기"
        actionHref="/bible-plan-select"
      />
    );
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[100px]">
      <BibleProgressTopBar />
      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-lg">
        <PlanSelectorChip label={data.planLabel} />
        <ProgressSummaryCard summary={data.summary} />
        {data.missedAlert && (
          <MissedPortionAlert
            alert={data.missedAlert}
            memberPlanId={data.memberPlanId}
          />
        )}
        {data.todayPortion && (
          <TodayPortionCard
            portion={data.todayPortion}
            completedToday={data.completedToday}
            isPending={isPending}
            error={completeError}
            onToggleComplete={() => {
              setCompleteError(null);
              completeReading(
                {
                  memberPlanId: data.memberPlanId,
                  planDayId: data.todayPortion!.planDayId,
                  currentDay: data.currentDay,
                  totalDays: data.totalDays,
                  isCompleted: data.todayPortion!.isCompleted,
                },
                {
                  onError: (err) =>
                    setCompleteError(
                      err instanceof Error ? err.message : "저장하지 못했어요.",
                    ),
                },
              );
            }}
          />
        )}
        <WeekTracker days={data.weekTracker} />
        {data.readingTogether && (
          <ReadingTogetherCard data={data.readingTogether} />
        )}
        <OverallProgressSection
          oldTestament={data.oldTestament}
          newTestament={data.newTestament}
        />
        <ResetProgressSection memberPlanId={data.memberPlanId} />
      </main>
      <BottomNav active="통독" />
    </div>
  );
}
