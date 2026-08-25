"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteAnnouncement(id: string) {
  const response = await fetch(`/api/admin/announcements/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "공지 삭제에 실패했어요.");
  }

  return response.json();
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
