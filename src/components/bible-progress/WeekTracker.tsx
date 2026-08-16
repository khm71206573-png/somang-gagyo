import { Check } from "lucide-react";
import type { WeekDay } from "@/lib/mock-data";

interface WeekTrackerProps {
  days: WeekDay[];
}

export function WeekTracker({ days }: WeekTrackerProps) {
  return (
    <section className="flex flex-col gap-stack-md">
      <h3 className="text-title-lg text-foreground">이번 주</h3>
      <div className="flex items-center justify-between rounded-lg border border-surface-dim bg-surface-bright p-4 shadow-[0_4px_20px_-2px_rgba(44,44,44,0.04)]">
        {days.map((day) => (
          <div key={day.label} className="flex flex-col items-center gap-1">
            <span
              className={
                day.status === "today"
                  ? "text-label-sm font-bold text-primary"
                  : day.status === "future"
                    ? "text-label-sm text-tertiary-container"
                    : "text-label-sm text-tertiary"
              }
            >
              {day.label}
            </span>
            {day.status === "completed" ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary-foreground">
                <Check className="h-4 w-4" />
              </div>
            ) : day.status === "today" ? (
              <div className="h-8 w-8 rounded-full border-2 border-primary bg-surface-bright" />
            ) : day.status === "missed" ? (
              <div className="h-8 w-8 rounded-full bg-surface-container-highest" />
            ) : (
              <div className="h-8 w-8 rounded-full border border-surface-dim bg-transparent" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
