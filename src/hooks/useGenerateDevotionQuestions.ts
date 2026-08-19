"use client";

import { useMutation } from "@tanstack/react-query";

export interface GenerateDevotionQuestionsInput {
  reference: string;
  verses: string;
}

async function generateDevotionQuestions(
  input: GenerateDevotionQuestionsInput,
): Promise<string[]> {
  const response = await fetch("/api/admin/devotions/generate-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? "묵상 질문 생성에 실패했어요.");
  }

  return data.questions ?? [];
}

export function useGenerateDevotionQuestions() {
  return useMutation({
    mutationFn: generateDevotionQuestions,
  });
}
