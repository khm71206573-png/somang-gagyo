"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteSheetMusic(id: string) {
  const response = await fetch(`/api/admin/sermon-songs/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "악보 삭제에 실패했어요.");
  }

  return response.json();
}

export function useDeleteSheetMusic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSheetMusic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
