import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processDueNotifications } from "@/lib/push/processDueNotifications";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("members")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (member?.role !== "admin" || member?.status !== "approved") {
    return NextResponse.json({ error: "관리자만 사용할 수 있어요." }, { status: 403 });
  }

  try {
    const result = await processDueNotifications();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "발송에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
