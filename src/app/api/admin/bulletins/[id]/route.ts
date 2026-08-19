import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linesToArray } from "@/lib/adminFormParsing";

interface UpdateBulletinBody {
  bulletinDate?: string;
  imageUrls?: string;
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
    .from("bulletins")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "주보를 찾을 수 없어요." }, { status: 404 });
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

  const body = (await request.json().catch(() => null)) as UpdateBulletinBody | null;
  const bulletinDate = body?.bulletinDate?.trim();
  const imageUrls = linesToArray(body?.imageUrls ?? "");

  if (!bulletinDate || imageUrls.length === 0) {
    return NextResponse.json(
      { error: "날짜와 이미지 URL을 입력해주세요." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("bulletins")
    .update({
      bulletin_date: bulletinDate,
      image_urls: imageUrls,
    })
    .eq("id", id);

  if (error) {
    const message =
      error.code === "23505" ? "해당 날짜에 이미 등록된 주보가 있어요." : error.message;
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

  const { error } = await supabase.from("bulletins").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
