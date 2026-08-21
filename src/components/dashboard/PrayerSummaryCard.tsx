import Link from "next/link";
import { Hand } from "lucide-react";
import type { PrayerScopeSummary, PrayerSummary } from "@/lib/supabase/queries/dashboard";

interface PrayerSummaryCardProps {
  summary: PrayerSummary;
}

function ScopeBlock({ scope }: { scope: PrayerScopeSummary }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-label-sm font-semibold text-foreground">
          {scope.label}
        </span>
        <span className="shrink-0 text-label-sm text-muted-foreground">
          {scope.count}건
        </span>
      </div>
      <p className="mt-0.5 line-clamp-2 text-label-sm text-muted-foreground">
        {scope.latestContent ?? "아직 올라온 기도제목이 없어요."}
      </p>
    </div>
  );
}

export function PrayerSummaryCard({ summary }: PrayerSummaryCardProps) {
  return (
    <Link
      href="/prayer"
      className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)] transition-transform duration-200 active:scale-[0.98]"
    >
      <div className="flex items-center gap-1">
        <Hand className="h-4 w-4 text-primary" />
        <span className="text-label-sm font-semibold text-primary">기도제목</span>
      </div>
      <ScopeBlock scope={summary.community} />
      <div className="h-px w-full bg-outline-variant/30" />
      <ScopeBlock scope={summary.mine} />
    </Link>
  );
}
