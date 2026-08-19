"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateBulletinInput } from "@/hooks/useCreateBulletin";

export interface UpdateBulletinInput extends CreateBulletinInput {
  id: string;
}

async function updateBulletin({ id, ...input }: UpdateBulletinInput) {
  const response = await fetch(`/api/admin/bulletins/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "주보 수정에 실패했어요.");
  }

  return response.json();
}

export function useUpdateBulletin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBulletin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
