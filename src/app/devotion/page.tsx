"use client";

import { DevotionTopBar } from "@/components/devotion/DevotionTopBar";
import { ScriptureHeading } from "@/components/devotion/ScriptureHeading";
import { ScriptureCard } from "@/components/devotion/ScriptureCard";
import { ReflectionQuestions } from "@/components/devotion/ReflectionQuestions";
import { ReflectionInput } from "@/components/devotion/ReflectionInput";
import { SharedReflections } from "@/components/devotion/SharedReflections";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { reflectionQuestions } from "@/lib/mock-data";
import { useDevotionPageData } from "@/hooks/useDevotionPageData";

export default function DevotionDetailPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDevotionPageData();

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
    return <EmptyState message="등록된 묵상이 아직 없어요." />;
  }

  const { devotion, sharedReflections, participantCount } = data;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <DevotionTopBar />
      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-sm">
        <ScriptureHeading devotion={devotion} />
        <ScriptureCard verses={devotion.verses} />
        <ReflectionQuestions questions={reflectionQuestions} />
        <ReflectionInput />
        <SharedReflections
          reflections={sharedReflections}
          participantCount={participantCount}
        />
      </main>
      <BottomNav active="묵상" />
    </div>
  );
}
