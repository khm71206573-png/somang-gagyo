import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendCheerNotifications } from "@/lib/push/sendCheerNotifications";
import { toDateString } from "@/lib/supabase/queries/utils";

export const dynamic = "force-dynamic";

/** 같은 플랜을 읽는 사람들에게 응원을 보낸다. (하루 한 번) */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: memberPlan } = await supabase
    .from("member_plans")
    .select("plan_id")
    .eq("member_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!memberPlan) {
    return NextResponse.json(
      { error: "진행 중인 통독 플랜이 없어요." },
      { status: 422 },
    );
  }

  // 하루 한 번 제한은 (from_member_id, cheer_date) unique 제약으로 걸려 있다.
  const { error: insertError } = await supabase.from("reading_cheers").insert({
    from_member_id: user.id,
    plan_id: memberPlan.plan_id,
    cheer_date: toDateString(new Date()),
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "오늘은 이미 응원을 보냈어요." },
        { status: 409 },
      );
    }
    // reading_cheers 마이그레이션이 아직 적용되지 않은 경우
    if (insertError.code === "42P01") {
      return NextResponse.json(
        { error: "응원 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: insertError.message ?? "응원을 보내지 못했어요." },
      { status: 500 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  const result = await sendCheerNotifications(
    memberPlan.plan_id,
    user.id,
    profile?.name ?? "성도",
  );

  return NextResponse.json({ ok: true, sent: result.sent });
}
