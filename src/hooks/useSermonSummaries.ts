"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchSermonSummaries } from "@/lib/supabase/queries/sermonSummaries";

export function useSermonSummaries() {
  return useQuery({
    queryKey: ["sermon-summaries"],
    queryFn: () => fetchSermonSummaries(createClient()),
    staleTime: 30 * 1000,
  });
}
