import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BibleProgressSummary,
  BookProgressCell,
  MissedPortionAlert as MissedPortionAlertData,
  ReadingTogether,
  TestamentProgress,
  TodayPortion,
  WeekDay,
  WeekDayStatus,
} from "@/lib/mock-data";
import {
  NEW_TESTAMENT_BOOKS,
  OLD_TESTAMENT_BOOKS,
  collectReadChapters,
  type BibleBook,
} from "@/lib/bibleBooks";
import {
  countReadingLogsForPlanDay,
  fetchActiveMemberPlan,
  fetchActivePlanMembers,
  fetchStreakDays,
} from "./reading-plan";
import {
  avatarFallback,
  isSameDate,
  toDateString,
  toMidnight,
  unwrapRelation,
} from "./utils";

export interface BibleProgressPageData {
  planLabel: string;
  /** 완독 체크를 기록할 member_plans 행 */
  memberPlanId: string;
  /** 오늘 날짜에 완독 기록이 있는지 */
  completedToday: boolean;
  /** 완독 체크 시 진행 일차를 옮기기 위한 값 */
  currentDay: number;
  totalDays: number;
  /** 통독을 일시중지한 상태인지 */
  isPaused: boolean;
  /** "8월 22일부터" 같은 일시중지 시작일 안내 (진행 중이면 null) */
  pausedSinceLabel: string | null;
  summary: BibleProgressSummary;
  missedAlert: MissedPortionAlertData | null;
  todayPortion: TodayPortion | null;
  weekTracker: WeekDay[];
  readingTogether: ReadingTogether | null;
  oldTestament: TestamentProgress;
  newTestament: TestamentProgress;
}

const WEEK_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

async function computeWeekTracker(
  supabase: SupabaseClient,
  memberPlanId: string,
  planId: string,
  startedAt: Date,
  totalDays: number,
): Promise<WeekDay[]> {
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const dayNumberFor = (d: Date) =>
    Math.floor(
      (toMidnight(d).getTime() - toMidnight(startedAt).getTime()) / 86400000,
    ) + 1;

  const relevantDayNumbers = weekDates
    .map(dayNumberFor)
    .filter((n) => n >= 1 && n <= totalDays);

  const { data: planDays } = relevantDayNumbers.length
    ? await supabase
        .from("plan_days")
        .select("id, day_number")
        .eq("plan_id", planId)
        .in("day_number", relevantDayNumbers)
    : { data: [] };

  const planDayIdByNumber = new Map(
    (planDays ?? []).map((p) => [p.day_number, p.id as string]),
  );
  const planDayIds = Array.from(planDayIdByNumber.values());

  const { data: logs } = planDayIds.length
    ? await supabase
        .from("reading_logs")
        .select("plan_day_id")
        .eq("member_plan_id", memberPlanId)
        .in("plan_day_id", planDayIds)
    : { data: [] };

  const completedPlanDayIds = new Set((logs ?? []).map((l) => l.plan_day_id));

  return weekDates.map((d, i) => {
    const dayNumber = dayNumberFor(d);
    let status: WeekDayStatus;

    if (isSameDate(d, today)) {
      status = "today";
    } else if (d > today) {
      status = "future";
    } else if (dayNumber < 1 || dayNumber > totalDays) {
      status = "future";
    } else {
      const planDayId = planDayIdByNumber.get(dayNumber);
      status = planDayId && completedPlanDayIds.has(planDayId) ? "completed" : "missed";
    }

    return { label: WEEK_LABELS[i], status };
  });
}

/** 읽은 장 정보를 책별 진행 셀로 변환한다. */
function toBookCells(
  books: BibleBook[],
  readChapters: Map<string, Set<number>>,
): BookProgressCell[] {
  return books.map((book) => {
    const readCount = Math.min(
      readChapters.get(book.name)?.size ?? 0,
      book.chapters,
    );

    if (readCount === 0) {
      return { name: book.name, status: "unread" as const };
    }
    if (readCount >= book.chapters) {
      return { name: book.name, status: "completed" as const };
    }
    return {
      name: book.name,
      status: "reading" as const,
      readingPercent: Math.round((readCount / book.chapters) * 100),
    };
  });
}

/** 완독 기록에 담긴 분량을 파싱해 구약/신약 진행표를 만든다. */
async function computeOverallProgress(
  supabase: SupabaseClient,
  memberPlanId: string,
): Promise<{ oldTestament: TestamentProgress; newTestament: TestamentProgress }> {
  const { data: logs } = await supabase
    .from("reading_logs")
    .select("plan_days(passage)")
    .eq("member_plan_id", memberPlanId);

  const passages = (logs ?? [])
    .map((log) => unwrapRelation<{ passage: string }>(log.plan_days)?.passage)
    .filter((passage): passage is string => Boolean(passage));

  const readChapters = collectReadChapters(passages);

  return {
    oldTestament: {
      label: "구약 (Old Testament)",
      books: toBookCells(OLD_TESTAMENT_BOOKS, readChapters),
    },
    newTestament: {
      label: "신약 (New Testament)",
      books: toBookCells(NEW_TESTAMENT_BOOKS, readChapters),
    },
  };
}

/**
 * 오늘 이 플랜에 올라온 응원 수와, 내가 이미 응원했는지 확인한다.
 * reading_cheers 마이그레이션 적용 전이면 조회가 실패하는데, 통독 화면 전체가
 * 막히지 않도록 "응원 없음"으로 보고 넘어간다.
 */
async function fetchCheerStatus(
  supabase: SupabaseClient,
  planId: string,
  userId: string,
): Promise<{ cheerCount: number; hasCheeredToday: boolean }> {
  const todayStr = toDateString(new Date());

  const { data, error } = await supabase
    .from("reading_cheers")
    .select("from_member_id")
    .eq("plan_id", planId)
    .eq("cheer_date", todayStr);

  if (error) {
    return { cheerCount: 0, hasCheeredToday: false };
  }

  const rows = data ?? [];

  return {
    cheerCount: rows.length,
    hasCheeredToday: rows.some((row) => row.from_member_id === userId),
  };
}

async function buildReadingTogether(
  supabase: SupabaseClient,
  planDayId: string | null,
  activePlanMembers: { id: string; member_id: string }[],
  planId: string,
  userId: string,
): Promise<ReadingTogether | null> {
  if (activePlanMembers.length === 0) return null;

  const memberIds = activePlanMembers.map((m) => m.member_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", memberIds);

  const shown = (profiles ?? []).slice(0, 5);
  const avatarUrls = shown.map((p) => p.avatar_url ?? avatarFallback(p.name));

  const [completedToday, cheerStatus] = await Promise.all([
    planDayId
      ? countReadingLogsForPlanDay(
          supabase,
          planDayId,
          activePlanMembers.map((m) => m.id),
        )
      : Promise.resolve(0),
    fetchCheerStatus(supabase, planId, userId),
  ]);

  return {
    avatarUrls,
    extraCount: Math.max((profiles ?? []).length - shown.length, 0),
    message: `오늘 ${completedToday}명이 완독했어요`,
    ctaLabel: "응원 보내기",
    cheerCount: cheerStatus.cheerCount,
    hasCheeredToday: cheerStatus.hasCheeredToday,
  };
}

/** 오늘 날짜로 남긴 완독 기록이 있는지 확인한다. */
async function hasReadingLogToday(
  supabase: SupabaseClient,
  memberPlanId: string,
): Promise<boolean> {
  const start = toMidnight(new Date());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { count } = await supabase
    .from("reading_logs")
    .select("id", { count: "exact", head: true })
    .eq("member_plan_id", memberPlanId)
    .gte("completed_at", start.toISOString())
    .lt("completed_at", end.toISOString());

  return (count ?? 0) > 0;
}

export async function fetchBibleProgressData(
  supabase: SupabaseClient,
): Promise<BibleProgressPageData | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const memberPlan = await fetchActiveMemberPlan(supabase, user.id);
  if (!memberPlan) return null;

  const plan = unwrapRelation(memberPlan.bible_plans);
  const totalDays = plan?.total_days ?? 0;
  const startedAt = new Date(`${memberPlan.started_at}T00:00:00`);
  const today = new Date();

  const streakDays = await fetchStreakDays(supabase, memberPlan.id);

  const percent =
    totalDays > 0 ? Math.round((memberPlan.current_day / totalDays) * 100) : 0;

  const remainingDays = Math.max(totalDays - memberPlan.current_day, 0);
  const estimatedDate = new Date(today);
  estimatedDate.setDate(estimatedDate.getDate() + remainingDays);

  const summary: BibleProgressSummary = {
    percent,
    dayLabel: `${memberPlan.current_day}일차 / ${totalDays}일`,
    streakLabel: `연속 ${streakDays}일`,
    estimatedCompletionLabel: `예상 완독 ${estimatedDate.getFullYear()}년 ${estimatedDate.getMonth() + 1}월`,
  };

  // 일시중지 중에는 오늘이 아니라 중지한 날을 기준으로 세서 밀린 분량이 늘지 않는다.
  const pausedAt = memberPlan.paused_at
    ? new Date(`${memberPlan.paused_at}T00:00:00`)
    : null;
  const isPaused = pausedAt !== null;
  const referenceDate = pausedAt ?? today;

  const daysSinceStart =
    Math.floor(
      (toMidnight(referenceDate).getTime() - toMidnight(startedAt).getTime()) /
        86400000,
    ) + 1;
  const expectedDay = Math.min(Math.max(daysSinceStart, 1), Math.max(totalDays, 1));
  const missedCount = Math.max(expectedDay - memberPlan.current_day, 0);

  const missedAlert: MissedPortionAlertData | null =
    missedCount > 0 && !isPaused
      ? {
          message: `${missedCount}일치가 밀려 있어요`,
          catchUpLabel: "몰아 읽기",
          restartLabel: "오늘부터 다시",
        }
      : null;

  const { data: planDay } = await supabase
    .from("plan_days")
    .select("id, passage, duration_label")
    .eq("plan_id", memberPlan.plan_id)
    .eq("day_number", memberPlan.current_day)
    .maybeSingle();

  // 현재 분량을 이미 읽음으로 표시했는지 (중복 체크 방지 + 버튼 상태 표시)
  const { data: existingLog } = planDay
    ? await supabase
        .from("reading_logs")
        .select("id")
        .eq("member_plan_id", memberPlan.id)
        .eq("plan_day_id", planDay.id)
        .maybeSingle()
    : { data: null };

  const todayPortion: TodayPortion | null = planDay && !isPaused
    ? {
        tag: "오늘의 분량",
        passage: planDay.passage,
        durationLabel: planDay.duration_label ?? "",
        actionLabel: "읽었어요",
        planDayId: planDay.id,
        isCompleted: Boolean(existingLog),
      }
    : null;

  const activePlanMembers = await fetchActivePlanMembers(supabase, memberPlan.plan_id);

  const [weekTracker, readingTogether, completedToday, overallProgress] =
    await Promise.all([
      computeWeekTracker(supabase, memberPlan.id, memberPlan.plan_id, startedAt, totalDays),
      buildReadingTogether(
      supabase,
      planDay?.id ?? null,
      activePlanMembers,
      memberPlan.plan_id,
      user.id,
    ),
      hasReadingLogToday(supabase, memberPlan.id),
      computeOverallProgress(supabase, memberPlan.id),
    ]);

  return {
    planLabel: plan?.title ?? "",
    memberPlanId: memberPlan.id,
    isPaused,
    pausedSinceLabel: pausedAt
      ? `${pausedAt.getMonth() + 1}월 ${pausedAt.getDate()}일부터`
      : null,
    completedToday,
    currentDay: memberPlan.current_day,
    totalDays,
    summary,
    missedAlert,
    todayPortion,
    weekTracker,
    readingTogether,
    oldTestament: overallProgress.oldTestament,
    newTestament: overallProgress.newTestament,
  };
}
