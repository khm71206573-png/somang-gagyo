import { ChevronRight, Clock, BookOpen, Users } from "lucide-react";
import type { BiblePlan } from "@/lib/mock-data";

interface BiblePlanCardProps {
  plan: BiblePlan;
}

const ribbonClassMap = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  "secondary-container": "bg-success-container text-success-container-foreground",
};

const dotColorClassMap = {
  primary: "text-primary",
  error: "text-destructive",
  secondary: "text-secondary",
};

export function BiblePlanCard({ plan }: BiblePlanCardProps) {
  return (
    <article className="group relative flex cursor-pointer flex-col gap-3 rounded-lg border border-surface-container-highest/50 bg-card p-5 shadow-[0_4px_12px_rgba(44,44,44,0.03)] transition-colors hover:bg-surface-container-low/50">
      {plan.ribbon && (
        <div
          className={
            plan.ribbon.rotated
              ? "absolute -top-3 -right-2 rotate-12"
              : "absolute -top-3 right-8"
          }
        >
          <span
            className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${ribbonClassMap[plan.ribbon.variant]}`}
          >
            {plan.ribbon.label}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-title-lg text-foreground transition-colors group-hover:text-primary">
            {plan.title}
          </h2>
          <p className="mt-1 text-body-md text-muted-foreground">
            {plan.description}
          </p>
        </div>
        <span
          className={
            plan.isFeatured
              ? "whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-label-sm text-primary"
              : "whitespace-nowrap rounded-full bg-surface-container-highest px-3 py-1 text-label-sm text-foreground"
          }
        >
          {plan.durationLabel}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-outline-variant/30 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-outline">
            <Clock className="h-4 w-4" />
            <span className="text-label-sm">{plan.minutesPerDay}</span>
          </div>
          <div className="flex items-center gap-1 text-outline">
            <BookOpen className="h-4 w-4" />
            <span className="text-label-sm">{plan.chaptersPerDay}</span>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" fill="currentColor" />
            <span className="text-label-sm">{plan.participantCount}명 참여 중</span>
          </div>
          <div className={`flex items-center gap-1 ${dotColorClassMap[plan.difficultyColor]}`}>
            {Array.from({ length: 3 }).map((_, index) => (
              <span
                key={index}
                className={index >= plan.difficultyFilled ? "text-xs text-outline-variant" : "text-xs"}
              >
                {index < plan.difficultyFilled ? "●" : "○"}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 transition-opacity group-hover:opacity-100">
        <ChevronRight className="h-5 w-5" />
      </div>
    </article>
  );
}
