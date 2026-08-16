import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchActiveMemberPlan(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data } = await supabase
    .from("member_plans")
    .select("id, plan_id, current_day, started_at, bible_plans(title, total_days)")
    .eq("member_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  return data;
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
