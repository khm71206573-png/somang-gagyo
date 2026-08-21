"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface SendCheerResponse {
  ok: true;
  /** 실제로 푸시가 전달된 기기 수 */
  sent: number;
}

async function sendCheer(): Promise<SendCheerResponse> {
  const response = await fetch("/api/bible-progress/cheer", { method: "POST" });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error ?? "응원을 보내지 못했어요.");
  }

  return data;
}

export function useSendCheer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendCheer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bible-progress"] });
    },
  });
}
