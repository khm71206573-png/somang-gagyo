"use client";

import { useQuery } from "@tanstack/react-query";

export interface YoutubePreview {
  /** 목록에 보여줄 썸네일. 못 알아냈으면 null. */
  thumbnailUrl: string | null;
  title: string | null;
  /** 눌렀을 때 열 주소. 재생목록이면 첫 곡부터 순서대로 재생된다. */
  playUrl: string;
}

async function fetchYoutubePreview(url: string): Promise<YoutubePreview> {
  const response = await fetch(`/api/youtube/preview?url=${encodeURIComponent(url)}`);

  if (!response.ok) {
    throw new Error("유튜브 정보를 불러오지 못했어요.");
  }

  return response.json();
}

/**
 * 재생목록 링크의 썸네일과 재생 주소를 알아온다.
 * 실패해도 화면은 링크 그대로 열리는 카드로 남으니 재시도하지 않는다.
 */
export function useYoutubePreview(url: string | null, enabled = true) {
  return useQuery({
    queryKey: ["youtube-preview", url],
    queryFn: () => fetchYoutubePreview(url as string),
    enabled: Boolean(url) && enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}
