import type { SupabaseClient } from "@supabase/supabase-js";
import { formatTimeAgo, unwrapRelation, weekStartDateString } from "./utils";

/** 42P01 = 테이블 없음, 42703 = 컬럼 없음. 마이그레이션 적용 전이면 이 코드로 온다. */
const UNDEFINED_TABLE = "42P01";
const UNDEFINED_COLUMN = "42703";

export const PRAISE_SET_SETUP_MESSAGE =
  "찬양콘티 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요.";

export const PRAISE_SET_BUCKET = "praise-sets";

/** 유튜브 주소에서 영상 ID만 뽑아낸다. 유튜브 링크가 아니면 null. */
export function youtubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.split("/")[1] || null;
    }

    if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "music.youtube.com") {
      return null;
    }

    const videoParam = parsed.searchParams.get("v");
    if (videoParam) return videoParam;

    // /shorts/ID, /embed/ID, /live/ID 형태도 받아준다.
    const match = parsed.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function youtubeThumbnailUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export interface PraiseSetItem {
  id: string;
  /** 사진으로 올린 콘티. 유튜브 링크로 올렸으면 null. */
  imageUrl: string | null;
  storagePath: string | null;
  /** 유튜브로 올린 콘티. 사진이면 null. */
  youtubeUrl: string | null;
  /** 유튜브 콘티의 썸네일 주소 */
  thumbnailUrl: string | null;
  uploaderName: string;
  timeAgo: string;
  /** 로그인한 사용자가 올린 콘티인지 (삭제 버튼 노출용) */
  isMine: boolean;
}

export interface PraiseSetWeek {
  /** 보여주고 있는 콘티의 주 시작일(주일). 올라온 콘티가 없으면 이번 주. */
  weekStart: string;
  /** "8월 24일 ~ 8월 30일" */
  weekLabel: string;
  /** 이번 주 콘티인지. false면 지난 주 콘티를 대신 보여주는 중이다. */
  isThisWeek: boolean;
  items: PraiseSetItem[];
}

/** "2026-08-24" → "8월 24일 ~ 8월 30일" */
export function formatWeekRangeLabel(weekStart: string) {
  const [year, month, day] = weekStart.split("-").map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 6);
  return `${start.getMonth() + 1}월 ${start.getDate()}일 ~ ${end.getMonth() + 1}월 ${end.getDate()}일`;
}

const ROW_COLUMNS =
  "id, image_url, storage_path, created_by, created_at, uploader:profiles(name)";

/** 유튜브 컬럼이 아직 없는 DB에서도 콘티 목록이 보이도록 한 번 더 조회한다. */
async function fetchRows(supabase: SupabaseClient, weekStart: string) {
  const { data, error } = await supabase
    .from("praise_sets")
    .select(`${ROW_COLUMNS}, youtube_url`)
    .eq("week_start", weekStart)
    .order("created_at", { ascending: true });

  if (!error) return data ?? [];
  if (error.code !== UNDEFINED_COLUMN) {
    throw new Error(error.message || "찬양콘티를 불러오지 못했어요.");
  }

  const { data: legacy, error: legacyError } = await supabase
    .from("praise_sets")
    .select(ROW_COLUMNS)
    .eq("week_start", weekStart)
    .order("created_at", { ascending: true });

  if (legacyError) {
    throw new Error(legacyError.message || "찬양콘티를 불러오지 못했어요.");
  }

  return (legacy ?? []).map((row) => ({ ...row, youtube_url: null }));
}

export async function fetchCurrentPraiseSet(
  supabase: SupabaseClient,
): Promise<PraiseSetWeek> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const thisWeekStart = weekStartDateString();

  // 이번 주 콘티가 아직 안 올라온 날에도 화면이 비어 보이지 않도록,
  // 가장 최근에 올라온 주의 콘티를 대신 보여준다. (추천 찬양과 같은 방식)
  const { data: latest, error } = await supabase
    .from("praise_sets")
    .select("week_start")
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === UNDEFINED_TABLE) throw new Error(PRAISE_SET_SETUP_MESSAGE);
    throw new Error(error.message || "찬양콘티를 불러오지 못했어요.");
  }

  const weekStart = (latest?.week_start as string | undefined) ?? thisWeekStart;
  const rows = await fetchRows(supabase, weekStart);

  return {
    weekStart,
    weekLabel: formatWeekRangeLabel(weekStart),
    isThisWeek: weekStart === thisWeekStart,
    items: rows.map((row) => {
      const uploader = unwrapRelation(
        row.uploader as { name: string | null } | { name: string | null }[] | null,
      );
      const youtubeUrl = (row.youtube_url as string | null) ?? null;
      const videoId = youtubeUrl ? youtubeVideoId(youtubeUrl) : null;

      return {
        id: row.id,
        imageUrl: (row.image_url as string | null) ?? null,
        storagePath: (row.storage_path as string | null) ?? null,
        youtubeUrl,
        thumbnailUrl: videoId ? youtubeThumbnailUrl(videoId) : null,
        uploaderName: uploader?.name ?? "성도",
        timeAgo: formatTimeAgo(row.created_at),
        isMine: Boolean(user) && row.created_by === user?.id,
      };
    }),
  };
}
