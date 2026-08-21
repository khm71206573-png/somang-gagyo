import { createServiceClient } from "@/lib/supabase/service";
import {
  recommendedPlaylistTitle,
  resolveSongPlaylist,
  type SongSource,
} from "@/lib/youtube/resolvePlaylist";
import { toDateString } from "@/lib/supabase/queries/utils";
import { HttpError } from "./HttpError";

const PLAYLIST_ITEMS_URL = "https://www.googleapis.com/youtube/v3/playlistItems";

/** 소스별로 사용자에게 보여줄 이름 (오류·안내 문구에 쓴다) */
function sourceLabel(source: SongSource) {
  return source === "recommended"
    ? `${recommendedPlaylistTitle()} 재생목록`
    : "좋아요 표시한 동영상";
}

export interface LikedSong {
  title: string;
  artist: string | null;
  coverImageUrl: string | null;
  youtubeUrl: string;
}

export type FetchLikedSongResult =
  | ({ ok: true; skipped: false } & LikedSong)
  | { ok: true; skipped: true; reason: string };

const PLAYLIST_PAGE_SIZE = 50;
// 직접 만든 재생목록은 추가한 순서대로 쌓여서 뒤쪽에 새 곡이 있을 수 있다.
// 첫 페이지만 보면 "모두 등록됨"으로 잘못 판단하므로 여러 페이지를 훑는다.
const PLAYLIST_MAX_PAGES = 4;

interface PlaylistSnippet {
  title?: string;
  channelTitle?: string;
  videoOwnerChannelTitle?: string;
  resourceId?: { videoId?: string };
  thumbnails?: { high?: { url?: string }; default?: { url?: string } };
}

function toLikedSong(snippet: PlaylistSnippet | undefined): LikedSong | null {
  const videoId = snippet?.resourceId?.videoId;
  const title = snippet?.title?.trim();

  if (!videoId || !title) return null;

  return {
    title,
    artist: snippet.videoOwnerChannelTitle ?? snippet.channelTitle ?? null,
    coverImageUrl:
      snippet.thumbnails?.high?.url ?? snippet.thumbnails?.default?.url ?? null,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

/** 이미 등록된 곡인지 확인한다. URL이 길어지지 않도록 나눠서 조회한다. */
async function fetchRegisteredUrls(urls: string[]): Promise<Set<string>> {
  const supabase = createServiceClient();
  const registered = new Set<string>();
  const CHUNK_SIZE = 50;

  for (let start = 0; start < urls.length; start += CHUNK_SIZE) {
    const chunk = urls.slice(start, start + CHUNK_SIZE);
    const { data, error } = await supabase
      .from("songs")
      .select("youtube_url")
      .in("youtube_url", chunk);

    if (error) {
      throw new HttpError(error.message, 500);
    }

    for (const row of data ?? []) {
      registered.add(row.youtube_url as string);
    }
  }

  return registered;
}

/**
 * 지정한 유튜브 재생목록에서 아직 등록되지 않은 가장 최근 곡을 가져온다 (DB에 쓰지 않음).
 * source가 "liked"면 좋아요 표시한 동영상, "recommended"면 추천찬양 재생목록을 본다.
 * 이미 songs 테이블에 있는 곡은 건너뛰므로, 맨 위 곡이 등록된 상태여도 그 다음 새 곡을 찾아온다.
 *
 * YouTube API 호출 실패는 HttpError(502)를 throw한다.
 */
export async function fetchSongFromSource(
  source: SongSource = "liked",
): Promise<FetchLikedSongResult> {
  let candidates: LikedSong[];

  try {
    const playlist = await resolveSongPlaylist(source);
    if (!playlist.ok) {
      return { ok: true, skipped: true, reason: playlist.reason };
    }

    candidates = [];
    let pageToken: string | undefined;

    for (let page = 0; page < PLAYLIST_MAX_PAGES; page += 1) {
      const playlistUrl = new URL(PLAYLIST_ITEMS_URL);
      playlistUrl.searchParams.set("part", "snippet");
      playlistUrl.searchParams.set("playlistId", playlist.playlistId);
      playlistUrl.searchParams.set("maxResults", String(PLAYLIST_PAGE_SIZE));
      if (pageToken) playlistUrl.searchParams.set("pageToken", pageToken);

      const playlistResponse = await fetch(playlistUrl, {
        headers: playlist.authHeaders,
      });
      if (!playlistResponse.ok) {
        throw new HttpError(
          `${sourceLabel(source)} 목록을 불러오지 못했어요. (status ${playlistResponse.status})`,
          502,
        );
      }

      const playlistData = await playlistResponse.json();
      const items = (playlistData?.items ?? []) as { snippet?: PlaylistSnippet }[];

      candidates.push(
        ...items
          .map((item) => toLikedSong(item.snippet))
          .filter((song): song is LikedSong => song !== null),
      );

      pageToken = playlistData?.nextPageToken as string | undefined;
      if (!pageToken) break;
    }
  } catch (error) {
    if (error instanceof HttpError) throw error;
    const message =
      error instanceof Error ? error.message : "유튜브 목록을 가져오지 못했어요.";
    throw new HttpError(message, 502);
  }

  if (candidates.length === 0) {
    return { ok: true, skipped: true, reason: `${sourceLabel(source)}에 곡이 없어요.` };
  }

  const registeredUrls = await fetchRegisteredUrls(
    candidates.map((song) => song.youtubeUrl),
  );
  const nextSong = candidates.find((song) => !registeredUrls.has(song.youtubeUrl));

  if (!nextSong) {
    return {
      ok: true,
      skipped: true,
      reason: `${sourceLabel(source)}의 곡이 모두 이미 등록되어 있어요.`,
    };
  }

  return { ok: true, skipped: false, ...nextSong };
}

export type SyncSongResult =
  | { ok: true; inserted: true; youtubeUrl: string }
  | { ok: true; skipped: true; reason: string };

/**
 * 유튜브 재생목록에서 최신 곡을 가져와 songs/daily_songs 테이블에 저장한다.
 * Cron·관리자 수동 실행 양쪽에서 동일한 동기화 로직을 쓰기 위한 공용 함수.
 *
 * YouTube API 호출 실패는 HttpError(502)를 throw한다.
 * songs/daily_songs insert 실패(23505 제외)는 HttpError(500)를 throw한다.
 */
export async function syncSong(
  source: SongSource = "liked",
): Promise<SyncSongResult> {
  const fetched = await fetchSongFromSource(source);

  if (fetched.skipped) {
    return fetched;
  }

  const likedSong: LikedSong = fetched;
  const supabase = createServiceClient();

  const { data: song, error: songError } = await supabase
    .from("songs")
    .insert({
      title: likedSong.title,
      artist: likedSong.artist,
      cover_image_url: likedSong.coverImageUrl,
      youtube_url: likedSong.youtubeUrl,
      lyrics: [],
    })
    .select("id")
    .single();

  if (songError || !song) {
    throw new HttpError(songError?.message ?? "찬양 곡 저장에 실패했어요.", 500);
  }

  const { error: dailySongError } = await supabase.from("daily_songs").insert({
    song_id: song.id,
    song_date: toDateString(new Date()),
    reason: `유튜브 ${sourceLabel(source)}에서 자동 추가`,
    created_by: null,
  });

  if (dailySongError) {
    await supabase.from("songs").delete().eq("id", song.id);

    if (dailySongError.code === "23505") {
      return { ok: true, skipped: true, reason: "daily song already set for today" };
    }

    throw new HttpError(dailySongError.message, 500);
  }

  return { ok: true, inserted: true, youtubeUrl: likedSong.youtubeUrl };
}
