"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function consumeSermonDraft(id: string) {
  const response = await fetch(`/api/admin/sermon-drafts/${id}`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "설교 초안 처리에 실패했어요.");
  }

  return response.json();
}

export function useConsumeSermonDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: consumeSermonDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}
