"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchMemberList } from "@/lib/supabase/queries/members";

export function useMemberList() {
  return useQuery({
    queryKey: ["admin", "members"],
    queryFn: () => fetchMemberList(createClient()),
    staleTime: 30 * 1000,
  });
}
