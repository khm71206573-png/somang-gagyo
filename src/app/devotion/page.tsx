"use client";

import { useState } from "react";
import { DevotionTopBar } from "@/components/devotion/DevotionTopBar";
import { DevotionSourceTabs } from "@/components/devotion/DevotionSourceTabs";
import { ScriptureHeading } from "@/components/devotion/ScriptureHeading";
import { ScriptureCard } from "@/components/devotion/ScriptureCard";
import { CommentaryCard } from "@/components/devotion/CommentaryCard";
import { ReflectionQuestions } from "@/components/devotion/ReflectionQuestions";
import { PrayerCard } from "@/components/devotion/PrayerCard";
import { FootnoteList } from "@/components/devotion/FootnoteList";
import { ReflectionInput } from "@/components/devotion/ReflectionInput";
import { SharedReflections } from "@/components/devotion/SharedReflections";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useDevotionPageData } from "@/hooks/useDevotionPageData";
import { defaultDevotionQuestions } from "@/lib/devotionQuestions";
import type { DevotionSource } from "@/lib/devotionSource";

export default function DevotionDetailPage() {
  // 고르기 전에는 서버가 정한 기본 출처(매일성경 우선)를 따른다.
  const [selectedSource, setSelectedSource] = useState<DevotionSource>();
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDevotionPageData(selectedSource);

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

  const {
    devotionId,
    devotion,
    source,
    availableSources,
    sharedReflections,
    participantCount,
  } = data;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <DevotionTopBar
        shareTitle={devotion.reference}
        shareText={`[오늘의 묵상] ${devotion.title}\n${devotion.reference}`}
      />
      <DevotionSourceTabs
        sources={availableSources}
        activeSource={source}
        onSelect={setSelectedSource}
      />
      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-md">
        <ScriptureHeading devotion={devotion} />
        <ScriptureCard verses={devotion.verses} />
        <CommentaryCard sections={devotion.commentary} />
        <ReflectionQuestions
          questions={
            devotion.questions.length > 0
              ? devotion.questions
              : defaultDevotionQuestions()
          }
        />
        <PrayerCard prayer={devotion.prayer} practice={devotion.practice} />
        <FootnoteList footnotes={devotion.footnotes} />
        <ReflectionInput devotionId={devotionId} />
        <SharedReflections
          reflections={sharedReflections}
          participantCount={participantCount}
        />
      </main>
      <BottomNav active="묵상" />
    </div>
  );
}
