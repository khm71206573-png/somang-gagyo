"use client";

import { BibleProgressTopBar } from "@/components/bible-progress/BibleProgressTopBar";
import { PlanTabs } from "@/components/bible-progress/PlanTabs";
import { ProgressSummaryCard } from "@/components/bible-progress/ProgressSummaryCard";
import { MissedPortionAlert } from "@/components/bible-progress/MissedPortionAlert";
import { TodayPortionCard } from "@/components/bible-progress/TodayPortionCard";
import { WeekTracker } from "@/components/bible-progress/WeekTracker";
import { ReadingTogetherCard } from "@/components/bible-progress/ReadingTogetherCard";
import { OverallProgressSection } from "@/components/bible-progress/OverallProgressSection";
import { PlanActionsSection } from "@/components/bible-progress/PlanActionsSection";
import { PausedPlanBanner } from "@/components/bible-progress/PausedPlanBanner";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useEffect, useState } from "react";
import { useBibleProgressData } from "@/hooks/useBibleProgressData";
import { useCompleteReading } from "@/hooks/useCompleteReading";
import {
  readSelectedPlanId,
  rememberSelectedPlanId,
} from "@/lib/biblePlanSelection";

export default function BibleProgressPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useBibleProgressData(selectedPlanId);
  const { mutate: completeReading, isPending } = useCompleteReading();
  const [completeError, setCompleteError] = useState<string | null>(null);

  useEffect(() => {
    const saved = readSelectedPlanId();
    if (saved) setSelectedPlanId(saved);
  }, []);

  // 보던 플랜이 삭제되면 서버가 첫 번째 플랜을 돌려준다. 그 선택을 저장해
  // 다음에 들어올 때 사라진 플랜을 다시 찾지 않게 한다.
  const shownPlanId = data?.memberPlanId ?? null;
  useEffect(() => {
    if (!shownPlanId || !selectedPlanId || shownPlanId === selectedPlanId) return;
    setSelectedPlanId(shownPlanId);
    rememberSelectedPlanId(shownPlanId);
  }, [shownPlanId, selectedPlanId]);

  function handleSelectPlan(memberPlanId: string) {
    setSelectedPlanId(memberPlanId);
    rememberSelectedPlanId(memberPlanId);
  }

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
        <PlanTabs
          tabs={data.planTabs}
          activeMemberPlanId={data.memberPlanId}
          onSelect={handleSelectPlan}
        />
        <ProgressSummaryCard summary={data.summary} />
        {data.isPaused && (
          <PausedPlanBanner
            memberPlanId={data.memberPlanId}
            pausedSinceLabel={data.pausedSinceLabel}
          />
        )}
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
        <PlanActionsSection
          memberPlanId={data.memberPlanId}
          planLabel={data.planLabel}
          isPaused={data.isPaused}
        />
      </main>
      <BottomNav active="통독" />
    </div>
  );
}
