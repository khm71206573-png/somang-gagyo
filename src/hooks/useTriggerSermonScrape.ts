"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface TriggerSermonScrapeResult {
  ok: true;
  inserted?: true;
  draftId?: string;
  skipped?: true;
  reason?: string;
}

async function triggerSermonScrape(): Promise<TriggerSermonScrapeResult> {
  const response = await fetch("/api/admin/scrape-sermon", {
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "새 설교안을 확인하지 못했어요.");
  }

  return response.json();
}

export function useTriggerSermonScrape() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerSermonScrape,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "sermonDrafts"] });
    },
  });
}
