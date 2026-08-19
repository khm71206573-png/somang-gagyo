"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateEventInput } from "@/hooks/useCreateEvent";

export interface UpdateEventInput extends CreateEventInput {
  id: string;
}

async function updateEvent({ id, ...input }: UpdateEventInput) {
  const response = await fetch(`/api/admin/events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "일정 수정에 실패했어요.");
  }

  return response.json();
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}
