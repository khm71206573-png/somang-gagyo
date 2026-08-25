import type { SupabaseClient } from "@supabase/supabase-js";
import { WEEKDAY_LABELS, avatarFallback, formatTimeAgo, unwrapRelation } from "./utils";

/** 42P01 = 테이블/뷰 없음, 42703 = 컬럼 없음. 마이그레이션 적용 전이면 이 코드로 온다. */
const UNDEFINED_TABLE = "42P01";
const UNDEFINED_COLUMN = "42703";

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
  /** 이 항목을 고른 사람들의 이름. 이름 비공개 투표면 빈 배열. */
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
  /** 투표자 이름을 감추는 투표인지 */
  hideVoters: boolean;
  isClosed: boolean;
  closesAtLabel: string | null;
  authorName: string;
  dateLabel: string;
  timeAgo: string;
  options: AnnouncementPollOptionItem[];
  voterCount: number;
  /** 로그인한 사용자가 고른 항목들 (투표 수정 화면의 초기값) */
  mySelectedOptionIds: string[];
  comments: AnnouncementCommentItem[];
}

interface AuthorRelation {
  name: string | null;
  avatar_url?: string | null;
}

interface VoteRow {
  option_id: string;
  member_id: string;
  voter?: AuthorRelation | AuthorRelation[] | null;
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

/**
 * 공지별 투표 참여 인원. 이름 비공개 투표는 남의 투표 행이 RLS에 가려서
 * 직접 셀 수 없기 때문에 집계 뷰를 쓴다. 뷰가 아직 없는(마이그레이션 전) DB에서는
 * 보이는 투표 행으로 직접 센다.
 */
async function fetchVoterCounts(supabase: SupabaseClient, announcementIds: string[]) {
  const counts = new Map<string, number>();
  if (announcementIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("announcement_voter_counts")
    .select("announcement_id, voter_count")
    .in("announcement_id", announcementIds);

  if (!error) {
    for (const row of data ?? []) {
      counts.set(row.announcement_id as string, (row.voter_count as number) ?? 0);
    }
    return counts;
  }

  const { data: votes } = await supabase
    .from("announcement_poll_votes")
    .select("announcement_id, member_id")
    .in("announcement_id", announcementIds);

  const voters = new Map<string, Set<string>>();
  for (const vote of votes ?? []) {
    const set = voters.get(vote.announcement_id) ?? new Set<string>();
    set.add(vote.member_id);
    voters.set(vote.announcement_id, set);
  }

  for (const [announcementId, set] of voters) {
    counts.set(announcementId, set.size);
  }

  return counts;
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

  const ids = rows.map((row) => row.id as string);

  // 내 표는 이름 비공개 투표에서도 항상 보인다.
  const [voterCounts, { data: myVotes }] = await Promise.all([
    fetchVoterCounts(supabase, ids),
    user
      ? supabase
          .from("announcement_poll_votes")
          .select("announcement_id")
          .eq("member_id", user.id)
          .in("announcement_id", ids)
      : Promise.resolve({ data: [] as { announcement_id: string }[] }),
  ]);

  const myVotedIds = new Set(
    (myVotes ?? []).map((vote) => vote.announcement_id as string),
  );
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
      voterCount: voterCounts.get(row.id as string) ?? 0,
      commentCount: commentCount?.count ?? 0,
      hasVoted: myVotedIds.has(row.id as string),
    };
  });
}

const DETAIL_COLUMNS =
  "id, kind, poll_type, title, content, is_pinned, allow_multiple, closes_at, created_at, author:profiles(name), announcement_poll_options(id, label, option_date, start_time, display_order)";

/** hide_voters 컬럼이 아직 없는 DB에서도 상세 화면이 열리도록 한 번 더 조회한다. */
async function fetchAnnouncementRow(supabase: SupabaseClient, announcementId: string) {
  const { data, error } = await supabase
    .from("announcements")
    .select(`${DETAIL_COLUMNS}, hide_voters`)
    .eq("id", announcementId)
    .maybeSingle();

  if (!error) return data;
  if (error.code !== UNDEFINED_COLUMN) throwFriendly(error, "공지사항을 불러오지 못했어요.");

  const { data: legacy, error: legacyError } = await supabase
    .from("announcements")
    .select(DETAIL_COLUMNS)
    .eq("id", announcementId)
    .maybeSingle();

  if (legacyError) throwFriendly(legacyError, "공지사항을 불러오지 못했어요.");
  return legacy ? { ...legacy, hide_voters: false } : null;
}

/** 항목별 득표 수. 집계 뷰가 없으면 보이는 투표 행으로 직접 센다. */
async function fetchOptionCounts(
  supabase: SupabaseClient,
  announcementId: string,
  voteRows: VoteRow[],
) {
  const counts = new Map<string, number>();

  const { data, error } = await supabase
    .from("announcement_poll_option_counts")
    .select("option_id, vote_count")
    .eq("announcement_id", announcementId);

  if (!error) {
    for (const row of data ?? []) {
      counts.set(row.option_id as string, (row.vote_count as number) ?? 0);
    }
    return counts;
  }

  for (const vote of voteRows) {
    counts.set(vote.option_id, (counts.get(vote.option_id) ?? 0) + 1);
  }

  return counts;
}

export async function fetchAnnouncementDetail(
  supabase: SupabaseClient,
  announcementId: string,
): Promise<AnnouncementDetail> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const row = await fetchAnnouncementRow(supabase, announcementId);
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

  const voteRows = (votes ?? []) as VoteRow[];
  const hideVoters = Boolean(row.hide_voters);

  const [optionCounts, voterCounts] = await Promise.all([
    fetchOptionCounts(supabase, announcementId, voteRows),
    fetchVoterCounts(supabase, [announcementId]),
  ]);

  const optionRows = ((row.announcement_poll_options ?? []) as {
    id: string;
    label: string | null;
    option_date: string | null;
    start_time: string | null;
    display_order: number;
  }[]).sort((a, b) => a.display_order - b.display_order);

  const mySelectedOptionIds = user
    ? voteRows.filter((vote) => vote.member_id === user.id).map((vote) => vote.option_id)
    : [];

  const options: AnnouncementPollOptionItem[] = optionRows.map((option) => {
    const optionVotes = voteRows.filter((vote) => vote.option_id === option.id);

    return {
      id: option.id,
      label: buildOptionLabel(option),
      optionDate: option.option_date,
      startTime: option.start_time,
      voteCount: optionCounts.get(option.id) ?? 0,
      isSelected: mySelectedOptionIds.includes(option.id),
      // 이름 비공개 투표는 관리자에게도 이름을 보여주지 않는다.
      voterNames: hideVoters
        ? []
        : optionVotes.map((vote) => {
            const voter = unwrapRelation(vote.voter ?? null);
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
    hideVoters,
    isClosed,
    closesAtLabel: formatClosesAtLabel(row.closes_at, isClosed),
    authorName: author?.name ?? "관리자",
    dateLabel: formatDateLabel(row.created_at),
    timeAgo: formatTimeAgo(row.created_at),
    options,
    voterCount: voterCounts.get(announcementId) ?? 0,
    mySelectedOptionIds,
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
