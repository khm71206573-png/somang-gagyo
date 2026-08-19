import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type EventType = "church" | "birthday" | "other";

interface CreateEventBody {
  eventDate?: string;
  title?: string;
  type?: EventType;
  startTime?: string;
  location?: string;
  description?: string;
}

const VALID_TYPES: EventType[] = ["church", "birthday", "other"];

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

  const { error } = await supabase.from("events").insert({
    title,
    description: body?.description?.trim() || null,
    event_date: eventDate,
    start_time: body?.startTime?.trim() || null,
    location: body?.location?.trim() || null,
    type,
    created_by: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
