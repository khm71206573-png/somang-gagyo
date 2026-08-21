"use client";

import type { PrayerFilterTab } from "@/lib/mock-data";

interface PrayerFilterTabsProps {
  tabs: PrayerFilterTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

export function PrayerFilterTabs({
  tabs,
  activeTabId,
  onTabChange,
}: PrayerFilterTabsProps) {
  return (
    <nav className="w-full overflow-x-auto border-b border-outline-variant/30 bg-background px-margin-main py-stack-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onTabChange(tab.id)}
              className={
                isActive
                  ? "rounded-full bg-cta px-5 py-2 text-label-sm text-cta-foreground transition-transform active:scale-95"
                  : "rounded-full border border-outline-variant bg-surface-container px-5 py-2 text-label-sm text-muted-foreground transition-colors hover:bg-surface-container-high active:scale-95"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
