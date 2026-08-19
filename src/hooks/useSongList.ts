"use client";

import { useQuery } from "@tanstack/react-query";

export interface SongListItem {
  id: string;
  song_id: string;
  song_date: string;
  reason: string | null;
  songs: {
    title: string;
    artist: string | null;
  } | null;
}

async function fetchSongList(): Promise<SongListItem[]> {
  const response = await fetch("/api/admin/songs");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "찬양 목록을 불러오지 못했어요.");
  }

  const data = await response.json();
  return data.items ?? [];
}

export function useSongList() {
  return useQuery({
    queryKey: ["admin", "songList"],
    queryFn: fetchSongList,
  });
}
