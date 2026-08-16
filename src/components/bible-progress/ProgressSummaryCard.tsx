import { CalendarDays, Flame } from "lucide-react";
import type { BibleProgressSummary } from "@/lib/mock-data";

interface ProgressSummaryCardProps {
  summary: BibleProgressSummary;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressSummaryCard({ summary }: ProgressSummaryCardProps) {
  const dashOffset = CIRCUMFERENCE * (1 - summary.percent / 100);

  return (
    <section className="flex items-center gap-6 rounded-lg border border-surface-dim bg-surface-bright p-5 shadow-[0_4px_20px_-2px_rgba(44,44,44,0.04)]">
      <div className="relative h-24 w-24 shrink-0">
        <svg className="h-full w-full" viewBox="0 0 100 100">
          <circle
            className="stroke-surface-container-highest"
            cx="50"
            cy="50"
            r={RADIUS}
            fill="transparent"
            strokeWidth="8"
          />
          <circle
            className="origin-center -rotate-90 stroke-primary transition-[stroke-dashoffset] duration-300"
            cx="50"
            cy="50"
            r={RADIUS}
            fill="transparent"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-title-lg text-foreground">
            {summary.percent}%
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-[18px] w-[18px] text-tertiary" />
          <span className="text-body-md text-foreground">
            {summary.dayLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="h-[18px] w-[18px] text-primary" fill="currentColor" />
          <span className="text-body-md text-foreground">
            {summary.streakLabel}
          </span>
        </div>
        <div className="mt-1">
          <span className="text-label-sm text-tertiary-container">
            {summary.estimatedCompletionLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
