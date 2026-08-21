import { createServiceClient } from "@/lib/supabase/service";
import { getAccessToken } from "@/lib/youtube/getAccessToken";
import { toDateString } from "@/lib/supabase/queries/utils";
import { HttpError } from "./HttpError";

const CHANNELS_URL =
  "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true";
const PLAYLIST_ITEMS_URL = "https://www.googleapis.com/youtube/v3/playlistItems";

export interface LikedSong {
  title: string;
  artist: string | null;
  coverImageUrl: string | null;
  youtubeUrl: string;
}

export type FetchLikedSongResult =
  | ({ ok: true; skipped: false } & LikedSong)
  | { ok: true; skipped: true; reason: string };

const PLAYLIST_PAGE_SIZE = 25;

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

/**
 * 유튜브 "좋아요 표시한 동영상" 목록에서 아직 등록되지 않은 가장 최근 곡을 가져온다 (DB에 쓰지 않음).
 * 이미 songs 테이블에 있는 곡은 건너뛰므로, 맨 위 곡이 등록된 상태여도 그 다음 새 곡을 찾아온다.
 *
 * YouTube API 호출 실패는 HttpError(502)를 throw한다.
 */
export async function fetchLikedSong(): Promise<FetchLikedSongResult> {
  let candidates: LikedSong[];

  try {
    const accessToken = await getAccessToken();
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const channelsResponse = await fetch(CHANNELS_URL, { headers: authHeaders });
    if (!channelsResponse.ok) {
      throw new HttpError(
        `YouTube 채널 정보를 불러오지 못했어요. (status ${channelsResponse.status})`,
        502,
      );
    }

    const channelsData = await channelsResponse.json();
    const likesPlaylistId = channelsData?.items?.[0]?.contentDetails?.relatedPlaylists?.likes as
      | string
      | undefined;

    if (!likesPlaylistId) {
      return {
        ok: true,
        skipped: true,
        reason: "좋아요 표시한 동영상 재생목록을 찾지 못했어요.",
      };
    }

    const playlistUrl = `${PLAYLIST_ITEMS_URL}?part=snippet&playlistId=${likesPlaylistId}&maxResults=${PLAYLIST_PAGE_SIZE}`;
    const playlistResponse = await fetch(playlistUrl, { headers: authHeaders });
    if (!playlistResponse.ok) {
      throw new HttpError(
        `좋아요 표시한 동영상 목록을 불러오지 못했어요. (status ${playlistResponse.status})`,
        502,
      );
    }

    const playlistData = await playlistResponse.json();
    const items = (playlistData?.items ?? []) as { snippet?: PlaylistSnippet }[];

    candidates = items
      .map((item) => toLikedSong(item.snippet))
      .filter((song): song is LikedSong => song !== null);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    const message = error instanceof Error ? error.message : "유튜브 좋아요 목록 동기화에 실패했어요.";
    throw new HttpError(message, 502);
  }

  if (candidates.length === 0) {
    return { ok: true, skipped: true, reason: "좋아요 표시한 동영상이 없어요." };
  }

  const supabase = createServiceClient();
  const { data: registered, error: registeredError } = await supabase
    .from("songs")
    .select("youtube_url")
    .in(
      "youtube_url",
      candidates.map((song) => song.youtubeUrl),
    );

  if (registeredError) {
    throw new HttpError(registeredError.message, 500);
  }

  const registeredUrls = new Set(
    (registered ?? []).map((row) => row.youtube_url as string),
  );
  const nextSong = candidates.find((song) => !registeredUrls.has(song.youtubeUrl));

  if (!nextSong) {
    return {
      ok: true,
      skipped: true,
      reason: "좋아요 목록의 곡이 모두 이미 등록되어 있어요.",
    };
  }

  return { ok: true, skipped: false, ...nextSong };
}

export type SyncSongResult =
  | { ok: true; inserted: true; youtubeUrl: string }
  | { ok: true; skipped: true; reason: string };

/**
 * 유튜브 좋아요 표시한 동영상 목록에서 최신 곡을 가져와 songs/daily_songs 테이블에 저장한다.
 * Cron·관리자 수동 실행 버튼 양쪽에서 동일한 동기화 로직을 쓰기 위한 공용 함수.
 *
 * YouTube API 호출 실패는 HttpError(502)를 throw한다.
 * songs/daily_songs insert 실패(23505 제외)는 HttpError(500)를 throw한다.
 */
export async function syncSong(): Promise<SyncSongResult> {
  const fetched = await fetchLikedSong();

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
    reason: "유튜브 좋아요 목록에서 자동 추가",
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
