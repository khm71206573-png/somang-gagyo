import { publicYoutubeAuth, withAuth } from "./auth";

const OEMBED_URL = "https://www.youtube.com/oembed";
const PLAYLIST_ITEMS_URL = "https://www.googleapis.com/youtube/v3/playlistItems";

/** 한 시간 동안은 유튜브에 다시 묻지 않는다. */
const CACHE_SECONDS = 60 * 60;

export interface YoutubePlaylistPreview {
  /** 재생목록 대표 이미지 (보통 첫 영상 썸네일) */
  thumbnailUrl: string | null;
  /** 재생목록 제목 */
  title: string | null;
  /** 첫 영상 ID. 알아내면 눌렀을 때 바로 순서대로 재생할 수 있다. */
  firstVideoId: string | null;
}

/** "https://i.ytimg.com/vi/<영상ID>/hqdefault.jpg"에서 영상 ID를 뽑는다. */
function videoIdFromThumbnailUrl(url: string | null) {
  return url?.match(/\/vi\/([A-Za-z0-9_-]{11})\//)?.[1] ?? null;
}

/**
 * 인증 없이 쓸 수 있는 oEmbed로 재생목록 정보를 얻는다.
 * 비공개·삭제된 재생목록이면 401/404가 돌아와 null이 된다.
 */
async function fetchFromOembed(
  playlistId: string,
): Promise<YoutubePlaylistPreview | null> {
  const target = `https://www.youtube.com/playlist?list=${playlistId}`;
  const response = await fetch(
    `${OEMBED_URL}?format=json&url=${encodeURIComponent(target)}`,
    { next: { revalidate: CACHE_SECONDS } },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    title?: unknown;
    thumbnail_url?: unknown;
  };

  const thumbnailUrl =
    typeof data.thumbnail_url === "string" ? data.thumbnail_url : null;

  if (!thumbnailUrl) return null;

  return {
    thumbnailUrl,
    title: typeof data.title === "string" ? data.title : null,
    firstVideoId: videoIdFromThumbnailUrl(thumbnailUrl),
  };
}

/**
 * oEmbed가 막혔을 때를 위한 두 번째 방법.
 * YOUTUBE_API_KEY(없으면 OAuth)가 설정돼 있을 때만 동작한다.
 */
async function fetchFromDataApi(
  playlistId: string,
): Promise<YoutubePlaylistPreview | null> {
  const auth = await publicYoutubeAuth();

  const url = new URL(PLAYLIST_ITEMS_URL);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("maxResults", "1");

  const response = await fetch(withAuth(url, auth), {
    headers: auth.headers,
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const snippet = data?.items?.[0]?.snippet;
  if (!snippet) return null;

  const thumbnails = snippet.thumbnails ?? {};
  const thumbnailUrl =
    thumbnails.maxres?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    null;

  return {
    thumbnailUrl: typeof thumbnailUrl === "string" ? thumbnailUrl : null,
    title: typeof snippet.title === "string" ? snippet.title : null,
    firstVideoId: snippet.resourceId?.videoId ?? null,
  };
}

/** 재생목록 썸네일과 첫 영상을 알아낸다. 못 알아내면 null. */
export async function fetchPlaylistPreview(
  playlistId: string,
): Promise<YoutubePlaylistPreview | null> {
  const oembed = await fetchFromOembed(playlistId).catch(() => null);
  if (oembed?.thumbnailUrl) return oembed;

  // 유튜브 인증(API 키·OAuth)이 하나도 없으면 예외가 나므로 조용히 넘긴다.
  return await fetchFromDataApi(playlistId).catch(() => null);
}
