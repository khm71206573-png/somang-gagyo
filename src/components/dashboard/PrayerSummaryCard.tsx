"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Hand } from "lucide-react";
import type { PrayerScopeSummary, PrayerSummary } from "@/lib/supabase/queries/dashboard";

interface PrayerSummaryCardProps {
  summary: PrayerSummary;
}

/** 기도제목이 여러 개일 때 하나씩 넘어가는 간격 */
const ROTATION_INTERVAL_MS = 4000;

function ScopeBlock({ scope, tick }: { scope: PrayerScopeSummary; tick: number }) {
  const total = scope.contents.length;
  const index = total > 0 ? tick % total : 0;
  const content = scope.contents[index] ?? null;

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
      {/* key가 바뀌면 새로 마운트돼 다음 기도제목이 부드럽게 나타난다. */}
      <p
        key={index}
        className="mt-0.5 line-clamp-2 text-label-sm text-muted-foreground animate-in fade-in duration-500"
      >
        {content ?? "아직 올라온 기도제목이 없어요."}
      </p>
      {total > 1 && (
        <div className="mt-1.5 flex items-center gap-1" aria-hidden="true">
          {scope.contents.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`h-1 w-1 rounded-full transition-colors ${
                dotIndex === index ? "bg-primary" : "bg-outline-variant"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PrayerSummaryCard({ summary }: PrayerSummaryCardProps) {
  const [tick, setTick] = useState(0);

  const maxContents = Math.max(
    summary.community.contents.length,
    summary.mine.contents.length,
  );

  // 쌓인 기도제목이 여러 개일 때만 순서대로 돌려 보여준다.
  useEffect(() => {
    if (maxContents < 2) return;

    const timer = window.setInterval(
      () => setTick((current) => current + 1),
      ROTATION_INTERVAL_MS,
    );

    return () => window.clearInterval(timer);
  }, [maxContents]);

  return (
    <Link
      href="/prayer"
      className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)] transition-transform duration-200 active:scale-[0.98]"
    >
      <div className="flex items-center gap-1">
        <Hand className="h-4 w-4 text-primary" />
        <span className="text-label-sm font-semibold text-primary">기도제목</span>
      </div>
      <ScopeBlock scope={summary.community} tick={tick} />
      <div className="h-px w-full bg-outline-variant/30" />
      <ScopeBlock scope={summary.mine} tick={tick} />
    </Link>
  );
}
