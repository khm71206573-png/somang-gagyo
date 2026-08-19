import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { blocksToLines } from "@/lib/adminFormParsing";

interface CreateSongBody {
  songDate?: string;
  title?: string;
  artist?: string;
  coverImageUrl?: string;
  youtubeUrl?: string;
  lyrics?: string;
  reason?: string;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" || profile?.status !== "approved") {
    return NextResponse.json({ error: "관리자만 사용할 수 있어요." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("daily_songs")
    .select("*, songs(*)")
    .order("song_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" || profile?.status !== "approved") {
    return NextResponse.json({ error: "관리자만 사용할 수 있어요." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as CreateSongBody | null;
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

  const { data: song, error: songError } = await supabase
    .from("songs")
    .insert({
      title,
      artist,
      cover_image_url: coverImageUrl,
      youtube_url: youtubeUrl,
      lyrics,
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
    song_date: songDate,
    reason,
    created_by: user.id,
  });

  if (dailySongError) {
    await supabase.from("songs").delete().eq("id", song.id);
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
