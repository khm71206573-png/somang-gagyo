import { User } from "lucide-react";

export function AdminTopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-bright px-margin-main">
      <h1 className="font-heading text-headline-md font-bold text-primary">
        콘텐츠 관리
      </h1>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-primary-foreground">
        <User className="h-4 w-4" fill="currentColor" />
      </div>
    </header>
  );
}
