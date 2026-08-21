"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchMemberProfileById } from "@/lib/supabase/queries/memberDirectory";

export function useMemberProfile(id: string) {
  return useQuery({
    queryKey: ["members", "profile", id],
    queryFn: () => fetchMemberProfileById(createClient(), id),
    enabled: Boolean(id),
  });
}
