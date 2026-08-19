import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linesToArray } from "@/lib/adminFormParsing";

interface UpdateDevotionBody {
  devotionDate?: string;
  tag?: string;
  title?: string;
  reference?: string;
  verses?: string;
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
    .from("devotions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "묵상을 찾을 수 없어요." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = (await request.json().catch(() => null)) as UpdateDevotionBody | null;
  const devotionDate = body?.devotionDate?.trim();
  const title = body?.title?.trim();
  const reference = body?.reference?.trim();
  const tag = body?.tag?.trim() || null;
  const verseLines = linesToArray(body?.verses ?? "");

  if (!devotionDate || !title || !reference || verseLines.length === 0) {
    return NextResponse.json(
      { error: "날짜, 제목, 본문 구절, 말씀 내용을 입력해주세요." },
      { status: 400 },
    );
  }

  const verses = verseLines.map((text, index) => ({ number: index + 1, text }));

  const { error } = await supabase
    .from("devotions")
    .update({
      devotion_date: devotionDate,
      tag,
      title,
      reference,
      verses,
    })
    .eq("id", id);

  if (error) {
    const message =
      error.code === "23505" ? "해당 날짜에 이미 등록된 묵상이 있어요." : error.message;
    return NextResponse.json({ error: message }, { status: error.code === "23505" ? 409 : 500 });
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

  const { error } = await supabase.from("devotions").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
