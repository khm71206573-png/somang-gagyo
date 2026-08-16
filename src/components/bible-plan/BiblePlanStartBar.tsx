export function BiblePlanStartBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 border-t border-outline-variant/30 bg-card/90 px-margin-main py-4 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center justify-between px-2">
        <span className="text-body-md text-foreground">시작일: 오늘부터</span>
        <button
          type="button"
          className="text-label-sm text-outline underline decoration-outline/50 underline-offset-4 transition-colors hover:text-primary"
        >
          변경
        </button>
      </div>
      <button
        type="button"
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center rounded-md bg-surface-container-highest py-4 text-title-lg text-muted-foreground opacity-70 transition-all duration-200"
      >
        이 플랜으로 시작하기
      </button>
    </div>
  );
}
