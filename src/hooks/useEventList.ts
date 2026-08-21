"use client";

import { useQuery } from "@tanstack/react-query";

export interface EventListItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  location: string | null;
  type: "church" | "gagyo" | "birthday" | "other";
}

async function fetchEventList(): Promise<EventListItem[]> {
  const response = await fetch("/api/admin/events");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "일정 목록을 불러오지 못했어요.");
  }

  const data = await response.json();
  return data.items ?? [];
}

export function useEventList() {
  return useQuery({
    queryKey: ["admin", "eventList"],
    queryFn: fetchEventList,
  });
}
