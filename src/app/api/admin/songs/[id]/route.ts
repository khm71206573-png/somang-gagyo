import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blocksToLines } from "@/lib/adminFormParsing";
import { unwrapRelation } from "@/lib/supabase/queries/utils";

interface UpdateSongBody {
  songDate?: string;
  title?: string;
  artist?: string;
  coverImageUrl?: string;
  youtubeUrl?: string;
  lyrics?: string;
  reason?: string;
}

interface SongRow {
  id: string;
  title: string;
  artist: string | null;
  cover_image_url: string | null;
  youtube_url: string | null;
  lyrics: unknown;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      errorResponse: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" || profile?.status !== "approved") {
    return {
      supabase,
      errorResponse: NextResponse.json({ error: "관리자만 사용할 수 있어요." }, { status: 403 }),
    };
  }

  return { supabase, errorResponse: null };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("daily_songs")
    .select("*, songs(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "찬양을 찾을 수 없어요." }, { status: 404 });
  }

  const song = unwrapRelation<SongRow>(
    data.songs as SongRow | SongRow[] | null | undefined,
  );

  return NextResponse.json({
    id: data.id,
    song_id: data.song_id,
    song_date: data.song_date,
    reason: data.reason,
    title: song?.title ?? "",
    artist: song?.artist ?? null,
    cover_image_url: song?.cover_image_url ?? null,
    youtube_url: song?.youtube_url ?? null,
    lyrics: song?.lyrics ?? [],
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data: existing, error: existingError } = await supabase
    .from("daily_songs")
    .select("song_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "찬양을 찾을 수 없어요." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as UpdateSongBody | null;
  const songDate = body?.songDate?.trim();
  const title = body?.title?.trim();
  const artist = body?.artist?.trim() || null;
  const coverImageUrl = body?.coverImageUrl?.trim() || null;
  const youtubeUrl = body?.youtubeUrl?.trim() || null;
  const reason = body?.reason?.trim() || null;

  if (!songDate || !title) {
    return NextResponse.json({ error: "날짜와 곡 제목을 입력해주세요." }, { status: 400 });
  }

  const lyrics = blocksToLines(body?.lyrics ?? "").map((lines) => ({
    lines,
    highlighted: false,
  }));

  const { error: songError } = await supabase
    .from("songs")
    .update({
      title,
      artist,
      cover_image_url: coverImageUrl,
      youtube_url: youtubeUrl,
      lyrics,
    })
    .eq("id", existing.song_id);

  if (songError) {
    return NextResponse.json({ error: songError.message }, { status: 500 });
  }

  const { error: dailySongError } = await supabase
    .from("daily_songs")
    .update({
      song_date: songDate,
      reason,
    })
    .eq("id", id);

  if (dailySongError) {
    const message =
      dailySongError.code === "23505"
        ? "해당 날짜에 이미 등록된 찬양이 있어요."
        : dailySongError.message;
    return NextResponse.json(
      { error: message },
      { status: dailySongError.code === "23505" ? 409 : 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data: existing } = await supabase
    .from("daily_songs")
    .select("song_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("daily_songs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // daily_songs 삭제 후 이 곡을 참조하는 다른 daily_songs가 없으면
  // songs 행도 함께 지운다 (그대로 두면 고아 행이 되어, syncSong의
  // youtube_url 중복 체크에 계속 걸려 같은 영상을 다시는 못 가져오게 됨).
  if (existing?.song_id) {
    const { count } = await supabase
      .from("daily_songs")
      .select("id", { count: "exact", head: true })
      .eq("song_id", existing.song_id);

    if (!count) {
      await supabase.from("songs").delete().eq("id", existing.song_id);
    }
  }

  return NextResponse.json({ ok: true });
}
