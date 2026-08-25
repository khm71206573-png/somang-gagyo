"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Megaphone, Pin } from "lucide-react";
import type { DashboardAnnouncement } from "@/lib/supabase/queries/dashboard";

interface AnnouncementBannerProps {
  announcements: DashboardAnnouncement[];
}

/** 공지가 여러 개일 때 하나씩 넘어가는 간격 */
const ROTATION_INTERVAL_MS = 3000;

function kindLabel(announcement: DashboardAnnouncement) {
  if (announcement.kind === "post") return "공지";
  return announcement.pollType === "schedule" ? "일정투표" : "문항투표";
}

export function AnnouncementBanner({ announcements }: AnnouncementBannerProps) {
  const [index, setIndex] = useState(0);
  const total = announcements.length;

  // 공지가 여러 개일 때만 3초에 하나씩 돌려 보여준다.
  useEffect(() => {
    if (total < 2) return;

    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % total),
      ROTATION_INTERVAL_MS,
    );

    return () => window.clearInterval(timer);
  }, [total]);

  if (total === 0) return null;

  const current = announcements[Math.min(index, total - 1)];

  return (
    <Link
      href={`/announcement/${current.id}`}
      className="flex items-center gap-3 rounded-md border border-primary/25 bg-primary/5 p-4 transition-transform duration-200 active:scale-[0.98]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Megaphone className="h-[18px] w-[18px]" />
      </span>
      {/* key가 바뀌면 새로 마운트돼 다음 공지가 부드럽게 나타난다. */}
      <div key={current.id} className="min-w-0 flex-1 animate-in fade-in duration-500">
        <div className="flex items-center gap-1.5">
          {current.isPinned && (
            <Pin className="h-3 w-3 shrink-0 text-primary" />
          )}
          <span className="text-[11px] font-semibold text-primary">
            {kindLabel(current)}
          </span>
          {total > 1 && (
            <span className="text-[11px] text-muted-foreground">
              {index + 1}/{total}
            </span>
          )}
        </div>
        <p className="truncate text-body-md font-medium text-foreground">
          {current.title}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
