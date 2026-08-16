import { Settings } from "lucide-react";

export function BibleProgressTopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-background px-margin-main shadow-sm">
      <h1 className="font-heading text-headline-md text-foreground">
        성경통독
      </h1>
      <button
        type="button"
        aria-label="설정"
        className="flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:bg-surface-container-low active:scale-95"
      >
        <Settings className="h-5 w-5 text-muted-foreground" />
      </button>
    </header>
  );
}
