"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useIsAdmin } from "@/hooks/useProfile";

export function CalendarFab() {
  const isAdmin = useIsAdmin();

  // 일정 등록 API가 관리자 전용이라 관리자에게만 노출한다.
  if (!isAdmin) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[104px] left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2">
      <div className="flex justify-end px-margin-main">
        <Link
          href="/admin/event/new"
          aria-label="일정 추가"
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary-container"
        >
          <Plus className="h-7 w-7" />
        </Link>
      </div>
    </div>
  );
}
