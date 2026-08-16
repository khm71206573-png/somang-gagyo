import { Clock } from "lucide-react";
import type { TodayPortion } from "@/lib/mock-data";

interface TodayPortionCardProps {
  portion: TodayPortion;
}

export function TodayPortionCard({ portion }: TodayPortionCardProps) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-primary bg-surface-bright p-5">
      <div className="mb-4 flex items-start justify-between">
        <span className="rounded-md bg-accent px-2 py-1 text-label-sm text-primary">
          {portion.tag}
        </span>
        <div className="flex items-center gap-1 text-tertiary">
          <Clock className="h-4 w-4" />
          <span className="text-label-sm">{portion.durationLabel}</span>
        </div>
      </div>
      <h2 className="mb-6 text-title-lg text-foreground">{portion.passage}</h2>
      <button
        type="button"
        className="w-full rounded-lg bg-primary py-4 font-medium text-body-md text-primary-foreground transition-transform hover:opacity-90 active:scale-95"
      >
        {portion.actionLabel}
      </button>
    </section>
  );
}
