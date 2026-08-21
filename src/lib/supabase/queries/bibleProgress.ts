import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BibleProgressSummary,
  MissedPortionAlert as MissedPortionAlertData,
  ReadingTogether,
  TodayPortion,
  WeekDay,
  WeekDayStatus,
} from "@/lib/mock-data";
import {
  countReadingLogsForPlanDay,
  fetchActiveMemberPlan,
  fetchActivePlanMembers,
  fetchStreakDays,
} from "./reading-plan";
import { avatarFallback, isSameDate, toMidnight, unwrapRelation } from "./utils";

export interface BibleProgressPageData {
  planLabel: string;
  /** 완독 체크를 기록할 member_plans 행 */
  memberPlanId: string;
  /** 오늘 날짜에 완독 기록이 있는지 */
  completedToday: boolean;
  /** 완독 체크 시 진행 일차를 옮기기 위한 값 */
  currentDay: number;
  totalDays: number;
  summary: BibleProgressSummary;
  missedAlert: MissedPortionAlertData | null;
  todayPortion: TodayPortion | null;
  weekTracker: WeekDay[];
  readingTogether: ReadingTogether | null;
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

async function buildReadingTogether(
  supabase: SupabaseClient,
  planDayId: string | null,
  activePlanMembers: { id: string; member_id: string }[],
): Promise<ReadingTogether | null> {
  if (activePlanMembers.length === 0) return null;

  const memberIds = activePlanMembers.map((m) => m.member_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", memberIds);

  const shown = (profiles ?? []).slice(0, 5);
  const avatarUrls = shown.map((p) => p.avatar_url ?? avatarFallback(p.name));

  const completedToday = planDayId
    ? await countReadingLogsForPlanDay(
        supabase,
        planDayId,
        activePlanMembers.map((m) => m.id),
      )
    : 0;

  return {
    avatarUrls,
    extraCount: Math.max((profiles ?? []).length - shown.length, 0),
    message: `오늘 ${completedToday}명이 완독했어요`,
    ctaLabel: "응원 보내기",
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

  const daysSinceStart =
    Math.floor(
      (toMidnight(today).getTime() - toMidnight(startedAt).getTime()) / 86400000,
    ) + 1;
  const expectedDay = Math.min(Math.max(daysSinceStart, 1), Math.max(totalDays, 1));
  const missedCount = Math.max(expectedDay - memberPlan.current_day, 0);

  const missedAlert: MissedPortionAlertData | null =
    missedCount > 0
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

  const todayPortion: TodayPortion | null = planDay
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

  const [weekTracker, readingTogether, completedToday] = await Promise.all([
    computeWeekTracker(supabase, memberPlan.id, memberPlan.plan_id, startedAt, totalDays),
    buildReadingTogether(supabase, planDay?.id ?? null, activePlanMembers),
    hasReadingLogToday(supabase, memberPlan.id),
  ]);

  return {
    planLabel: plan?.title ?? "",
    memberPlanId: memberPlan.id,
    completedToday,
    currentDay: memberPlan.current_day,
    totalDays,
    summary,
    missedAlert,
    todayPortion,
    weekTracker,
    readingTogether,
  };
}
