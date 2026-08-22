"use client";

import { useCallback, useEffect, useState } from "react";

export interface FontScale {
  label: string;
  className: string;
}

/** 본문 읽기용 글자 크기 단계. 묵상·설교요약이 같은 단계를 쓴다. */
export const FONT_SCALES: readonly FontScale[] = [
  { label: "작게", className: "text-body-md leading-relaxed" },
  { label: "보통", className: "text-body-lg leading-relaxed" },
  { label: "크게", className: "text-title-lg leading-loose" },
  { label: "아주 크게", className: "text-headline-md leading-loose" },
] as const;

const DEFAULT_SCALE_INDEX = 1;

/**
 * 읽기 편한 글자 크기를 기억한다.
 * storageKey를 화면마다 다르게 주면 화면별로 따로 저장된다.
 */
export function useFontScale(storageKey: string) {
  const [scaleIndex, setScaleIndex] = useState(DEFAULT_SCALE_INDEX);

  // 저장소 접근이 막힌 환경에서는 기본값을 쓴다.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === null) return;
      const parsed = Number.parseInt(saved, 10);
      if (parsed >= 0 && parsed < FONT_SCALES.length) {
        setScaleIndex(parsed);
      }
    } catch {
      // 무시하고 기본 크기를 사용한다.
    }
  }, [storageKey]);

  const changeScale = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= FONT_SCALES.length) return;
      setScaleIndex(nextIndex);
      try {
        window.localStorage.setItem(storageKey, String(nextIndex));
      } catch {
        // 저장하지 못해도 이번 세션에는 적용된다.
      }
    },
    [storageKey],
  );

  return {
    scaleIndex,
    scale: FONT_SCALES[scaleIndex],
    canDecrease: scaleIndex > 0,
    canIncrease: scaleIndex < FONT_SCALES.length - 1,
    changeScale,
  };
}
