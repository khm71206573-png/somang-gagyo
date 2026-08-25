"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchAnnouncementDetail } from "@/lib/supabase/queries/announcement";

export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: ["announcements", id],
    queryFn: () => fetchAnnouncementDetail(createClient(), id),
    enabled: Boolean(id),
    staleTime: 15 * 1000,
  });
}
