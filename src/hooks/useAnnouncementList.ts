"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchAnnouncementList } from "@/lib/supabase/queries/announcement";

export function useAnnouncementList() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: () => fetchAnnouncementList(createClient()),
    staleTime: 30 * 1000,
  });
}
