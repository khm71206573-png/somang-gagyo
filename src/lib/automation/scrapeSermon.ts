import { createServiceClient } from "@/lib/supabase/service";
import { HttpError } from "./HttpError";
import {
  SERMON_BOARD_TABLE,
  fetchPostImageUrls,
  findLatestPost,
  parsePostDate,
} from "./scrapeBoard";

export type ScrapeSermonResult =
  | { ok: true; inserted: true; draftId: string }
  | { ok: true; skipped: true; reason: string };

/**
 * 설교안 게시판을 스크랩해 sermon_drafts 테이블에 저장한다.
 * Cron·관리자 수동 실행 버튼 양쪽에서 동일한 스크랩 로직을 쓰기 위한 공용 함수.
 *
 * 목록/상세 페이지 fetch 실패는 HttpError(502)를 throw한다.
 * 설교안 게시글 없음, 날짜 파싱 실패, 이미 스크랩됨은 skipped 결과를 반환한다.
 * sermon_drafts insert 실패는 기존 라우트의 동작을 그대로 보존해 HttpError(502)를 throw한다.
 */
export async function scrapeSermon(): Promise<ScrapeSermonResult> {
  const post = await findLatestPost(SERMON_BOARD_TABLE, "설교안");

  if (!post) {
    return { ok: true, skipped: true, reason: "설교안 게시글을 찾지 못했어요." };
  }

  const sermonDate = parsePostDate(post.title);
  if (!sermonDate) {
    return { ok: true, skipped: true, reason: "date not found in title" };
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("sermon_drafts")
    .select("id")
    .eq("source_wr_id", post.wrId)
    .maybeSingle();

  if (existing) {
    return { ok: true, skipped: true, reason: "already scraped" };
  }

  const imageUrls = await fetchPostImageUrls(supabase, post, `${post.wrId}/`);

  const { data: inserted, error: insertError } = await supabase
    .from("sermon_drafts")
    .insert({
      source_wr_id: post.wrId,
      source_url: post.sourceUrl,
      title: post.title,
      sermon_date: sermonDate,
      image_urls: imageUrls,
    })
    .select("id")
    .single();

  if (insertError) {
    // NOTE: 기존 라우트의 동작을 그대로 보존 — DB insert 오류지만 502로 응답한다.
    throw new HttpError(insertError.message, 502);
  }

  return { ok: true, inserted: true, draftId: inserted.id };
}
