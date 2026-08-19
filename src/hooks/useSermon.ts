"use client";

import { useQuery } from "@tanstack/react-query";

export interface SermonSongRow {
  id: string;
  sermon_id: string;
  song_id: string | null;
  musical_key: string | null;
  title: string;
  sheet_url: string | null;
  display_order: number;
}

export interface SermonDetailData {
  id: string;
  category_label: string | null;
  title: string;
  reference: string | null;
  preacher: string | null;
  sermon_date: string;
  quote: string | null;
  summary_paragraphs: string[];
  sharing_questions: { id: number; question: string }[];
  sermonSongs: SermonSongRow[];
}

async function fetchSermon(id: string): Promise<SermonDetailData> {
  const response = await fetch(`/api/admin/sermons/${id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "설교를 불러오지 못했어요.");
  }

  return response.json();
}

export function useSermon(id: string) {
  return useQuery({
    queryKey: ["admin", "sermon", id],
    queryFn: () => fetchSermon(id),
    enabled: Boolean(id),
  });
}
