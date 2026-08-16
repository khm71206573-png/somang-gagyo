import { Plus } from "lucide-react";

export function CalendarFab() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[104px] left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2">
      <div className="flex justify-end px-margin-main">
        <button
          type="button"
          aria-label="일정 추가"
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary-container"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}
