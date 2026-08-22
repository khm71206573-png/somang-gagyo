"use client";

import { FontScaleControl } from "@/components/common/FontScaleControl";
import { useFontScale } from "@/hooks/useFontScale";
import type { DevotionVerse } from "@/lib/mock-data";

interface ScriptureCardProps {
  verses: DevotionVerse[];
}

const STORAGE_KEY = "devotion-font-scale";

export function ScriptureCard({ verses }: ScriptureCardProps) {
  const { scale, scaleIndex, canDecrease, canIncrease, changeScale } =
    useFontScale(STORAGE_KEY);

  return (
    <section className="relative rounded-lg border border-outline/15 bg-card p-6 shadow-[0_2px_10px_rgba(44,44,44,0.04)]">
      <FontScaleControl
        className="absolute right-4 top-4"
        label={scale.label}
        canDecrease={canDecrease}
        canIncrease={canIncrease}
        onDecrease={() => changeScale(scaleIndex - 1)}
        onIncrease={() => changeScale(scaleIndex + 1)}
      />
      <div className={`mt-8 space-y-4 text-foreground ${scale.className}`}>
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
