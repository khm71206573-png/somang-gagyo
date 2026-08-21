"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchMemberDirectory } from "@/lib/supabase/queries/memberDirectory";

export function useMemberDirectory() {
  return useQuery({
    queryKey: ["members", "directory"],
    queryFn: () => fetchMemberDirectory(createClient()),
    staleTime: 30 * 1000,
  });
}
