"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchSongPageData } from "@/lib/supabase/queries/song";

export function useSongPageData() {
  return useQuery({
    queryKey: ["song-page"],
    queryFn: () => fetchSongPageData(createClient()),
    staleTime: 60 * 1000,
  });
}
