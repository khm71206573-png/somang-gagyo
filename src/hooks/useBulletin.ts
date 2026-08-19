"use client";

import { useQuery } from "@tanstack/react-query";

export interface BulletinDetailData {
  id: string;
  bulletin_date: string;
  image_urls: string[];
}

async function fetchBulletin(id: string): Promise<BulletinDetailData> {
  const response = await fetch(`/api/admin/bulletins/${id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "주보를 불러오지 못했어요.");
  }

  return response.json();
}

export function useBulletin(id: string) {
  return useQuery({
    queryKey: ["admin", "bulletin", id],
    queryFn: () => fetchBulletin(id),
    enabled: Boolean(id),
  });
}
