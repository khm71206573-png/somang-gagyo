"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface TriggerSongSyncResult {
  ok: true;
  inserted?: true;
  youtubeUrl?: string;
  skipped?: true;
  reason?: string;
}

async function triggerSongSync(): Promise<TriggerSongSyncResult> {
  const response = await fetch("/api/admin/sync-song", {
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "유튜브 좋아요 목록을 동기화하지 못했어요.");
  }

  return response.json();
}

export function useTriggerSongSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerSongSync,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "songList"] });
    },
  });
}
