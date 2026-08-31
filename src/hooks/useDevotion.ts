"use client";

import { useQuery } from "@tanstack/react-query";

export interface DevotionDetailData {
  id: string;
  devotion_date: string;
  tag: string | null;
  title: string;
  reference: string;
  verses: { number: number; text: string }[];
  questions: { id: number; question: string }[];
  hymn: string | null;
  commentary: { heading: string; body: string }[] | null;
  prayer: string | null;
  practice: string | null;
  footnotes: { marker: string; text: string; verse: number | null }[] | null;
  image_urls: string[] | null;
}

async function fetchDevotion(id: string): Promise<DevotionDetailData> {
  const response = await fetch(`/api/admin/devotions/${id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "묵상을 불러오지 못했어요.");
  }

  return response.json();
}

export function useDevotion(id: string) {
  return useQuery({
    queryKey: ["admin", "devotion", id],
    queryFn: () => fetchDevotion(id),
    enabled: Boolean(id),
  });
}
