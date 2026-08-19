"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateDevotionInput } from "@/hooks/useCreateDevotion";

export interface UpdateDevotionInput extends CreateDevotionInput {
  id: string;
}

async function updateDevotion({ id, ...input }: UpdateDevotionInput) {
  const response = await fetch(`/api/admin/devotions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "묵상 수정에 실패했어요.");
  }

  return response.json();
}

export function useUpdateDevotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDevotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
