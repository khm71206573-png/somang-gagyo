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

/**
 * 유튜브 "좋아요 표시한 동영상" 목록에서 가장 최근 곡 정보를 가져온다 (DB에 쓰지 않음).
 * 관리자 등록 화면에서 입력칸을 자동으로 채우는 용도.
 *
 * YouTube API 호출 실패는 HttpError(502)를 throw한다.
 */
export async function fetchLikedSong(): Promise<FetchLikedSongResult> {
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

    const playlistUrl = `${PLAYLIST_ITEMS_URL}?part=snippet&playlistId=${likesPlaylistId}&maxResults=5`;
    const playlistResponse = await fetch(playlistUrl, { headers: authHeaders });
    if (!playlistResponse.ok) {
      throw new HttpError(
        `좋아요 표시한 동영상 목록을 불러오지 못했어요. (status ${playlistResponse.status})`,
        502,
      );
    }

    const playlistData = await playlistResponse.json();
    const snippet = playlistData?.items?.[0]?.snippet;

    if (!snippet) {
      return { ok: true, skipped: true, reason: "좋아요 표시한 동영상이 없어요." };
    }

    const videoId = snippet?.resourceId?.videoId as string | undefined;
    if (!videoId) {
      return { ok: true, skipped: true, reason: "동영상 ID를 찾지 못했어요." };
    }

    const title = (snippet.title as string | undefined)?.trim();
    if (!title) {
      return { ok: true, skipped: true, reason: "동영상 제목을 찾지 못했어요." };
    }

    const artist =
      (snippet.videoOwnerChannelTitle as string | undefined) ??
      (snippet.channelTitle as string | undefined) ??
      null;

    const coverImageUrl =
      (snippet.thumbnails?.high?.url as string | undefined) ??
      (snippet.thumbnails?.default?.url as string | undefined) ??
      null;

    return {
      ok: true,
      skipped: false,
      title,
      artist,
      coverImageUrl,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    const message = error instanceof Error ? error.message : "유튜브 좋아요 목록 동기화에 실패했어요.";
    throw new HttpError(message, 502);
  }
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

  const { data: existingSong } = await supabase
    .from("songs")
    .select("id")
    .eq("youtube_url", likedSong.youtubeUrl)
    .maybeSingle();

  if (existingSong) {
    return { ok: true, skipped: true, reason: "no new liked song" };
  }

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
