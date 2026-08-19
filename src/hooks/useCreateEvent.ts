"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateEventInput {
  eventDate: string;
  title: string;
  type: "church" | "birthday" | "other";
  startTime: string;
  location: string;
  description: string;
}

async function createEvent(input: CreateEventInput) {
  const response = await fetch("/api/admin/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "일정 등록에 실패했어요.");
  }

  return response.json();
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
