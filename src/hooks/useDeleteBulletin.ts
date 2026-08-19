"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteBulletin(id: string) {
  const response = await fetch(`/api/admin/bulletins/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "주보 삭제에 실패했어요.");
  }

  return response.json();
}

export function useDeleteBulletin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBulletin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
