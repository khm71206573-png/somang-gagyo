"use client";

import Link from "next/link";
import { Pause, Plus } from "lucide-react";
import type { BibleProgressPlanTab } from "@/lib/supabase/queries/bibleProgress";

interface PlanTabsProps {
  tabs: BibleProgressPlanTab[];
  activeMemberPlanId: string;
  onSelect: (memberPlanId: string) => void;
}

/** 진행 중인 통독 플랜을 넘나드는 가로 탭. 맨 끝의 ＋로 플랜을 추가한다. */
export function PlanTabs({ tabs, activeMemberPlanId, onSelect }: PlanTabsProps) {
  return (
    <div className="-mx-margin-main flex gap-2 overflow-x-auto px-margin-main pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const isActive = tab.memberPlanId === activeMemberPlanId;

        return (
          <button
            key={tab.memberPlanId}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(tab.memberPlanId)}
            className={
              isActive
                ? "flex shrink-0 items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-4 py-2 text-label-sm font-medium text-primary transition-transform active:scale-95"
                : "flex shrink-0 items-center gap-1.5 rounded-full border border-surface-dim bg-surface-container-low px-4 py-2 text-label-sm text-muted-foreground transition-transform active:scale-95"
            }
          >
            {tab.isPaused && <Pause className="h-3.5 w-3.5" />}
            {tab.label}
            <span className={isActive ? "text-primary/70" : "text-outline"}>
              {tab.percent}%
            </span>
          </button>
        );
      })}

      <Link
        href="/bible-plan-select"
        aria-label="통독 플랜 추가"
        className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-outline-variant px-4 py-2 text-label-sm text-muted-foreground transition-transform active:scale-95"
      >
        <Plus className="h-4 w-4" />
        추가
      </Link>
    </div>
  );
}
