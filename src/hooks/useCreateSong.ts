"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateSongInput {
  songDate: string;
  title: string;
  artist: string;
  coverImageUrl: string;
  youtubeUrl: string;
  lyrics: string;
  reason: string;
}

async function createSong(input: CreateSongInput) {
  const response = await fetch("/api/admin/songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "찬양 등록에 실패했어요.");
  }

  return response.json();
}

export function useCreateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["song-page"] });
    },
  });
}
