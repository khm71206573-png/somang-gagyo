import type { SupabaseClient } from "@supabase/supabase-js";
import { toMidnight, unwrapRelation } from "./utils";

export interface ExpectedDayInfo {
  planId: string;
  currentDay: number;
  /** 시작일 기준으로 오늘이 며칠차인지 (1~totalDays로 clamp) */
  expectedDay: number;
  totalDays: number;
}

/**
 * 시작일과 오늘 날짜로 "오늘 몇 일차여야 하는지"를 계산한다.
 * 밀린 분량 몰아 읽기·오늘부터 다시 시작 기능에서 공용으로 쓴다.
 */
export async function fetchExpectedDayInfo(
  supabase: SupabaseClient,
  memberPlanId: string,
): Promise<ExpectedDayInfo | null> {
  const { data: memberPlan } = await supabase
    .from("member_plans")
    .select("plan_id, current_day, started_at, bible_plans(total_days)")
    .eq("id", memberPlanId)
    .maybeSingle();

  if (!memberPlan) return null;

  const plan = unwrapRelation(memberPlan.bible_plans);
  const totalDays = plan?.total_days ?? 0;
  const startedAt = new Date(`${memberPlan.started_at}T00:00:00`);
  const today = new Date();

  const daysSinceStart =
    Math.floor(
      (toMidnight(today).getTime() - toMidnight(startedAt).getTime()) / 86400000,
    ) + 1;
  const expectedDay = Math.min(Math.max(daysSinceStart, 1), Math.max(totalDays, 1));

  return {
    planId: memberPlan.plan_id,
    currentDay: memberPlan.current_day,
    expectedDay,
    totalDays,
  };
}

const MEMBER_PLAN_COLUMNS =
  "id, plan_id, current_day, started_at, bible_plans(title, total_days)";

/** 42703 = 컬럼 없음. paused_at 마이그레이션 적용 전이면 이 코드로 온다. */
const UNDEFINED_COLUMN = "42703";

/**
 * 진행 중인 통독 플랜을 모두 가져온다. 시작한 순서대로 돌려주므로
 * 통독탭의 플랜 탭 순서도 이 순서를 따른다.
 */
export async function fetchActiveMemberPlans(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("member_plans")
    .select(`${MEMBER_PLAN_COLUMNS}, paused_at`)
    .eq("member_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (!error) return data ?? [];

  // 일시중지 마이그레이션 적용 전에도 통독 화면 전체가 멈추지 않도록,
  // paused_at 없이 다시 조회해 "중지 안 함" 상태로 다룬다.
  if (error.code !== UNDEFINED_COLUMN) return [];

  const { data: legacy } = await supabase
    .from("member_plans")
    .select(MEMBER_PLAN_COLUMNS)
    .eq("member_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return (legacy ?? []).map((row) => ({
    ...row,
    paused_at: null as string | null,
  }));
}

/** 홈 화면처럼 하나만 필요한 곳에서 쓰는, 가장 먼저 시작한 플랜 */
export async function fetchActiveMemberPlan(
  supabase: SupabaseClient,
  userId: string,
) {
  const plans = await fetchActiveMemberPlans(supabase, userId);
  return plans[0] ?? null;
}

export async function fetchActivePlanMembers(
  supabase: SupabaseClient,
  planId: string,
) {
  const { data } = await supabase
    .from("member_plans")
    .select("id, member_id")
    .eq("plan_id", planId)
    .eq("is_active", true);

  return data ?? [];
}

export async function countReadingLogsForPlanDay(
  supabase: SupabaseClient,
  planDayId: string,
  memberPlanIds: string[],
) {
  if (memberPlanIds.length === 0) return 0;

  const { count } = await supabase
    .from("reading_logs")
    .select("id", { count: "exact", head: true })
    .eq("plan_day_id", planDayId)
    .in("member_plan_id", memberPlanIds);

  return count ?? 0;
}

export async function fetchStreakDays(
  supabase: SupabaseClient,
  memberPlanId: string | null,
) {
  if (!memberPlanId) return 0;

  const { data: logs } = await supabase
    .from("reading_logs")
    .select("completed_at")
    .eq("member_plan_id", memberPlanId);

  if (!logs || logs.length === 0) return 0;

  const completedDays = new Set(
    logs.map((log) => new Date(log.completed_at).toDateString()),
  );

  const cursor = new Date();
  if (!completedDays.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (completedDays.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
