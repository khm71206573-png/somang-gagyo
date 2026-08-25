import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isMissingColumnError } from "@/lib/supabase/errors";
import { toEventRepeatType, type EventRepeatType } from "@/lib/eventRecurrence";

type EventType = "church" | "gagyo" | "birthday" | "other";

interface CreateEventBody {
  eventDate?: string;
  title?: string;
  type?: EventType;
  startTime?: string;
  location?: string;
  description?: string;
  repeatType?: EventRepeatType;
  repeatUntil?: string;
}

const VALID_TYPES: EventType[] = ["church", "gagyo", "birthday", "other"];

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
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

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

  const body = (await request.json().catch(() => null)) as CreateEventBody | null;
  const eventDate = body?.eventDate?.trim();
  const title = body?.title?.trim();
  const type = body?.type && VALID_TYPES.includes(body.type) ? body.type : "church";

  if (!eventDate || !title) {
    return NextResponse.json({ error: "날짜와 일정 제목을 입력해주세요." }, { status: 400 });
  }

  const repeatType = toEventRepeatType(body?.repeatType);
  const row = {
    title,
    description: body?.description?.trim() || null,
    event_date: eventDate,
    start_time: body?.startTime?.trim() || null,
    location: body?.location?.trim() || null,
    type,
    created_by: user.id,
    repeat_type: repeatType,
    // 반복하지 않는 일정에는 종료일이 의미가 없다.
    repeat_until:
      repeatType === "none" ? null : body?.repeatUntil?.trim() || null,
  };

  let { error } = await supabase.from("events").insert(row);

  // 반복 마이그레이션 전이어도 일정 등록 자체는 되도록 그 컬럼만 빼고 다시 시도한다.
  if (error && isMissingColumnError(error)) {
    ({ error } = await supabase.from("events").insert(withoutRepeat(row)));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** repeat 컬럼이 없는 DB로 보낼 때 그 두 값만 뺀다. */
function withoutRepeat<T extends { repeat_type: unknown; repeat_until: unknown }>(
  row: T,
) {
  const { repeat_type: _type, repeat_until: _until, ...rest } = row;
  void _type;
  void _until;
  return rest;
}
