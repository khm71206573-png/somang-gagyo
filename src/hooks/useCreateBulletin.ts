"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateBulletinInput {
  bulletinDate: string;
  imageUrls: string;
}

async function createBulletin(input: CreateBulletinInput) {
  const response = await fetch("/api/admin/bulletins", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "주보 등록에 실패했어요.");
  }

  return response.json();
}

export function useCreateBulletin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBulletin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
