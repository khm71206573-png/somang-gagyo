import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSong } from "@/lib/automation/syncSong";

export const dynamic = "force-dynamic";

export async function POST() {
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

  try {
    const result = await syncSong();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "유튜브 좋아요 목록 동기화에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
