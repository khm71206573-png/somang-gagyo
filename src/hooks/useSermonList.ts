"use client";

import { useQuery } from "@tanstack/react-query";

export interface SermonListItem {
  id: string;
  category_label: string | null;
  title: string;
  reference: string | null;
  preacher: string | null;
  sermon_date: string;
}

async function fetchSermonList(): Promise<SermonListItem[]> {
  const response = await fetch("/api/admin/sermons");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "설교 목록을 불러오지 못했어요.");
  }

  const data = await response.json();
  return data.items ?? [];
}

export function useSermonList() {
  return useQuery({
    queryKey: ["admin", "sermonList"],
    queryFn: fetchSermonList,
  });
}
