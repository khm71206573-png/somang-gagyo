"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchGroupPageData } from "@/lib/supabase/queries/group";

export function useGroupPageData() {
  return useQuery({
    queryKey: ["group"],
    queryFn: () => fetchGroupPageData(createClient()),
    staleTime: 60 * 1000,
  });
}
