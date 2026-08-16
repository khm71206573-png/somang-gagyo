"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchBibleProgressData } from "@/lib/supabase/queries/bibleProgress";

export function useBibleProgressData() {
  return useQuery({
    queryKey: ["bible-progress"],
    queryFn: () => fetchBibleProgressData(createClient()),
    staleTime: 30 * 1000,
  });
}
