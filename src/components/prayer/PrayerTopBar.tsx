import { Plus } from "lucide-react";

export function PrayerTopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-background/90 px-margin-main pt-stack-md pb-stack-sm backdrop-blur-md">
      <h1 className="font-heading text-headline-md text-foreground">
        기도제목
      </h1>
      <button
        type="button"
        aria-label="기도제목 추가"
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container-highest active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>
    </header>
  );
}
