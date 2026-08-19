import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linesToArray } from "@/lib/adminFormParsing";

interface CreateBulletinBody {
  bulletinDate?: string;
  imageUrls?: string;
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
    .from("bulletins")
    .select("*")
    .order("bulletin_date", { ascending: false });

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

  const body = (await request.json().catch(() => null)) as CreateBulletinBody | null;
  const bulletinDate = body?.bulletinDate?.trim();
  const imageUrls = linesToArray(body?.imageUrls ?? "");

  if (!bulletinDate || imageUrls.length === 0) {
    return NextResponse.json(
      { error: "날짜와 이미지 URL을 입력해주세요." },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("bulletins").insert({
    bulletin_date: bulletinDate,
    image_urls: imageUrls,
    created_by: user.id,
  });

  if (error) {
    const message =
      error.code === "23505" ? "해당 날짜에 이미 등록된 주보가 있어요." : error.message;
    return NextResponse.json({ error: message }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json({ ok: true });
}
