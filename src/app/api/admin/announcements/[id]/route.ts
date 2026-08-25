import { NextResponse } from "next/server";
import {
  buildAnnouncementRow,
  isMissingColumnError,
  normalizeAnnouncementBody,
  requireAdmin,
  withoutHideVoters,
  type AnnouncementBody,
} from "@/lib/admin/announcements";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("announcements")
    .select(
      "id, kind, poll_type, title, content, is_pinned, allow_multiple, hide_voters, closes_at, created_at, announcement_poll_options(id, label, option_date, start_time, display_order)",
    )
    .eq("id", id)
    .maybeSingle();

  // hide_voters 컬럼이 아직 없는 DB에서도 수정 화면이 열리도록 한 번 더 조회한다.
  if (error && isMissingColumnError(error)) {
    const legacy = await supabase
      .from("announcements")
      .select(
        "id, kind, poll_type, title, content, is_pinned, allow_multiple, closes_at, created_at, announcement_poll_options(id, label, option_date, start_time, display_order)",
      )
      .eq("id", id)
      .maybeSingle();

    if (legacy.error) {
      return NextResponse.json({ error: legacy.error.message }, { status: 500 });
    }

    return legacy.data
      ? NextResponse.json({ ...legacy.data, hide_voters: false })
      : NextResponse.json({ error: "공지사항을 찾을 수 없어요." }, { status: 404 });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "공지사항을 찾을 수 없어요." }, { status: 404 });
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

  const body = (await request.json().catch(() => null)) as AnnouncementBody | null;
  const normalized = normalizeAnnouncementBody(body);

  if ("error" in normalized) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  const row = buildAnnouncementRow(normalized);

  let { error } = await supabase.from("announcements").update(row).eq("id", id);

  // hide_voters 마이그레이션 전이어도 수정은 되도록 그 컬럼만 빼고 다시 시도한다.
  if (error && isMissingColumnError(error)) {
    ({ error } = await supabase
      .from("announcements")
      .update(withoutHideVoters(row))
      .eq("id", id));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 항목을 통째로 지웠다 다시 넣으면 이미 받은 투표까지 사라진다.
  // 그대로 남은 항목은 수정만 하고, 빠진 항목만 지우고, 새 항목만 추가한다.
  const { data: existing } = await supabase
    .from("announcement_poll_options")
    .select("id")
    .eq("announcement_id", id);

  const existingIds = new Set((existing ?? []).map((option) => option.id as string));
  const keptIds = new Set(
    normalized.options
      .map((option) => option.id)
      .filter((optionId): optionId is string => Boolean(optionId) && existingIds.has(optionId!)),
  );

  const removedIds = [...existingIds].filter((optionId) => !keptIds.has(optionId));
  if (removedIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("announcement_poll_options")
      .delete()
      .in("id", removedIds);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
  }

  for (const [index, option] of normalized.options.entries()) {
    const row = {
      label: option.label,
      option_date: option.optionDate,
      start_time: option.startTime,
      display_order: index,
    };

    const optionError = option.id && keptIds.has(option.id)
      ? (
          await supabase
            .from("announcement_poll_options")
            .update(row)
            .eq("id", option.id)
        ).error
      : (
          await supabase
            .from("announcement_poll_options")
            .insert({ ...row, announcement_id: id })
        ).error;

    if (optionError) {
      return NextResponse.json({ error: optionError.message }, { status: 500 });
    }
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

  const { error } = await supabase.from("announcements").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
