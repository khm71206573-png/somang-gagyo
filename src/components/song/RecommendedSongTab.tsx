"use client";

import { SongHero } from "@/components/song/SongHero";
import { SongLyrics } from "@/components/song/SongLyrics";
import { PastSongsScroll } from "@/components/song/PastSongsScroll";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useSongPageData } from "@/hooks/useSongPageData";

export function RecommendedSongTab() {
  const { data, isLoading, isError, error, refetch, isFetching } = useSongPageData();

  if (isLoading) {
    return <LoadingState inline />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        inline
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!data.songDetail) {
    return (
      <p className="py-stack-lg text-center text-body-md text-muted-foreground">
        오늘 추천된 찬양이 아직 없어요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-stack-lg">
      <SongHero song={data.songDetail} />
      {data.songDetail.lyrics.length > 0 && (
        <SongLyrics stanzas={data.songDetail.lyrics} />
      )}
      {data.pastSongs.length > 0 && <PastSongsScroll songs={data.pastSongs} />}
    </div>
  );
}
