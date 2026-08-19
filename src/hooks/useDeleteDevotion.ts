"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteDevotion(id: string) {
  const response = await fetch(`/api/admin/devotions/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "묵상 삭제에 실패했어요.");
  }

  return response.json();
}

export function useDeleteDevotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDevotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
