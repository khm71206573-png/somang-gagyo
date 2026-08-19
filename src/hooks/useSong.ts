"use client";

import { useQuery } from "@tanstack/react-query";

export interface SongDetailData {
  id: string;
  song_id: string;
  song_date: string;
  reason: string | null;
  title: string;
  artist: string | null;
  cover_image_url: string | null;
  youtube_url: string | null;
  lyrics: { lines: string[]; highlighted?: boolean }[];
}

async function fetchSong(id: string): Promise<SongDetailData> {
  const response = await fetch(`/api/admin/songs/${id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "찬양을 불러오지 못했어요.");
  }

  return response.json();
}

export function useSong(id: string) {
  return useQuery({
    queryKey: ["admin", "song", id],
    queryFn: () => fetchSong(id),
    enabled: Boolean(id),
  });
}
