import { Flame } from "lucide-react";
import type { StreakInfo } from "@/lib/mock-data";

interface StreakBadgeProps {
  streak: StreakInfo;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-4 py-3">
      <Flame className="h-5 w-5 text-primary" fill="currentColor" strokeWidth={0} />
      <p className="text-label-sm font-semibold text-primary">
        {streak.days}일째 함께하고 있어요
      </p>
    </div>
  );
}
