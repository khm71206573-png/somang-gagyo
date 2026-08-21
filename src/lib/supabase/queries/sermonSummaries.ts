import type { SupabaseClient } from "@supabase/supabase-js";
import { formatTimeAgo, unwrapRelation } from "./utils";

export interface SermonSummaryPost {
  id: string;
  content: string;
  authorName: string;
  timeAgo: string;
  createdAt: string;
  /** 로그인한 사용자가 관리자라 삭제 버튼을 보여줘도 되는지는 화면에서 별도로 판단한다 */
}

export async function fetchSermonSummaries(
  supabase: SupabaseClient,
): Promise<SermonSummaryPost[]> {
  const { data, error } = await supabase
    .from("sermon_summaries")
    .select("id, content, created_at, author:profiles(name)")
    .order("created_at", { ascending: false });

  if (error) {
    // 42P01 = 테이블 없음. sermon_summaries 마이그레이션 적용 전이면 여기로 온다.
    if (error.code === "42P01") {
      throw new Error(
        "설교요약 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요.",
      );
    }
    throw new Error(error.message ?? "설교요약을 불러오지 못했어요.");
  }

  return (data ?? []).map((row) => {
    const author = unwrapRelation(
      row.author as { name: string } | { name: string }[] | null,
    );

    return {
      id: row.id,
      content: row.content,
      authorName: author?.name ?? "관리자",
      timeAgo: formatTimeAgo(row.created_at),
      createdAt: row.created_at,
    };
  });
}
