"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchDevotionPageData } from "@/lib/supabase/queries/devotion";
import type { DevotionSource } from "@/lib/devotionSource";

export function useDevotionPageData(source?: DevotionSource) {
  return useQuery({
    queryKey: ["devotion", source ?? "default"],
    queryFn: () => fetchDevotionPageData(createClient(), source),
    staleTime: 60 * 1000,
  });
}
