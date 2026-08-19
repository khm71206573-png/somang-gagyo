import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrayerRequestItem, PrayerRequestStatus } from "@/lib/mock-data";
import { avatarFallback, formatTimeAgo, unwrapRelation } from "./utils";

export async function fetchPrayerRequestList(
  supabase: SupabaseClient,
): Promise<PrayerRequestItem[]> {
  const { data } = await supabase
    .from("prayer_requests")
    .select(
      "id, display_name, content, status, category, created_at, member:profiles(name, avatar_url), prayer_reactions(count)",
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const member = unwrapRelation(
      row.member as
        | { name: string; avatar_url: string | null }
        | { name: string; avatar_url: string | null }[]
        | null,
    );
    const reactions = unwrapRelation(
      row.prayer_reactions as { count: number } | { count: number }[] | null,
    );
    const author = row.display_name ?? member?.name ?? "성도";

    return {
      id: row.id,
      author,
      avatarUrl: member?.avatar_url ?? avatarFallback(author),
      timeAgo: formatTimeAgo(row.created_at),
      category: row.category ?? "일반",
      content: row.content,
      participantCount: reactions?.count ?? 0,
      status: row.status as PrayerRequestStatus,
    };
  });
}
