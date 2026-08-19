"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface TriggerDevotionScrapeResult {
  ok: true;
  inserted?: true;
  devotionDate?: string;
  skipped?: true;
  reason?: string;
}

async function triggerDevotionScrape(): Promise<TriggerDevotionScrapeResult> {
  const response = await fetch("/api/admin/scrape-devotion", {
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "오늘의 묵상을 가져오지 못했어요.");
  }

  return response.json();
}

export function useTriggerDevotionScrape() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerDevotionScrape,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "devotionList"] });
    },
  });
}
