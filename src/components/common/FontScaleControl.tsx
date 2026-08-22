"use client";

interface FontScaleControlProps {
  label: string;
  canDecrease: boolean;
  canIncrease: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  className?: string;
}

/** "가 / 크기 / 가" 형태의 글자 크기 조절 버튼. 묵상·설교요약이 같이 쓴다. */
export function FontScaleControl({
  label,
  canDecrease,
  canIncrease,
  onDecrease,
  onIncrease,
  className = "",
}: FontScaleControlProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        aria-label="글자 작게"
        disabled={!canDecrease}
        onClick={onDecrease}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-container-highest disabled:opacity-40"
      >
        가
      </button>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <button
        type="button"
        aria-label="글자 크게"
        disabled={!canIncrease}
        onClick={onIncrease}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-base font-bold text-muted-foreground transition-colors hover:bg-surface-container-highest disabled:opacity-40"
      >
        가
      </button>
    </div>
  );
}
