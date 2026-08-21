import type { BiblePlan } from "@/lib/mock-data";

/**
 * 통독 플랜 필터. 플랜 데이터를 기준으로 판단하므로 플랜이 추가돼도 그대로 동작한다.
 */
export function matchesBiblePlanFilter(plan: BiblePlan, filterId: string) {
  switch (filterId) {
    case "beginner":
      // 난이도가 가장 낮은 플랜
      return plan.difficultyFilled <= 1;
    case "one-year":
      return plan.totalDays >= 300 && plan.totalDays <= 400;
    case "short":
      return plan.totalDays <= 100;
    case "nt-only":
      return /신약/.test(`${plan.title} ${plan.description}`);
    case "all":
    default:
      return true;
  }
}
