"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateDevotionInput {
  devotionDate: string;
  tag: string;
  title: string;
  reference: string;
  verses: string;
  questions: string;
  hymn?: string;
  commentary?: string;
  prayer?: string;
  practice?: string;
  footnotes?: string;
  pageLabel?: string;
  imageUrls?: string[];
}

async function createDevotion(input: CreateDevotionInput) {
  const response = await fetch("/api/admin/devotions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "묵상 등록에 실패했어요.");
  }

  return response.json();
}

export function useCreateDevotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDevotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["devotion"] });
    },
  });
}
