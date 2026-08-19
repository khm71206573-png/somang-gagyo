"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteSermon(id: string) {
  const response = await fetch(`/api/admin/sermons/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "설교 삭제에 실패했어요.");
  }

  return response.json();
}

export function useDeleteSermon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSermon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
