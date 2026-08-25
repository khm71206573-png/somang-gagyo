import type { SupabaseClient } from "@supabase/supabase-js";
import { WEEKDAY_LABELS, avatarFallback, formatTimeAgo, unwrapRelation } from "./utils";

/** 42P01 = 테이블 없음. 공지사항 마이그레이션 적용 전이면 이 코드로 온다. */
const UNDEFINED_TABLE = "42P01";

const SETUP_MESSAGE =
  "공지사항 기능 설정이 아직 끝나지 않았어요. 관리자에게 알려주세요.";

export type AnnouncementKind = "post" | "poll";
/** schedule = 일정투표, choice = 문항투표 */
export type AnnouncementPollType = "schedule" | "choice";

export interface AnnouncementPollOptionItem {
  id: string;
  /** 화면에 그대로 보여줄 문구 (일정투표는 날짜·시각을 조합한 값) */
  label: string;
  optionDate: string | null;
  startTime: string | null;
  voteCount: number;
  /** 로그인한 사용자가 고른 항목인지 */
  isSelected: boolean;
  /** 이 항목을 고른 사람들의 이름 (일정 조율에 필요해서 공개한다) */
  voterNames: string[];
}

export interface AnnouncementCommentItem {
  id: string;
  author: string;
  avatarUrl: string;
  content: string;
  timeAgo: string;
  /** 로그인한 사용자가 쓴 댓글인지 (삭제 버튼 노출용) */
  isMine: boolean;
}

export interface AnnouncementListItem {
  id: string;
  kind: AnnouncementKind;
  pollType: AnnouncementPollType | null;
  title: string;
  /** 목록에서 두 줄 정도로 보여줄 본문 미리보기 */
  preview: string;
  isPinned: boolean;
  isClosed: boolean;
  closesAtLabel: string | null;
  authorName: string;
  dateLabel: string;
  timeAgo: string;
  optionCount: number;
  /** 투표에 참여한 사람 수 (복수 선택이어도 1명으로 센다) */
  voterCount: number;
  commentCount: number;
  /** 로그인한 사용자가 이미 투표했는지 */
  hasVoted: boolean;
}

export interface AnnouncementDetail {
  id: string;
  kind: AnnouncementKind;
  pollType: AnnouncementPollType | null;
  title: string;
  content: string;
  isPinned: boolean;
  allowMultiple: boolean;
  isClosed: boolean;
  closesAtLabel: string | null;
  authorName: string;
  dateLabel: string;
  timeAgo: string;
  options: AnnouncementPollOptionItem[];
  voterCount: number;
  comments: AnnouncementCommentItem[];
}

interface AuthorRelation {
  name: string | null;
  avatar_url?: string | null;
}

function formatDateLabel(isoString: string) {
  const date = new Date(isoString);
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

/** "14:00:00" → "오후 2:00" */
export function formatClockLabel(time: string) {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const meridiem = hour < 12 ? "오전" : "오후";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${meridiem} ${displayHour}:${minuteText ?? "00"}`;
}

/** "2026-08-30" → "8월 30일 (토)" */
export function formatOptionDateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const weekday = WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

/** 일정투표 항목은 날짜·시각·메모를 한 줄로 합쳐서 보여준다. */
function buildOptionLabel(row: {
  label: string | null;
  option_date: string | null;
  start_time: string | null;
}) {
  if (!row.option_date) return row.label ?? "";

  const parts = [formatOptionDateLabel(row.option_date)];
  if (row.start_time) parts.push(formatClockLabel(row.start_time));
  if (row.label) parts.push(row.label);
  return parts.join(" · ");
}

function formatClosesAtLabel(closesAt: string | null, isClosed: boolean) {
  if (!closesAt) return null;

  const date = new Date(closesAt);
  const label = `${date.getMonth() + 1}월 ${date.getDate()}일 ${formatClockLabel(
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  )}`;

  return isClosed ? `${label} 마감됨` : `${label} 마감`;
}

function toPreview(content: string | null) {
  return (content ?? "").replace(/\s+/g, " ").trim();
}

function throwFriendly(error: { code?: string; message?: string }, fallback: string): never {
  if (error.code === UNDEFINED_TABLE) throw new Error(SETUP_MESSAGE);
  throw new Error(error.message || fallback);
}

export async function fetchAnnouncementList(
  supabase: SupabaseClient,
): Promise<AnnouncementListItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("announcements")
    .select(
      "id, kind, poll_type, title, content, is_pinned, closes_at, created_at, author:profiles(name), announcement_poll_options(id), announcement_comments(count)",
    )
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throwFriendly(error, "공지사항을 불러오지 못했어요.");

  const rows = data ?? [];
  if (rows.length === 0) return [];

  // 투표 참여 인원(사람 수)과 내 참여 여부는 votes를 한 번에 받아 계산한다.
  const { data: votes } = await supabase
    .from("announcement_poll_votes")
    .select("announcement_id, member_id")
    .in(
      "announcement_id",
      rows.map((row) => row.id),
    );

  const votersByAnnouncement = new Map<string, Set<string>>();
  const myVotedIds = new Set<string>();

  for (const vote of votes ?? []) {
    const voters =
      votersByAnnouncement.get(vote.announcement_id) ?? new Set<string>();
    voters.add(vote.member_id);
    votersByAnnouncement.set(vote.announcement_id, voters);

    if (user && vote.member_id === user.id) {
      myVotedIds.add(vote.announcement_id);
    }
  }

  const now = Date.now();

  return rows.map((row) => {
    const author = unwrapRelation(
      row.author as AuthorRelation | AuthorRelation[] | null,
    );
    const commentCount = unwrapRelation(
      row.announcement_comments as { count: number } | { count: number }[] | null,
    );
    const options = (row.announcement_poll_options ?? []) as { id: string }[];
    const isClosed = Boolean(row.closes_at) && new Date(row.closes_at).getTime() <= now;

    return {
      id: row.id,
      kind: row.kind as AnnouncementKind,
      pollType: (row.poll_type as AnnouncementPollType | null) ?? null,
      title: row.title,
      preview: toPreview(row.content),
      isPinned: Boolean(row.is_pinned),
      isClosed,
      closesAtLabel: formatClosesAtLabel(row.closes_at, isClosed),
      authorName: author?.name ?? "관리자",
      dateLabel: formatDateLabel(row.created_at),
      timeAgo: formatTimeAgo(row.created_at),
      optionCount: options.length,
      voterCount: votersByAnnouncement.get(row.id)?.size ?? 0,
      commentCount: commentCount?.count ?? 0,
      hasVoted: myVotedIds.has(row.id),
    };
  });
}

export async function fetchAnnouncementDetail(
  supabase: SupabaseClient,
  announcementId: string,
): Promise<AnnouncementDetail> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: row, error } = await supabase
    .from("announcements")
    .select(
      "id, kind, poll_type, title, content, is_pinned, allow_multiple, closes_at, created_at, author:profiles(name), announcement_poll_options(id, label, option_date, start_time, display_order)",
    )
    .eq("id", announcementId)
    .maybeSingle();

  if (error) throwFriendly(error, "공지사항을 불러오지 못했어요.");
  if (!row) throw new Error("공지사항을 찾을 수 없어요.");

  const [{ data: votes }, { data: comments }] = await Promise.all([
    supabase
      .from("announcement_poll_votes")
      .select("option_id, member_id, voter:profiles(name)")
      .eq("announcement_id", announcementId),
    supabase
      .from("announcement_comments")
      .select("id, member_id, content, created_at, author:profiles(name, avatar_url)")
      .eq("announcement_id", announcementId)
      .order("created_at", { ascending: true }),
  ]);

  const voteRows = votes ?? [];
  const voterIds = new Set(voteRows.map((vote) => vote.member_id as string));

  const optionRows = ((row.announcement_poll_options ?? []) as {
    id: string;
    label: string | null;
    option_date: string | null;
    start_time: string | null;
    display_order: number;
  }[]).sort((a, b) => a.display_order - b.display_order);

  const options: AnnouncementPollOptionItem[] = optionRows.map((option) => {
    const optionVotes = voteRows.filter((vote) => vote.option_id === option.id);

    return {
      id: option.id,
      label: buildOptionLabel(option),
      optionDate: option.option_date,
      startTime: option.start_time,
      voteCount: optionVotes.length,
      isSelected: Boolean(user) && optionVotes.some((vote) => vote.member_id === user?.id),
      voterNames: optionVotes.map((vote) => {
        const voter = unwrapRelation(
          vote.voter as AuthorRelation | AuthorRelation[] | null,
        );
        return voter?.name ?? "성도";
      }),
    };
  });

  const author = unwrapRelation(
    row.author as AuthorRelation | AuthorRelation[] | null,
  );
  const isClosed =
    Boolean(row.closes_at) && new Date(row.closes_at).getTime() <= Date.now();

  return {
    id: row.id,
    kind: row.kind as AnnouncementKind,
    pollType: (row.poll_type as AnnouncementPollType | null) ?? null,
    title: row.title,
    content: row.content ?? "",
    isPinned: Boolean(row.is_pinned),
    allowMultiple: Boolean(row.allow_multiple),
    isClosed,
    closesAtLabel: formatClosesAtLabel(row.closes_at, isClosed),
    authorName: author?.name ?? "관리자",
    dateLabel: formatDateLabel(row.created_at),
    timeAgo: formatTimeAgo(row.created_at),
    options,
    voterCount: voterIds.size,
    comments: (comments ?? []).map((comment) => {
      const commentAuthor = unwrapRelation(
        comment.author as AuthorRelation | AuthorRelation[] | null,
      );
      const name = commentAuthor?.name ?? "성도";

      return {
        id: comment.id,
        author: name,
        avatarUrl: commentAuthor?.avatar_url ?? avatarFallback(name),
        content: comment.content,
        timeAgo: formatTimeAgo(comment.created_at),
        isMine: Boolean(user) && comment.member_id === user?.id,
      };
    }),
  };
}

export { SETUP_MESSAGE as ANNOUNCEMENT_SETUP_MESSAGE, UNDEFINED_TABLE };
