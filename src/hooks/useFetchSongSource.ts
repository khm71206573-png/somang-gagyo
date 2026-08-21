"use client";

import { useMutation } from "@tanstack/react-query";
import type { SongSource } from "@/lib/youtube/resolvePlaylist";

/** 유튜브에서 가져온 곡 정보 (폼 자동 입력용) */
export interface FetchedSong {
  title: string;
  artist: string;
  coverImageUrl: string;
  youtubeUrl: string;
}

async function fetchSongSource(source: SongSource): Promise<FetchedSong> {
  const response = await fetch("/api/admin/songs/fetch-source", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? "유튜브 목록을 가져오지 못했어요.");
  }

  return data;
}

export function useFetchSongSource() {
  return useMutation({
    mutationFn: fetchSongSource,
  });
}
