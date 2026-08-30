"use client";

import { devotionSourceLabels, type DevotionSource } from "@/lib/devotionSource";

interface DevotionSourceTabsProps {
  sources: DevotionSource[];
  activeSource: DevotionSource;
  onSelect: (source: DevotionSource) => void;
}

/** 매일성경 / 하나님나라QT를 오가는 탭. 올라온 출처가 하나뿐이면 보이지 않는다. */
export function DevotionSourceTabs({
  sources,
  activeSource,
  onSelect,
}: DevotionSourceTabsProps) {
  if (sources.length < 2) return null;

  return (
    <nav className="relative flex border-b border-outline-variant/30 px-margin-main">
      {sources.map((source) => {
        const isActive = source === activeSource;
        return (
          <button
            key={source}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(source)}
            className={
              isActive
                ? "relative flex-1 pb-3 text-center text-body-lg font-semibold text-primary"
                : "relative flex-1 pb-3 text-center text-body-lg text-muted-foreground transition-colors hover:text-primary"
            }
          >
            {devotionSourceLabels[source]}
            {isActive && (
              <div className="absolute -bottom-px left-0 h-[2px] w-full rounded-t-full bg-primary" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
