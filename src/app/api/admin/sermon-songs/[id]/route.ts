import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "sheet-music";
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data: row } = await supabase
    .from("sermon_songs")
    .select("sheet_url")
    .eq("id", id)
    .maybeSingle();

  if (row?.sheet_url) {
    const prefixIndex = row.sheet_url.indexOf(PUBLIC_PREFIX);
    if (prefixIndex !== -1) {
      const path = row.sheet_url.slice(prefixIndex + PUBLIC_PREFIX.length);
      await supabase.storage.from(BUCKET).remove([path]);
    }
  }

  const { error } = await supabase.from("sermon_songs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
