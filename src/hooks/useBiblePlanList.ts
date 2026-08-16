"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchBiblePlanList } from "@/lib/supabase/queries/biblePlan";

export function useBiblePlanList() {
  return useQuery({
    queryKey: ["bible-plans"],
    queryFn: () => fetchBiblePlanList(createClient()),
    staleTime: 60 * 1000,
  });
}
