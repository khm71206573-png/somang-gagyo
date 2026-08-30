"use client";

import { useQuery } from "@tanstack/react-query";

export interface DevotionListItem {
  id: string;
  devotion_date: string;
  source: string | null;
  tag: string | null;
  title: string;
  reference: string;
  verses: { number: number; text: string }[];
}

async function fetchDevotionList(): Promise<DevotionListItem[]> {
  const response = await fetch("/api/admin/devotions");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "묵상 목록을 불러오지 못했어요.");
  }

  const data = await response.json();
  return data.items ?? [];
}

export function useDevotionList() {
  return useQuery({
    queryKey: ["admin", "devotionList"],
    queryFn: fetchDevotionList,
  });
}
