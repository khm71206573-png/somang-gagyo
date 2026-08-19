"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateSermonInput {
  sermonDate: string;
  categoryLabel: string;
  title: string;
  reference: string;
  preacher: string;
  quote: string;
  summaryParagraphs: string;
  sharingQuestions: string;
  sermonSongs: string;
}

async function createSermon(input: CreateSermonInput) {
  const response = await fetch("/api/admin/sermons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "설교 등록에 실패했어요.");
  }

  return response.json();
}

export function useCreateSermon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSermon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["group"] });
    },
  });
}
