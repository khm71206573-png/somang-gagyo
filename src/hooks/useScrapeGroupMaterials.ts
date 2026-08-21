"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export type MaterialResult =
  | { ok: true; saved: true; date: string; imageCount: number; title: string }
  | { ok: true; saved: false; reason: string };

export interface ScrapeGroupMaterialsResult {
  sermon: MaterialResult;
  bulletin: MaterialResult;
}

async function scrapeGroupMaterials(): Promise<ScrapeGroupMaterialsResult> {
  const response = await fetch("/api/admin/group-materials", { method: "POST" });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "교제 자료를 가져오지 못했어요.");
  }

  return response.json();
}

export function useScrapeGroupMaterials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scrapeGroupMaterials,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
