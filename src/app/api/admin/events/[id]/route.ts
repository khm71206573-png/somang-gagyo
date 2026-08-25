import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isMissingColumnError } from "@/lib/supabase/errors";
import { toEventRepeatType, type EventRepeatType } from "@/lib/eventRecurrence";

type EventType = "church" | "gagyo" | "birthday" | "other";

interface UpdateEventBody {
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
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "일정을 찾을 수 없어요." }, { status: 404 });
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

  const body = (await request.json().catch(() => null)) as UpdateEventBody | null;
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
    repeat_type: repeatType,
    repeat_until:
      repeatType === "none" ? null : body?.repeatUntil?.trim() || null,
  };

  let { error } = await supabase.from("events").update(row).eq("id", id);

  // 반복 마이그레이션 전이어도 수정은 되도록 그 컬럼만 빼고 다시 시도한다.
  if (error && isMissingColumnError(error)) {
    const { repeat_type: _type, repeat_until: _until, ...rest } = row;
    void _type;
    void _until;
    ({ error } = await supabase.from("events").update(rest).eq("id", id));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
