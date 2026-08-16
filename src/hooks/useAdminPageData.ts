"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchAdminPageData } from "@/lib/supabase/queries/admin";

export function useAdminPageData() {
  return useQuery({
    queryKey: ["admin"],
    queryFn: () => fetchAdminPageData(createClient()),
    staleTime: 30 * 1000,
  });
}
