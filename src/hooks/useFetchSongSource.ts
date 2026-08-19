"use client";

import { useMutation } from "@tanstack/react-query";

export interface SongSource {
  title: string;
  artist: string;
  coverImageUrl: string;
  youtubeUrl: string;
}

async function fetchSongSource(): Promise<SongSource> {
  const response = await fetch("/api/admin/songs/fetch-source", {
    method: "POST",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? "유튜브 좋아요 목록을 가져오지 못했어요.");
  }

  return data;
}

export function useFetchSongSource() {
  return useMutation({
    mutationFn: fetchSongSource,
  });
}
