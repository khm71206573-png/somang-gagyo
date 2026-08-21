import { getAccessToken } from "./getAccessToken";
import { HttpError } from "@/lib/automation/HttpError";

const CHANNELS_URL =
  "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true";
const PLAYLISTS_URL = "https://www.googleapis.com/youtube/v3/playlists";

/** 찬양을 가져올 유튜브 재생목록 종류 */
export type SongSource = "liked" | "recommended";

export function isSongSource(value: unknown): value is SongSource {
  return value === "liked" || value === "recommended";
}

/** 추천찬양 재생목록 이름. 다른 이름을 쓰면 환경변수로 바꿀 수 있다. */
export function recommendedPlaylistTitle() {
  return process.env.YOUTUBE_RECOMMENDED_PLAYLIST_TITLE?.trim() || "추천찬양";
}

/** 재생목록 이름 비교용 정규화 (공백·대소문자 무시) */
function normalizeTitle(title: string) {
  return title.replace(/\s+/g, "").toLowerCase();
}

export type PlaylistLookup =
  | { ok: true; playlistId: string }
  | { ok: false; reason: string };

async function fetchLikesPlaylistId(
  authHeaders: HeadersInit,
): Promise<PlaylistLookup> {
  const response = await fetch(CHANNELS_URL, { headers: authHeaders });
  if (!response.ok) {
    throw new HttpError(
      `YouTube 채널 정보를 불러오지 못했어요. (status ${response.status})`,
      502,
    );
  }

  const data = await response.json();
  const playlistId = data?.items?.[0]?.contentDetails?.relatedPlaylists?.likes as
    | string
    | undefined;

  if (!playlistId) {
    return { ok: false, reason: "좋아요 표시한 동영상 재생목록을 찾지 못했어요." };
  }

  return { ok: true, playlistId };
}

/**
 * 관리자 계정이 가진 재생목록 중 "추천찬양"(또는 환경변수로 지정한 이름)을 찾는다.
 * YOUTUBE_RECOMMENDED_PLAYLIST_ID를 지정하면 이름 검색 없이 그 재생목록을 쓴다.
 */
async function fetchRecommendedPlaylistId(
  authHeaders: HeadersInit,
): Promise<PlaylistLookup> {
  const configuredId = process.env.YOUTUBE_RECOMMENDED_PLAYLIST_ID?.trim();
  if (configuredId) {
    return { ok: true, playlistId: configuredId };
  }

  const wantedTitle = recommendedPlaylistTitle();
  const wanted = normalizeTitle(wantedTitle);
  let pageToken: string | undefined;

  // 재생목록이 많은 계정도 있어서 페이지를 넘겨가며 찾는다. (최대 5페이지 = 250개)
  for (let page = 0; page < 5; page += 1) {
    const url = new URL(PLAYLISTS_URL);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("mine", "true");
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, { headers: authHeaders });
    if (!response.ok) {
      throw new HttpError(
        `YouTube 재생목록을 불러오지 못했어요. (status ${response.status})`,
        502,
      );
    }

    const data = await response.json();
    const items = (data?.items ?? []) as {
      id?: string;
      snippet?: { title?: string };
    }[];

    const matched = items.find(
      (item) => item.snippet?.title && normalizeTitle(item.snippet.title) === wanted,
    );
    if (matched?.id) {
      return { ok: true, playlistId: matched.id };
    }

    pageToken = data?.nextPageToken as string | undefined;
    if (!pageToken) break;
  }

  return {
    ok: false,
    reason: `"${wantedTitle}" 재생목록을 찾지 못했어요. 관리자 계정에 같은 이름의 재생목록이 있는지 확인해주세요.`,
  };
}

/** 소스 종류에 맞는 재생목록 ID와 인증 헤더를 준비한다. */
export async function resolveSongPlaylist(source: SongSource): Promise<
  | { ok: true; playlistId: string; authHeaders: HeadersInit }
  | { ok: false; reason: string }
> {
  const accessToken = await getAccessToken();
  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  const lookup =
    source === "recommended"
      ? await fetchRecommendedPlaylistId(authHeaders)
      : await fetchLikesPlaylistId(authHeaders);

  if (!lookup.ok) return lookup;

  return { ok: true, playlistId: lookup.playlistId, authHeaders };
}
