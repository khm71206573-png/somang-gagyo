import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeGroupMaterials } from "@/lib/automation/scrapeGroupMaterials";
import { HttpError } from "@/lib/automation/HttpError";

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
    const result = await scrapeGroupMaterials();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "교제 자료를 가져오지 못했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
