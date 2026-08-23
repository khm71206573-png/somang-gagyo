import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BiblePlan,
  PlanDifficultyColor,
  PlanRibbonVariant,
} from "@/lib/mock-data";

const DIFFICULTY_COLOR_MAP: Record<number, PlanDifficultyColor> = {
  1: "secondary",
  2: "primary",
};

export async function fetchBiblePlanList(
  supabase: SupabaseClient,
): Promise<BiblePlan[]> {
  const { data: plans } = await supabase
    .from("bible_plans")
    .select(
      "id, title, description, total_days, minutes_per_day, chapters_per_day, difficulty, is_featured, ribbon_label, ribbon_variant, created_at",
    )
    .order("created_at", { ascending: true });

  if (!plans || plans.length === 0) return [];

  const [{ data: activePlans }, { data: auth }] = await Promise.all([
    supabase.from("member_plans").select("plan_id, member_id").eq("is_active", true),
    supabase.auth.getUser(),
  ]);

  const countByPlan = new Map<string, number>();
  const myPlanIds = new Set<string>();

  for (const row of activePlans ?? []) {
    countByPlan.set(row.plan_id, (countByPlan.get(row.plan_id) ?? 0) + 1);
    if (auth?.user && row.member_id === auth.user.id) {
      myPlanIds.add(row.plan_id);
    }
  }

  return plans.map((plan) => ({
    id: plan.id,
    title: plan.title,
    description: plan.description ?? "",
    durationLabel: `${plan.total_days}일`,
    totalDays: plan.total_days,
    isFeatured: plan.is_featured,
    minutesPerDay: plan.minutes_per_day ?? "",
    chaptersPerDay: plan.chapters_per_day ?? "",
    participantCount: countByPlan.get(plan.id) ?? 0,
    isJoined: myPlanIds.has(plan.id),
    difficultyFilled: plan.difficulty,
    difficultyColor: DIFFICULTY_COLOR_MAP[plan.difficulty] ?? "error",
    ribbon: plan.ribbon_label
      ? {
          label: plan.ribbon_label,
          variant: (plan.ribbon_variant ?? "primary") as PlanRibbonVariant,
          rotated: plan.is_featured,
        }
      : undefined,
  }));
}
