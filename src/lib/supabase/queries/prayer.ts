import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrayerRequestItem } from "@/lib/mock-data";
import { avatarFallback, formatTimeAgo, unwrapRelation } from "./utils";

const PRAYER_COLUMNS =
  "id, member_id, display_name, content, category, created_at, member:profiles(name, avatar_url), prayer_reactions(count)";

/** 42703 = 컬럼 없음. 감사기도 마이그레이션 적용 전이면 이 코드로 온다. */
const UNDEFINED_COLUMN = "42703";

/**
 * 감사기도 컬럼이 아직 없는 DB에서도 목록이 통째로 비지 않도록,
 * is_thanksgiving 없이 한 번 더 조회해 "감사 아님"으로 다룬다.
 */
async function fetchRows(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("prayer_requests")
    .select(`${PRAYER_COLUMNS}, is_thanksgiving`)
    .order("created_at", { ascending: false });

  if (!error) return data ?? [];
  if (error.code !== UNDEFINED_COLUMN) return [];

  const { data: legacy } = await supabase
    .from("prayer_requests")
    .select(PRAYER_COLUMNS)
    .order("created_at", { ascending: false });

  return (legacy ?? []).map((row) => ({ ...row, is_thanksgiving: false }));
}

export async function fetchPrayerRequestList(
  supabase: SupabaseClient,
): Promise<PrayerRequestItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = await fetchRows(supabase);

  // 로그인한 사용자가 이미 "함께 기도하기"를 누른 기도제목을 한 번에 조회한다.
  let reactedIds = new Set<string>();
  if (user && rows.length > 0) {
    const { data: reactions } = await supabase
      .from("prayer_reactions")
      .select("prayer_request_id")
      .eq("member_id", user.id)
      .in(
        "prayer_request_id",
        rows.map((row) => row.id),
      );

    reactedIds = new Set(
      (reactions ?? []).map((row) => row.prayer_request_id as string),
    );
  }

  return rows.map((row) => {
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
      isThanksgiving: Boolean(row.is_thanksgiving),
      isMine: Boolean(user) && row.member_id === user?.id,
      hasReacted: reactedIds.has(row.id),
    };
  });
}
