"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSermonInput } from "@/hooks/useCreateSermon";

export interface UpdateSermonInput extends CreateSermonInput {
  id: string;
}

async function updateSermon({ id, ...input }: UpdateSermonInput) {
  const response = await fetch(`/api/admin/sermons/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "설교 수정에 실패했어요.");
  }

  return response.json();
}

export function useUpdateSermon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSermon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
