import type { SupabaseClient } from "@supabase/supabase-js";
import { formatTimeAgo, unwrapRelation, weekStartDateString } from "./utils";

/** 42P01 = 테이블 없음, 42703 = 컬럼 없음. 마이그레이션 적용 전이면 이 코드로 온다. */
const UNDEFINED_TABLE = "42P01";
const UNDEFINED_COLUMN = "42703";

export const PRAISE_SET_SETUP_MESSAGE =
  "찬양콘티 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요.";

export const PRAISE_SET_BUCKET = "praise-sets";

/** 유튜브 영상 ID 형식(11자) */
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/** 다른 사이트를 거쳐 온 링크에서 원래 주소가 담기는 쿼리 이름들 */
const REDIRECT_PARAMS = ["continue", "url", "u", "q", "target", "redirect"];

/**
 * 붙여넣은 문자열에서 유튜브 주소만 골라낸다.
 * 카카오톡·유튜브 앱에서 공유하면 "제목 https://youtu.be/... " 처럼
 * 앞뒤에 다른 글자가 붙거나 http:// 가 빠진 채로 넘어오는 경우가 많다.
 */
function parseYoutubeUrl(value: string): URL | null {
  const cleaned = value
    // 붙여넣기할 때 딸려 오는 보이지 않는 문자를 먼저 지운다.
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();

  const token = cleaned.match(
    /(?:https?:\/\/)?[^\s<>"']*(?:youtube\.com|youtu\.be|youtube-nocookie\.com)[^\s<>"']*/i,
  )?.[0];

  if (!token) return null;

  const withScheme = /^https?:\/\//i.test(token) ? token : `https://${token}`;

  try {
    return new URL(withScheme);
  } catch {
    return null;
  }
}

function isYoutubeHost(host: string) {
  return (
    host === "youtu.be" ||
    host === "youtube.com" ||
    host === "youtube-nocookie.com" ||
    host.endsWith(".youtube.com") ||
    host.endsWith(".youtube-nocookie.com")
  );
}

/** 재생목록 ID 형식. PL·OLAK5uy_·UU·RD 등 종류가 많아 길이만 확인한다. */
const PLAYLIST_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;

/** "좋아요 표시한 동영상"(LL)·"나중에 볼 동영상"(WL)처럼 짧은 재생목록 */
const SHORT_PLAYLIST_IDS = ["LL", "WL"];

export interface YoutubeLink {
  /** 영상 링크면 영상 ID. 재생목록만 있는 링크면 null. */
  videoId: string | null;
  /** 재생목록(list=) ID. 없으면 null. */
  playlistId: string | null;
  /** 어디서 복사해 왔든 항상 열리도록 정리한 주소 */
  url: string;
  /** 목록에 보여줄 썸네일. 재생목록만 있으면 유튜브가 주소를 열어주지 않아 null. */
  thumbnailUrl: string | null;
}

function firstMatching(
  candidates: (string | null | undefined)[],
  pattern: RegExp,
  extraAllowed: string[] = [],
) {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value && (pattern.test(value) || extraAllowed.includes(value))) {
      return value;
    }
  }
  return null;
}

/**
 * 붙여넣은 주소에서 영상 ID와 재생목록 ID를 뽑아낸다.
 * 영상 링크(watch·youtu.be·shorts)와 재생목록 링크(playlist?list=) 모두 받는다.
 * 유튜브 링크가 아니면 null.
 */
export function parseYoutubeLink(value: string): YoutubeLink | null {
  const parsed = parseYoutubeUrl(value);
  if (!parsed) return null;

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

  // consent.google.com 처럼 중간 페이지를 거쳐 온 링크는 쿼리 안에 원래 주소가 있다.
  const nestedLink = (() => {
    for (const param of REDIRECT_PARAMS) {
      const nested = parsed.searchParams.get(param);
      if (nested && (!isYoutubeHost(host) || nested.includes("youtu"))) {
        const link = parseYoutubeLink(nested);
        if (link) return link;
      }
    }
    return null;
  })();

  if (!isYoutubeHost(host)) return nestedLink;
  if (nestedLink) return nestedLink;

  const videoCandidates: (string | null | undefined)[] = [parsed.searchParams.get("v")];

  if (host === "youtu.be") {
    videoCandidates.push(parsed.pathname.split("/").filter(Boolean)[0]);
  }

  // /shorts/ID, /embed/ID, /live/ID 형태도 받아준다.
  videoCandidates.push(
    parsed.pathname.match(/\/(?:shorts|embed|live|v|e)\/([^/?#]+)/)?.[1],
  );

  const videoId = firstMatching(videoCandidates, VIDEO_ID_PATTERN);
  const playlistId = firstMatching(
    [parsed.searchParams.get("list")],
    PLAYLIST_ID_PATTERN,
    SHORT_PLAYLIST_IDS,
  );

  if (!videoId && !playlistId) return null;

  return {
    videoId,
    playlistId,
    url: youtubeCanonicalUrl(videoId, playlistId),
    thumbnailUrl: videoId ? youtubeThumbnailUrl(videoId) : null,
  };
}

/** 저장할 때 쓰는 정리된 주소. 재생목록만 있으면 재생목록 주소로 저장한다. */
export function youtubeCanonicalUrl(
  videoId: string | null,
  playlistId: string | null,
) {
  if (!videoId && playlistId) {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
  }

  const base = `https://www.youtube.com/watch?v=${videoId}`;
  // 재생목록 안의 영상이면 재생목록도 함께 열리도록 남겨둔다.
  return playlistId ? `${base}&list=${playlistId}` : base;
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
  /** 유튜브 콘티의 썸네일 주소. 재생목록 링크면 null. */
  thumbnailUrl: string | null;
  /** 재생목록 링크로 올린 콘티인지 (카드 문구용) */
  isPlaylist: boolean;
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
      const youtubeLink = youtubeUrl ? parseYoutubeLink(youtubeUrl) : null;

      return {
        id: row.id,
        imageUrl: (row.image_url as string | null) ?? null,
        storagePath: (row.storage_path as string | null) ?? null,
        youtubeUrl,
        thumbnailUrl: youtubeLink?.thumbnailUrl ?? null,
        isPlaylist: Boolean(youtubeLink && !youtubeLink.videoId && youtubeLink.playlistId),
        uploaderName: uploader?.name ?? "성도",
        timeAgo: formatTimeAgo(row.created_at),
        isMine: Boolean(user) && row.created_by === user?.id,
      };
    }),
  };
}
