"use client";

import { useEffect, useState } from "react";
import type { DevotionVerse } from "@/lib/mock-data";

interface ScriptureCardProps {
  verses: DevotionVerse[];
}

const FONT_SCALES = [
  { label: "작게", className: "text-body-md leading-relaxed" },
  { label: "보통", className: "text-body-lg leading-relaxed" },
  { label: "크게", className: "text-title-lg leading-loose" },
  { label: "아주 크게", className: "text-headline-md leading-loose" },
] as const;

const DEFAULT_SCALE = 1;
const STORAGE_KEY = "devotion-font-scale";

export function ScriptureCard({ verses }: ScriptureCardProps) {
  const [scaleIndex, setScaleIndex] = useState(DEFAULT_SCALE);

  // 읽기 편한 크기를 다음에도 유지한다. 저장소 접근이 막힌 환경에서는 기본값을 쓴다.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === null) return;
      const parsed = Number.parseInt(saved, 10);
      if (parsed >= 0 && parsed < FONT_SCALES.length) {
        setScaleIndex(parsed);
      }
    } catch {
      // 무시하고 기본 크기를 사용한다.
    }
  }, []);

  function changeScale(nextIndex: number) {
    setScaleIndex(nextIndex);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(nextIndex));
    } catch {
      // 저장하지 못해도 이번 세션에는 적용된다.
    }
  }

  const canDecrease = scaleIndex > 0;
  const canIncrease = scaleIndex < FONT_SCALES.length - 1;

  return (
    <section className="relative rounded-lg border border-outline/15 bg-card p-6 shadow-[0_2px_10px_rgba(44,44,44,0.04)]">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="글자 작게"
          disabled={!canDecrease}
          onClick={() => changeScale(scaleIndex - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-container-highest disabled:opacity-40"
        >
          가
        </button>
        <span className="text-[11px] text-muted-foreground">
          {FONT_SCALES[scaleIndex].label}
        </span>
        <button
          type="button"
          aria-label="글자 크게"
          disabled={!canIncrease}
          onClick={() => changeScale(scaleIndex + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-base font-bold text-muted-foreground transition-colors hover:bg-surface-container-highest disabled:opacity-40"
        >
          가
        </button>
      </div>
      <div
        className={`mt-8 space-y-4 text-foreground ${FONT_SCALES[scaleIndex].className}`}
      >
        {verses.map((verse) => (
          <p key={verse.number} className="flex">
            <span className="mr-3 mt-1.5 w-3 shrink-0 text-right text-xs font-bold text-primary">
              {verse.number}
            </span>
            <span>{verse.text}</span>
          </p>
        ))}
      </div>
    </section>
  );
}
