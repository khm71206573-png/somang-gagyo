import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPendingApprovalNotification } from "@/lib/push/sendPendingApprovalNotification";

interface OnboardingBody {
  name?: string;
  groupName?: string;
  phone?: string | null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as OnboardingBody | null;
  const name = body?.name?.trim();
  const groupName = body?.groupName?.trim();
  const phone = body?.phone?.trim() || null;

  if (!name || !groupName) {
    return NextResponse.json(
      { error: "이름과 소속 가교를 입력해주세요." },
      { status: 400 },
    );
  }

  // profiles.status에는 별도의 "온보딩 전" 값이 없어 status는 건드리지 않고
  // name/gyogyo만 채운다 (middleware가 이 두 값의 존재 여부로 온보딩 완료를 판단).
  // 이미 승인된 계정이 이 엔드포인트를 다시 호출하는 것만 막아둔다.
  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("[api/onboarding] 기존 상태 조회 실패:", fetchError.message);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!existing) {
    // profiles 행 자체가 없는 경우 — 가입 시 자동 생성 트리거가 없거나
    // 동작하지 않고 있다는 뜻. 조용히 "성공"으로 넘기면 아무 것도 저장되지
    // 않은 채 무한 루프에 빠지므로 여기서 명확히 알려준다.
    console.error(
      `[api/onboarding] profiles 행이 존재하지 않음 (user=${user.id}). 가입 시 자동 생성 트리거를 확인하세요.`,
    );
    return NextResponse.json(
      { error: "프로필이 아직 생성되지 않았어요. 관리자에게 문의해주세요." },
      { status: 404 },
    );
  }

  if (existing.status === "approved") {
    return NextResponse.json(
      { error: "이미 승인된 계정이에요." },
      { status: 409 },
    );
  }

  const { data: updatedRows, error } = await supabase
    .from("profiles")
    .update({ name, gyogyo: groupName, phone })
    .eq("id", user.id)
    .select("id");

  if (error) {
    console.error("[api/onboarding] 프로필 업데이트 실패:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!updatedRows || updatedRows.length === 0) {
    console.error(
      `[api/onboarding] 업데이트가 0건 반영됨 (user=${user.id}). RLS 정책의 UPDATE 권한을 확인하세요.`,
    );
    return NextResponse.json(
      { error: "프로필을 저장하지 못했어요. (권한 문제로 추정)" },
      { status: 500 },
    );
  }

  // 승인 대기가 쌓이는 걸 관리자가 바로 알 수 있도록 알림을 보낸다.
  // 푸시 설정이 없어도 가입 신청 자체는 성공해야 하므로 실패는 삼킨다.
  try {
    await sendPendingApprovalNotification({ name, groupName });
  } catch (notifyError) {
    console.error("[api/onboarding] 승인 요청 알림 발송 실패:", notifyError);
  }

  return NextResponse.json({ ok: true });
}
