import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface DecisionBody {
  status?: "approved" | "rejected";
  role?: "member" | "admin";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: requester } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (requester?.role !== "admin" || requester?.status !== "approved") {
    return NextResponse.json({ error: "관리자만 사용할 수 있어요." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as DecisionBody | null;
  const status = body?.status;
  const role = body?.role;

  if (status === undefined && role === undefined) {
    return NextResponse.json(
      { error: "바꿀 내용이 없어요." },
      { status: 400 },
    );
  }

  if (status !== undefined && status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "status 값이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (role !== undefined && role !== "member" && role !== "admin") {
    return NextResponse.json(
      { error: "role 값이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (role === "member" && id === user.id) {
    return NextResponse.json(
      { error: "본인의 관리자 권한은 여기서 내릴 수 없어요." },
      { status: 400 },
    );
  }

  const update: Record<string, string | null> = {};
  if (status !== undefined) {
    update.status = status;
    update.approved_at = status === "approved" ? new Date().toISOString() : null;
  }
  if (role !== undefined) {
    update.role = role;
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
