"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  AnnouncementKind,
  AnnouncementPollType,
} from "@/lib/supabase/queries/announcement";

export interface AnnouncementAdminListItem {
  id: string;
  kind: AnnouncementKind;
  poll_type: AnnouncementPollType | null;
  title: string;
  content: string | null;
  is_pinned: boolean;
  allow_multiple: boolean;
  closes_at: string | null;
  created_at: string;
  announcement_poll_options: { id: string }[];
}

async function fetchAnnouncementAdminList(): Promise<AnnouncementAdminListItem[]> {
  const response = await fetch("/api/admin/announcements");

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "공지 목록을 불러오지 못했어요.");
  }

  const data = await response.json();
  return data.items ?? [];
}

export function useAnnouncementAdminList() {
  return useQuery({
    queryKey: ["admin", "announcementList"],
    queryFn: fetchAnnouncementAdminList,
  });
}
