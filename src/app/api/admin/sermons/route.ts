import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linesToArray, blocksToLines } from "@/lib/adminFormParsing";

interface CreateSermonBody {
  sermonDate?: string;
  categoryLabel?: string;
  title?: string;
  reference?: string;
  preacher?: string;
  quote?: string;
  summaryParagraphs?: string;
  sharingQuestions?: string;
  sermonSongs?: string;
}

function parseSermonSongs(text: string) {
  return linesToArray(text).map((line, index) => {
    const [title, musicalKey] = line.split("|").map((part) => part.trim());
    return {
      title: title || line.trim(),
      musical_key: musicalKey || null,
      display_order: index,
    };
  });
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
    .from("sermons")
    .select("*")
    .order("sermon_date", { ascending: false });

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

  const body = (await request.json().catch(() => null)) as CreateSermonBody | null;
  const sermonDate = body?.sermonDate?.trim();
  const title = body?.title?.trim();

  if (!sermonDate || !title) {
    return NextResponse.json({ error: "날짜와 설교 제목을 입력해주세요." }, { status: 400 });
  }

  const summaryParagraphs = blocksToLines(body?.summaryParagraphs ?? "").map((lines) =>
    lines.join(" "),
  );
  const sharingQuestions = linesToArray(body?.sharingQuestions ?? "").map((question, index) => ({
    id: index + 1,
    question,
  }));
  const sermonSongs = parseSermonSongs(body?.sermonSongs ?? "");

  const { data: sermon, error: sermonError } = await supabase
    .from("sermons")
    .insert({
      category_label: body?.categoryLabel?.trim() || null,
      title,
      reference: body?.reference?.trim() || null,
      preacher: body?.preacher?.trim() || null,
      sermon_date: sermonDate,
      quote: body?.quote?.trim() || null,
      summary_paragraphs: summaryParagraphs,
      sharing_questions: sharingQuestions,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (sermonError || !sermon) {
    return NextResponse.json(
      { error: sermonError?.message ?? "설교 저장에 실패했어요." },
      { status: 500 },
    );
  }

  if (sermonSongs.length > 0) {
    const { error: songsError } = await supabase
      .from("sermon_songs")
      .insert(sermonSongs.map((song) => ({ ...song, sermon_id: sermon.id })));

    if (songsError) {
      return NextResponse.json(
        { error: `설교는 저장됐지만 악보 목록 저장에 실패했어요: ${songsError.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
