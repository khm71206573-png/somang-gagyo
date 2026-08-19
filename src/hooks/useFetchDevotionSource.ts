"use client";

import { useMutation } from "@tanstack/react-query";

export interface DevotionSource {
  devotionDate: string;
  title: string;
  reference: string;
  verses: string[];
}

async function fetchDevotionSource(): Promise<DevotionSource> {
  const response = await fetch("/api/admin/devotions/fetch-source", {
    method: "POST",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? "오늘의 묵상을 가져오지 못했어요.");
  }

  return data;
}

export function useFetchDevotionSource() {
  return useMutation({
    mutationFn: fetchDevotionSource,
  });
}
