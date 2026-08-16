"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchDashboardData } from "@/lib/supabase/queries/dashboard";

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboardData(createClient()),
    staleTime: 60 * 1000,
  });
}
