"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchDevotionPageData } from "@/lib/supabase/queries/devotion";

export function useDevotionPageData() {
  return useQuery({
    queryKey: ["devotion"],
    queryFn: () => fetchDevotionPageData(createClient()),
    staleTime: 60 * 1000,
  });
}
