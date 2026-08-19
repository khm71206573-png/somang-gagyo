"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSongInput } from "@/hooks/useCreateSong";

export interface UpdateSongInput extends CreateSongInput {
  id: string;
}

async function updateSong({ id, ...input }: UpdateSongInput) {
  const response = await fetch(`/api/admin/songs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "찬양 수정에 실패했어요.");
  }

  return response.json();
}

export function useUpdateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["song-page"] });
    },
  });
}
