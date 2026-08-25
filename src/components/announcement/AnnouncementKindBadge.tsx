import { CalendarClock, ListChecks, Megaphone } from "lucide-react";
import type {
  AnnouncementKind,
  AnnouncementPollType,
} from "@/lib/supabase/queries/announcement";

interface AnnouncementKindBadgeProps {
  kind: AnnouncementKind;
  pollType: AnnouncementPollType | null;
}

/** 공지 종류(게시글/일정투표/문항투표)를 한눈에 보여주는 배지 */
export function AnnouncementKindBadge({ kind, pollType }: AnnouncementKindBadgeProps) {
  if (kind === "post") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
        <Megaphone className="h-3 w-3" />
        공지
      </span>
    );
  }

  const isSchedule = pollType === "schedule";
  const Icon = isSchedule ? CalendarClock : ListChecks;

  return (
    <span
      className={
        isSchedule
          ? "flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground"
          : "flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary"
      }
    >
      <Icon className="h-3 w-3" />
      {isSchedule ? "일정투표" : "문항투표"}
    </span>
  );
}
