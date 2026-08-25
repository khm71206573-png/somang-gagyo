import { NextResponse } from "next/server";
import { sendAnnouncementNotification } from "@/lib/push/sendAnnouncementNotification";
import {
  buildOptionRows,
  normalizeAnnouncementBody,
  requireAdmin,
  type AnnouncementBody,
} from "@/lib/admin/announcements";

export async function GET() {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("announcements")
    .select(
      "id, kind, poll_type, title, content, is_pinned, allow_multiple, closes_at, created_at, announcement_poll_options(id)",
    )
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, user, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = (await request.json().catch(() => null)) as AnnouncementBody | null;
  const normalized = normalizeAnnouncementBody(body);

  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const { data: created, error } = await supabase
    .from("announcements")
    .insert({
      kind: normalized.kind,
      poll_type: normalized.pollType,
      title: normalized.title,
      content: normalized.content,
      is_pinned: normalized.isPinned,
      allow_multiple: normalized.allowMultiple,
      closes_at: normalized.closesAt,
      created_by: user!.id,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (normalized.options.length > 0) {
    const { error: optionError } = await supabase
      .from("announcement_poll_options")
      .insert(buildOptionRows(created.id, normalized.options));

    if (optionError) {
      // 항목 없는 반쪽짜리 투표가 남지 않도록 되돌린다.
      await supabase.from("announcements").delete().eq("id", created.id);
      return NextResponse.json({ error: optionError.message }, { status: 500 });
    }
  }

  // 공지가 올라오면 교인들 휴대폰으로 알림을 보낸다.
  // 푸시 설정(VAPID 키 등)이 없어도 공지 등록 자체는 성공해야 하므로 실패는 삼킨다.
  let notified = 0;
  try {
    const result = await sendAnnouncementNotification({
      announcementId: created.id,
      title: normalized.title,
      isPoll: normalized.kind === "poll",
      authorId: user!.id,
    });
    notified = result.sent;
  } catch (error) {
    console.error("[announcements] 푸시 알림 발송 실패:", error);
  }

  return NextResponse.json({ id: created.id, notified });
}
