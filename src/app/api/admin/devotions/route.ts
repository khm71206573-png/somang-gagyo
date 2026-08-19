import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linesToArray } from "@/lib/adminFormParsing";

interface CreateDevotionBody {
  devotionDate?: string;
  tag?: string;
  title?: string;
  reference?: string;
  verses?: string;
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
    .from("devotions")
    .select("*")
    .order("devotion_date", { ascending: false });

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

  const body = (await request.json().catch(() => null)) as CreateDevotionBody | null;
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

  const { error } = await supabase.from("devotions").insert({
    devotion_date: devotionDate,
    tag,
    title,
    reference,
    verses,
    created_by: user.id,
  });

  if (error) {
    const message =
      error.code === "23505" ? "해당 날짜에 이미 등록된 묵상이 있어요." : error.message;
    return NextResponse.json({ error: message }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json({ ok: true });
}
