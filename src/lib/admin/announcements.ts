import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isMissingColumnError } from "@/lib/supabase/errors";

export type AnnouncementKind = "post" | "poll";
export type AnnouncementPollType = "schedule" | "choice";

export interface AnnouncementOptionBody {
  /** 기존 항목을 수정할 때만 담겨온다. 없으면 새로 추가하는 항목. */
  id?: string;
  label?: string;
  optionDate?: string;
  startTime?: string;
}

export interface AnnouncementBody {
  kind?: AnnouncementKind;
  pollType?: AnnouncementPollType;
  title?: string;
  content?: string;
  isPinned?: boolean;
  allowMultiple?: boolean;
  /** 투표자 이름을 감출지 */
  hideVoters?: boolean;
  /** ISO 문자열. 마감 없음이면 null */
  closesAt?: string | null;
  options?: AnnouncementOptionBody[];
}

export interface NormalizedAnnouncement {
  kind: AnnouncementKind;
  pollType: AnnouncementPollType | null;
  title: string;
  content: string | null;
  isPinned: boolean;
  allowMultiple: boolean;
  hideVoters: boolean;
  closesAt: string | null;
  options: NormalizedOption[];
}

export interface NormalizedOption {
  id?: string;
  label: string;
  optionDate: string | null;
  startTime: string | null;
}

export async function requireAdmin(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User | null;
  errorResponse: NextResponse | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      user: null,
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
      user,
      errorResponse: NextResponse.json(
        { error: "관리자만 사용할 수 있어요." },
        { status: 403 },
      ),
    };
  }

  return { supabase, user, errorResponse: null };
}

export function normalizeAnnouncementBody(
  body: AnnouncementBody | null,
): NormalizedAnnouncement | { error: string } {
  const title = body?.title?.trim();
  if (!title) {
    return { error: "제목을 입력해주세요." };
  }

  const kind: AnnouncementKind = body?.kind === "poll" ? "poll" : "post";
  const content = body?.content?.trim() || null;

  if (kind === "post") {
    if (!content) {
      return { error: "공지 내용을 입력해주세요." };
    }

    return {
      kind,
      pollType: null,
      title,
      content,
      isPinned: Boolean(body?.isPinned),
      allowMultiple: false,
      hideVoters: false,
      closesAt: null,
      options: [],
    };
  }

  const pollType: AnnouncementPollType =
    body?.pollType === "schedule" ? "schedule" : "choice";

  const options: NormalizedOption[] = [];
  for (const option of body?.options ?? []) {
    const label = option.label?.trim() ?? "";
    const optionDate = option.optionDate?.trim() || null;
    const startTime = option.startTime?.trim() || null;

    if (pollType === "schedule") {
      // 일정투표는 날짜가 항목의 본체다. 메모(label)는 없어도 된다.
      if (!optionDate) continue;
      options.push({ id: option.id, label, optionDate, startTime });
      continue;
    }

    if (!label) continue;
    options.push({ id: option.id, label, optionDate: null, startTime: null });
  }

  if (options.length < 2) {
    return {
      error:
        pollType === "schedule"
          ? "일정 후보를 두 개 이상 넣어주세요."
          : "투표 문항을 두 개 이상 넣어주세요.",
    };
  }

  const closesAt = body?.closesAt?.trim() ? body.closesAt : null;
  if (closesAt && Number.isNaN(new Date(closesAt).getTime())) {
    return { error: "마감 시각을 다시 확인해주세요." };
  }

  return {
    kind,
    pollType,
    title,
    content,
    isPinned: Boolean(body?.isPinned),
    allowMultiple: Boolean(body?.allowMultiple),
    hideVoters: Boolean(body?.hideVoters),
    closesAt,
    options,
  };
}

export function buildOptionRows(
  announcementId: string,
  options: NormalizedOption[],
) {
  return options.map((option, index) => ({
    announcement_id: announcementId,
    label: option.label,
    option_date: option.optionDate,
    start_time: option.startTime,
    display_order: index,
  }));
}

/** 공지 본문 컬럼 묶음. hide_voters가 없는 DB에서는 그 키만 빼고 다시 쓴다. */
export function buildAnnouncementRow(normalized: NormalizedAnnouncement) {
  return {
    kind: normalized.kind,
    poll_type: normalized.pollType,
    title: normalized.title,
    content: normalized.content,
    is_pinned: normalized.isPinned,
    allow_multiple: normalized.allowMultiple,
    hide_voters: normalized.hideVoters,
    closes_at: normalized.closesAt,
  };
}

export function withoutHideVoters(row: ReturnType<typeof buildAnnouncementRow>) {
  return {
    kind: row.kind,
    poll_type: row.poll_type,
    title: row.title,
    content: row.content,
    is_pinned: row.is_pinned,
    allow_multiple: row.allow_multiple,
    closes_at: row.closes_at,
  };
}

export { isMissingColumnError };
