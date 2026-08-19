import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "sheet-music";

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

export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const sermonId = formData?.get("sermonId");

  if (!(file instanceof File) || typeof sermonId !== "string" || !sermonId) {
    return NextResponse.json({ error: "파일과 설교 정보가 필요해요." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있어요." }, { status: 400 });
  }

  const safeName = file.name.replace(/[^\w.\-가-힣]/g, "_");
  const path = `${sermonId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { count } = await supabase
    .from("sermon_songs")
    .select("id", { count: "exact", head: true })
    .eq("sermon_id", sermonId);

  const title = safeName.replace(/\.[^.]+$/, "");

  const { data: inserted, error: insertError } = await supabase
    .from("sermon_songs")
    .insert({
      sermon_id: sermonId,
      title,
      sheet_url: publicUrl,
      display_order: count ?? 0,
    })
    .select("*")
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(inserted);
}
