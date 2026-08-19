import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linesToArray, blocksToLines } from "@/lib/adminFormParsing";

interface UpdateSermonBody {
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
    .from("sermons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "설교를 찾을 수 없어요." }, { status: 404 });
  }

  const { data: sermonSongs, error: sermonSongsError } = await supabase
    .from("sermon_songs")
    .select("*")
    .eq("sermon_id", id)
    .order("display_order", { ascending: true });

  if (sermonSongsError) {
    return NextResponse.json({ error: sermonSongsError.message }, { status: 500 });
  }

  return NextResponse.json({ ...data, sermonSongs: sermonSongs ?? [] });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = (await request.json().catch(() => null)) as UpdateSermonBody | null;
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

  const { error: sermonError } = await supabase
    .from("sermons")
    .update({
      category_label: body?.categoryLabel?.trim() || null,
      title,
      reference: body?.reference?.trim() || null,
      preacher: body?.preacher?.trim() || null,
      sermon_date: sermonDate,
      quote: body?.quote?.trim() || null,
      summary_paragraphs: summaryParagraphs,
      sharing_questions: sharingQuestions,
    })
    .eq("id", id);

  if (sermonError) {
    return NextResponse.json({ error: sermonError.message }, { status: 500 });
  }

  const { error: deleteSongsError } = await supabase
    .from("sermon_songs")
    .delete()
    .eq("sermon_id", id);

  if (deleteSongsError) {
    return NextResponse.json(
      { error: `설교는 저장됐지만 악보 목록 갱신에 실패했어요: ${deleteSongsError.message}` },
      { status: 500 },
    );
  }

  if (sermonSongs.length > 0) {
    const { error: insertSongsError } = await supabase
      .from("sermon_songs")
      .insert(sermonSongs.map((song) => ({ ...song, sermon_id: id })));

    if (insertSongsError) {
      return NextResponse.json(
        { error: `설교는 저장됐지만 악보 목록 저장에 실패했어요: ${insertSongsError.message}` },
        { status: 500 },
      );
    }
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

  const { error } = await supabase.from("sermons").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
