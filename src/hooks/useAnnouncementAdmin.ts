"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  AnnouncementKind,
  AnnouncementPollType,
} from "@/lib/supabase/queries/announcement";

export interface AnnouncementAdminDetail {
  id: string;
  kind: AnnouncementKind;
  poll_type: AnnouncementPollType | null;
  title: string;
  content: string | null;
  is_pinned: boolean;
  allow_multiple: boolean;
  hide_voters: boolean;
  closes_at: string | null;
  created_at: string;
  announcement_poll_options: {
    id: string;
    label: string | null;
    option_date: string | null;
    start_time: string | null;
    display_order: number;
  }[];
}

async function fetchAnnouncementAdmin(id: string): Promise<AnnouncementAdminDetail> {
  const response = await fetch(`/api/admin/announcements/${id}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "공지를 불러오지 못했어요.");
  }

  return response.json();
}

export function useAnnouncementAdmin(id: string) {
  return useQuery({
    queryKey: ["admin", "announcement", id],
    queryFn: () => fetchAnnouncementAdmin(id),
    enabled: Boolean(id),
  });
}
