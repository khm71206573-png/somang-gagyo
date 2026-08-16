"use client";

import { BibleProgressTopBar } from "@/components/bible-progress/BibleProgressTopBar";
import { PlanSelectorChip } from "@/components/bible-progress/PlanSelectorChip";
import { ProgressSummaryCard } from "@/components/bible-progress/ProgressSummaryCard";
import { MissedPortionAlert } from "@/components/bible-progress/MissedPortionAlert";
import { TodayPortionCard } from "@/components/bible-progress/TodayPortionCard";
import { WeekTracker } from "@/components/bible-progress/WeekTracker";
import { ReadingTogetherCard } from "@/components/bible-progress/ReadingTogetherCard";
import { OverallProgressSection } from "@/components/bible-progress/OverallProgressSection";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { oldTestamentProgress, newTestamentProgress } from "@/lib/mock-data";
import { useBibleProgressData } from "@/hooks/useBibleProgressData";

export default function BibleProgressPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useBibleProgressData();

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
        {data.missedAlert && <MissedPortionAlert alert={data.missedAlert} />}
        {data.todayPortion && (
          <TodayPortionCard portion={data.todayPortion} />
        )}
        <WeekTracker days={data.weekTracker} />
        {data.readingTogether && (
          <ReadingTogetherCard data={data.readingTogether} />
        )}
        <OverallProgressSection
          oldTestament={oldTestamentProgress}
          newTestament={newTestamentProgress}
        />
      </main>
      <BottomNav active="묵상" />
    </div>
  );
}
