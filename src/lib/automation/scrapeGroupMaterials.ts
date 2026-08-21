import { createServiceClient } from "@/lib/supabase/service";
import { HttpError } from "./HttpError";
import {
  BULLETIN_BOARD_TABLE,
  SERMON_BOARD_TABLE,
  fetchPostImageUrls,
  findLatestPost,
  parsePostDate,
} from "./scrapeBoard";

export type MaterialResult =
  | { ok: true; saved: true; date: string; imageCount: number; title: string }
  | { ok: true; saved: false; reason: string };

export interface ScrapeGroupMaterialsResult {
  sermon: MaterialResult;
  bulletin: MaterialResult;
}

/**
 * 설교안 게시글을 가져와 sermons 행에 반영한다.
 *
 * 교제탭 "설교안" 탭은 sermons.image_urls를 읽기 때문에, 스크랩 결과를 sermon_drafts에만
 * 넣어두면 관리자가 등록 폼을 거치기 전까지 화면이 비어 있게 된다. 그래서 여기서는
 * sermons에 바로 반영한다. 같은 날짜의 설교가 이미 있으면 이미지 목록만 갱신한다.
 */
async function scrapeSermonMaterial(
  supabase: ReturnType<typeof createServiceClient>,
): Promise<MaterialResult> {
  const post = await findLatestPost(SERMON_BOARD_TABLE, "설교안");

  if (!post) {
    return { ok: true, saved: false, reason: "설교안 게시글을 찾지 못했어요." };
  }

  const sermonDate = parsePostDate(post.title);
  if (!sermonDate) {
    return {
      ok: true,
      saved: false,
      reason: `설교안 제목에서 날짜를 읽지 못했어요. (${post.title})`,
    };
  }

  const imageUrls = await fetchPostImageUrls(supabase, post, `${post.wrId}/`);

  if (imageUrls.length === 0) {
    return {
      ok: true,
      saved: false,
      reason: "설교안 게시글에서 이미지를 찾지 못했어요.",
    };
  }

  const { data: existing } = await supabase
    .from("sermons")
    .select("id")
    .eq("sermon_date", sermonDate)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("sermons")
      .update({ image_urls: imageUrls })
      .eq("id", existing.id);

    if (error) throw new HttpError(error.message, 500);
  } else {
    const { error } = await supabase.from("sermons").insert({
      title: post.title,
      sermon_date: sermonDate,
      category_label: "가교모임",
      image_urls: imageUrls,
    });

    if (error) throw new HttpError(error.message, 500);
  }

  // 설교 초안 목록에도 남겨 두어 관리자가 상세 내용을 채워 넣을 수 있게 한다.
  await supabase.from("sermon_drafts").upsert(
    {
      source_wr_id: post.wrId,
      source_url: post.sourceUrl,
      title: post.title,
      sermon_date: sermonDate,
      image_urls: imageUrls,
    },
    { onConflict: "source_wr_id" },
  );

  return {
    ok: true,
    saved: true,
    date: sermonDate,
    imageCount: imageUrls.length,
    title: post.title,
  };
}

/**
 * 주보 게시글을 가져와 bulletins 행에 반영한다.
 * bulletin_date가 unique라 같은 날짜면 이미지 목록을 갱신한다.
 */
async function scrapeBulletinMaterial(
  supabase: ReturnType<typeof createServiceClient>,
): Promise<MaterialResult> {
  const post = await findLatestPost(BULLETIN_BOARD_TABLE, "주보");

  if (!post) {
    return { ok: true, saved: false, reason: "주보 게시글을 찾지 못했어요." };
  }

  const bulletinDate = parsePostDate(post.title);
  if (!bulletinDate) {
    return {
      ok: true,
      saved: false,
      reason: `주보 제목에서 날짜를 읽지 못했어요. (${post.title})`,
    };
  }

  const imageUrls = await fetchPostImageUrls(
    supabase,
    post,
    `bulletin/${post.wrId}/`,
  );

  if (imageUrls.length === 0) {
    return {
      ok: true,
      saved: false,
      reason: "주보 게시글에서 이미지를 찾지 못했어요.",
    };
  }

  const { error } = await supabase
    .from("bulletins")
    .upsert(
      { bulletin_date: bulletinDate, image_urls: imageUrls },
      { onConflict: "bulletin_date" },
    );

  if (error) throw new HttpError(error.message, 500);

  return {
    ok: true,
    saved: true,
    date: bulletinDate,
    imageCount: imageUrls.length,
    title: post.title,
  };
}

/**
 * 교회 홈페이지 게시판에서 설교안과 주보를 한 번에 가져온다.
 * 한쪽이 실패해도 다른 쪽 결과는 그대로 돌려준다.
 */
export async function scrapeGroupMaterials(): Promise<ScrapeGroupMaterialsResult> {
  const supabase = createServiceClient();

  const [sermon, bulletin] = await Promise.all([
    scrapeSermonMaterial(supabase).catch(
      (error): MaterialResult => ({
        ok: true,
        saved: false,
        reason:
          error instanceof Error ? error.message : "설교안을 가져오지 못했어요.",
      }),
    ),
    scrapeBulletinMaterial(supabase).catch(
      (error): MaterialResult => ({
        ok: true,
        saved: false,
        reason: error instanceof Error ? error.message : "주보를 가져오지 못했어요.",
      }),
    ),
  ]);

  return { sermon, bulletin };
}
