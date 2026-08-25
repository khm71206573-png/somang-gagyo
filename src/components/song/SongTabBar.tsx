"use client";

import type { SongTab, SongTabId } from "@/lib/mock-data";

interface SongTabBarProps {
  tabs: SongTab[];
  activeTabId: SongTabId;
  onSelect: (id: SongTabId) => void;
}

export function SongTabBar({ tabs, activeTabId, onSelect }: SongTabBarProps) {
  return (
    <nav className="relative flex border-b border-outline-variant/30 px-margin-main">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(tab.id)}
            className={
              isActive
                ? "relative flex-1 pb-3 text-center text-body-lg font-semibold text-primary"
                : "relative flex-1 pb-3 text-center text-body-lg text-muted-foreground transition-colors hover:text-primary"
            }
          >
            {tab.label}
            {isActive && (
              <div className="absolute -bottom-px left-0 h-[2px] w-full rounded-t-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
