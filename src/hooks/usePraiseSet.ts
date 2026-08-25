"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchCurrentPraiseSet } from "@/lib/supabase/queries/praiseSet";

export function usePraiseSet() {
  return useQuery({
    queryKey: ["praise-set"],
    queryFn: () => fetchCurrentPraiseSet(createClient()),
    staleTime: 30 * 1000,
  });
}
