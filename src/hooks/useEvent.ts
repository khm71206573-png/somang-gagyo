"use client";

import { useQuery } from "@tanstack/react-query";

export interface EventDetailData {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  location: string | null;
  type: "church" | "birthday" | "other";
}

async function fetchEvent(id: string): Promise<EventDetailData> {
  const response = await fetch(`/api/admin/events/${id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "일정을 불러오지 못했어요.");
  }

  return response.json();
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["admin", "event", id],
    queryFn: () => fetchEvent(id),
    enabled: Boolean(id),
  });
}
