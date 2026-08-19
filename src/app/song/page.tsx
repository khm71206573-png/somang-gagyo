"use client";

import { SongTopBar } from "@/components/song/SongTopBar";
import { SongHero } from "@/components/song/SongHero";
import { SongReasonCard } from "@/components/song/SongReasonCard";
import { SongLyrics } from "@/components/song/SongLyrics";
import { PastSongsScroll } from "@/components/song/PastSongsScroll";
import { BottomNav } from "@/components/layout/BottomNav";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useSongPageData } from "@/hooks/useSongPageData";

export default function SongPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useSongPageData();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!data.songDetail) {
    return <EmptyState message="오늘 추천된 찬양이 아직 없어요." />;
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-24">
      <SongTopBar />
      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-lg">
        <SongHero song={data.songDetail} />
        <SongReasonCard reason={data.songDetail.reason} />
        <SongLyrics stanzas={data.songDetail.lyrics} />
        <PastSongsScroll songs={data.pastSongs} />
      </main>
      <BottomNav />
    </div>
  );
}
