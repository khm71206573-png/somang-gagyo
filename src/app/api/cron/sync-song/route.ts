import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getAccessToken } from "@/lib/youtube/getAccessToken";
import { toDateString } from "@/lib/supabase/queries/utils";

export const dynamic = "force-dynamic";

const CHANNELS_URL =
  "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true";
const PLAYLIST_ITEMS_URL = "https://www.googleapis.com/youtube/v3/playlistItems";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

interface LikedSong {
  title: string;
  artist: string | null;
  coverImageUrl: string | null;
  youtubeUrl: string;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let likedSong: LikedSong | null;

  try {
    const accessToken = await getAccessToken();
    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const channelsResponse = await fetch(CHANNELS_URL, { headers: authHeaders });
    if (!channelsResponse.ok) {
      return NextResponse.json(
        { error: `YouTube 채널 정보를 불러오지 못했어요. (status ${channelsResponse.status})` },
        { status: 502 },
      );
    }

    const channelsData = await channelsResponse.json();
    const likesPlaylistId = channelsData?.items?.[0]?.contentDetails?.relatedPlaylists?.likes as
      | string
      | undefined;

    if (!likesPlaylistId) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "좋아요 표시한 동영상 재생목록을 찾지 못했어요.",
      });
    }

    const playlistUrl = `${PLAYLIST_ITEMS_URL}?part=snippet&playlistId=${likesPlaylistId}&maxResults=5`;
    const playlistResponse = await fetch(playlistUrl, { headers: authHeaders });
    if (!playlistResponse.ok) {
      return NextResponse.json(
        { error: `좋아요 표시한 동영상 목록을 불러오지 못했어요. (status ${playlistResponse.status})` },
        { status: 502 },
      );
    }

    const playlistData = await playlistResponse.json();
    const snippet = playlistData?.items?.[0]?.snippet;

    if (!snippet) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "좋아요 표시한 동영상이 없어요.",
      });
    }

    const videoId = snippet?.resourceId?.videoId as string | undefined;
    if (!videoId) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "동영상 ID를 찾지 못했어요.",
      });
    }

    const title = (snippet.title as string | undefined)?.trim();
    if (!title) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "동영상 제목을 찾지 못했어요.",
      });
    }

    const artist =
      (snippet.videoOwnerChannelTitle as string | undefined) ??
      (snippet.channelTitle as string | undefined) ??
      null;

    const coverImageUrl =
      (snippet.thumbnails?.high?.url as string | undefined) ??
      (snippet.thumbnails?.default?.url as string | undefined) ??
      null;

    likedSong = {
      title,
      artist,
      coverImageUrl,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "유튜브 좋아요 목록 동기화에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const supabase = createServiceClient();

  const { data: existingSong } = await supabase
    .from("songs")
    .select("id")
    .eq("youtube_url", likedSong.youtubeUrl)
    .maybeSingle();

  if (existingSong) {
    return NextResponse.json({ ok: true, skipped: true, reason: "no new liked song" });
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
    return NextResponse.json(
      { error: songError?.message ?? "찬양 곡 저장에 실패했어요." },
      { status: 500 },
    );
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
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "daily song already set for today",
      });
    }

    return NextResponse.json({ error: dailySongError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: true, youtubeUrl: likedSong.youtubeUrl });
}
