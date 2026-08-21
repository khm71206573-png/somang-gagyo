"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

interface GroupTopBarProps {
  title: string;
  onCalendarClick: () => void;
}

export function GroupTopBar({ title, onCalendarClick }: GroupTopBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-background px-margin-main">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => router.back()}
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-opacity hover:opacity-80"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 text-center font-heading text-headline-md text-primary">
        {title}
      </h1>
      <button
        type="button"
        aria-label="날짜 선택"
        onClick={onCalendarClick}
        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-opacity hover:opacity-80"
      >
        <CalendarDays className="h-5 w-5" />
      </button>
    </header>
  );
}
