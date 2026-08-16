"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchPrayerRequestList } from "@/lib/supabase/queries/prayer";

export function usePrayerRequestList() {
  return useQuery({
    queryKey: ["prayer-requests"],
    queryFn: () => fetchPrayerRequestList(createClient()),
    staleTime: 30 * 1000,
  });
}
