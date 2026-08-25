"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EventRepeatType } from "@/lib/eventRecurrence";

export interface CreateEventInput {
  eventDate: string;
  title: string;
  type: "church" | "gagyo" | "birthday" | "other";
  startTime: string;
  location: string;
  description: string;
  /** 반복 주기 (none이면 하루짜리 일정) */
  repeatType: EventRepeatType;
  /** 반복 종료일. 비우면 계속 반복한다. */
  repeatUntil: string;
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
