"use client";

import { useMemo, useState } from "react";
import { FontScaleControl } from "@/components/common/FontScaleControl";
import { useFontScale } from "@/hooks/useFontScale";
import type { DevotionFootnote, DevotionVerse } from "@/lib/mock-data";

interface ScriptureCardProps {
  verses: DevotionVerse[];
  footnotes?: DevotionFootnote[];
}

const STORAGE_KEY = "devotion-font-scale";

/** 각주를 절 번호로 묶는다. 절을 모르는 각주는 따로 모아 맨 아래에 둔다. */
function groupFootnotes(footnotes: DevotionFootnote[]) {
  const byVerse = new Map<number, DevotionFootnote[]>();
  const unassigned: DevotionFootnote[] = [];

  for (const footnote of footnotes) {
    if (footnote.verse === null) {
      unassigned.push(footnote);
      continue;
    }
    const existing = byVerse.get(footnote.verse);
    if (existing) existing.push(footnote);
    else byVerse.set(footnote.verse, [footnote]);
  }

  return { byVerse, unassigned };
}

export function ScriptureCard({ verses, footnotes = [] }: ScriptureCardProps) {
  const { scale, scaleIndex, canDecrease, canIncrease, changeScale } =
    useFontScale(STORAGE_KEY);

  // 열려 있는 각주 하나만 보여준다. 여러 개를 동시에 펼치면 본문이 끊긴다.
  const [openKey, setOpenKey] = useState<string | null>(null);

  const { byVerse, unassigned } = useMemo(
    () => groupFootnotes(footnotes),
    [footnotes],
  );

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
        {verses.map((verse) => {
          const verseFootnotes = byVerse.get(verse.number) ?? [];
          const openFootnote = verseFootnotes.find(
            (footnote, index) => `${verse.number}-${index}` === openKey,
          );

          return (
            <div key={verse.number}>
              <p className="flex">
                <span className="mr-3 mt-1.5 w-3 shrink-0 text-right text-xs font-bold text-primary">
                  {verse.number}
                </span>
                <span>
                  {verse.text}
                  {verseFootnotes.map((footnote, index) => {
                    const key = `${verse.number}-${index}`;
                    const isOpen = key === openKey;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={`${verse.number}절 각주 ${footnote.marker}`}
                        onClick={() => setOpenKey(isOpen ? null : key)}
                        className={
                          isOpen
                            ? "ml-0.5 align-super text-[0.65em] font-bold text-primary underline underline-offset-2"
                            : "ml-0.5 align-super text-[0.65em] font-bold text-primary/70 underline underline-offset-2 transition-colors hover:text-primary"
                        }
                      >
                        {footnote.marker || "*"}
                      </button>
                    );
                  })}
                </span>
              </p>

              {openFootnote && (
                <p className="ml-6 mt-2 rounded-md bg-surface-container-low px-3 py-2 text-label-sm leading-relaxed text-muted-foreground">
                  <span className="mr-1 font-bold text-primary">
                    {openFootnote.marker}
                  </span>
                  {openFootnote.text}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {unassigned.length > 0 && (
        <ul className="mt-6 flex flex-col gap-2 border-t border-outline-variant/30 pt-4">
          {unassigned.map((footnote, index) => (
            <li key={`${footnote.marker}-${index}`} className="flex gap-2">
              <span className="shrink-0 text-label-sm font-bold text-primary">
                {footnote.marker || "·"}
              </span>
              <p className="text-label-sm leading-relaxed text-muted-foreground">
                {footnote.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
