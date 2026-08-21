import * as cheerio from "cheerio";
import { createServiceClient } from "@/lib/supabase/service";
import { HttpError } from "./HttpError";

const BOARD_ORIGIN = "http://nadulmokheaven.org";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * 설교안·주보가 올라오는 교회 홈페이지 게시판 테이블 이름.
 * 주보가 다른 게시판에 올라오는 경우 환경변수로 갈아끼울 수 있게 열어둔다.
 */
export const SERMON_BOARD_TABLE = process.env.CHURCH_SERMON_BOARD_TABLE ?? "board1";
export const BULLETIN_BOARD_TABLE =
  process.env.CHURCH_BULLETIN_BOARD_TABLE ?? SERMON_BOARD_TABLE;

const IMAGES_BUCKET = "sermon-images";

export function boardListUrl(boardTable: string) {
  return `${BOARD_ORIGIN}/bbs/board.php?bo_table=${boardTable}`;
}

export function boardDetailUrl(boardTable: string, wrId: number) {
  return `${BOARD_ORIGIN}/bbs/board.php?bo_table=${boardTable}&wr_id=${wrId}`;
}

function extractWrId(href: string): number | null {
  try {
    const url = new URL(href, BOARD_ORIGIN);
    const wrId = url.searchParams.get("wr_id");
    return wrId ? Number.parseInt(wrId, 10) : null;
  } catch {
    return null;
  }
}

/** "2026년 8월 16일 설교안" 같은 제목에서 날짜를 뽑는다. */
export function parsePostDate(title: string): string | null {
  const match = title.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export interface BoardPost {
  wrId: number;
  title: string;
  sourceUrl: string;
}

/**
 * 게시판 목록에서 제목에 keyword가 들어간 가장 최근 글을 찾는다.
 * 공지(bo_notice)는 건너뛴다. 목록 fetch 실패는 HttpError(502).
 */
export async function findLatestPost(
  boardTable: string,
  keyword: string,
): Promise<BoardPost | null> {
  const listUrl = boardListUrl(boardTable);

  try {
    const response = await fetch(listUrl, { headers: { "User-Agent": USER_AGENT } });

    if (!response.ok) {
      throw new HttpError(
        `게시판 목록을 불러오지 못했어요. (status ${response.status})`,
        502,
      );
    }

    const $ = cheerio.load(await response.text());

    let found: BoardPost | null = null;

    $("tbody tr").each((_, row) => {
      if (found !== null) return;

      const $row = $(row);
      if ($row.hasClass("bo_notice")) return;

      const $link = $row.find("td.td_subject a").first();
      const linkText = $link.text().trim();
      if (!linkText.includes(keyword)) return;

      const href = $link.attr("href");
      if (!href) return;

      const wrId = extractWrId(href);
      if (wrId === null) return;

      found = { wrId, title: linkText, sourceUrl: boardDetailUrl(boardTable, wrId) };
    });

    return found;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    const message =
      error instanceof Error ? error.message : "게시판 목록 스크랩에 실패했어요.";
    throw new HttpError(message, 502);
  }
}

/**
 * 원본 이미지를 다운로드해 Storage에 재호스팅하고 우리 쪽 public URL을 반환한다.
 * 원본 교회 홈페이지가 HTTPS를 지원하지 않아(https 요청이 http로 리다이렉트됨) 그대로 쓰면
 * 브라우저가 혼합 콘텐츠로 이미지를 차단하기 때문에, 스크랩 시점에 우리 Storage로 옮겨온다.
 * 다운로드/업로드 실패는 해당 이미지만 건너뛴다 (전체 스크랩을 막지 않음).
 */
async function rehostImage(
  supabase: ReturnType<typeof createServiceClient>,
  sourceImageUrl: string,
  pathPrefix: string,
  index: number,
): Promise<string | null> {
  try {
    const response = await fetch(sourceImageUrl, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "image/png";
    const buffer = await response.arrayBuffer();
    const ext = contentType.split("/")[1]?.split(";")[0] ?? "png";
    const storagePath = `${pathPrefix}${index}.${ext}`;

    const { error } = await supabase.storage
      .from(IMAGES_BUCKET)
      .upload(storagePath, buffer, { contentType, upsert: true });
    if (error) return null;

    const {
      data: { publicUrl },
    } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(storagePath);
    return publicUrl;
  } catch {
    return null;
  }
}

/**
 * 게시글 상세에서 본문 이미지를 모아 Storage에 재호스팅한 URL 목록을 반환한다.
 * 상세 fetch 실패는 HttpError(502).
 */
export async function fetchPostImageUrls(
  supabase: ReturnType<typeof createServiceClient>,
  post: BoardPost,
  pathPrefix: string,
): Promise<string[]> {
  try {
    const response = await fetch(post.sourceUrl, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      throw new HttpError(
        `게시글 상세를 불러오지 못했어요. (status ${response.status})`,
        502,
      );
    }

    const $ = cheerio.load(await response.text());

    // NOTE: #bo_v_con a.view_image의 href는 실제 이미지가 아니라 "크게보기" HTML 뷰어
    // 페이지 URL이라 <img> 태그로 못 그린다. 실제 이미지 파일은 항상 #bo_v_con img의
    // src 속성에 있으므로 그것만 사용한다.
    const rawImageUrls = $("#bo_v_con img")
      .map((_, el) => $(el).attr("src"))
      .get()
      .filter((src): src is string => Boolean(src))
      .map((src) => new URL(src, post.sourceUrl).toString());

    const rehosted = await Promise.all(
      rawImageUrls.map((url, index) => rehostImage(supabase, url, pathPrefix, index)),
    );

    return rehosted.filter((url): url is string => Boolean(url));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    const message =
      error instanceof Error ? error.message : "게시글 상세 스크랩에 실패했어요.";
    throw new HttpError(message, 502);
  }
}
