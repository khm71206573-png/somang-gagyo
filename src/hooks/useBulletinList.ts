"use client";

import { useQuery } from "@tanstack/react-query";

export interface BulletinListItem {
  id: string;
  bulletin_date: string;
  image_urls: string[];
}

async function fetchBulletinList(): Promise<BulletinListItem[]> {
  const response = await fetch("/api/admin/bulletins");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "주보 목록을 불러오지 못했어요.");
  }

  const data = await response.json();
  return data.items ?? [];
}

export function useBulletinList() {
  return useQuery({
    queryKey: ["admin", "bulletins"],
    queryFn: fetchBulletinList,
  });
}
