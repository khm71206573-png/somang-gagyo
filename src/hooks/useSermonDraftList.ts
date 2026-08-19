"use client";

import { useQuery } from "@tanstack/react-query";

export interface SermonDraftListItem {
  id: string;
  source_wr_id: number;
  source_url: string;
  title: string;
  sermon_date: string;
  image_urls: string[];
  consumed_at: string | null;
  created_at: string;
}

async function fetchSermonDraftList(): Promise<SermonDraftListItem[]> {
  const response = await fetch("/api/admin/sermon-drafts");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "설교 초안 목록을 불러오지 못했어요.");
  }

  const data = await response.json();
  return data.items ?? [];
}

export function useSermonDraftList() {
  return useQuery({
    queryKey: ["admin", "sermonDrafts"],
    queryFn: fetchSermonDraftList,
  });
}
