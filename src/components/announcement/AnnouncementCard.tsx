import Link from "next/link";
import { MessageCircle, Pin, Users } from "lucide-react";
import { AnnouncementKindBadge } from "@/components/announcement/AnnouncementKindBadge";
import type { AnnouncementListItem } from "@/lib/supabase/queries/announcement";

interface AnnouncementCardProps {
  item: AnnouncementListItem;
}

export function AnnouncementCard({ item }: AnnouncementCardProps) {
  return (
    <Link
      href={`/announcement/${item.id}`}
      className={
        item.isPinned
          ? "flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-5 shadow-[0_2px_10px_rgba(44,44,44,0.04)] transition-colors hover:bg-primary/10"
          : "flex flex-col gap-3 rounded-lg border border-outline-variant/20 bg-card p-5 shadow-[0_2px_10px_rgba(44,44,44,0.04)] transition-colors hover:bg-surface-container-low"
      }
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {item.isPinned && (
          <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            <Pin className="h-3 w-3" />
            고정
          </span>
        )}
        <AnnouncementKindBadge kind={item.kind} pollType={item.pollType} />
        {item.kind === "poll" && item.isClosed && (
          <span className="rounded-full bg-surface-container-highest px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            마감
          </span>
        )}
        {item.kind === "poll" && !item.isClosed && item.hasVoted && (
          <span className="rounded-full bg-secondary/20 px-2.5 py-1 text-[11px] font-medium text-secondary">
            투표함
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-body-lg font-semibold text-foreground">{item.title}</h2>
        {item.preview && (
          <p className="line-clamp-2 text-body-md leading-relaxed text-muted-foreground">
            {item.preview}
          </p>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-outline-variant/30 pt-3 text-[12px] text-muted-foreground">
        <span>
          {item.authorName} · {item.dateLabel}
        </span>
        {item.kind === "poll" && (
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {item.voterCount}명 참여
          </span>
        )}
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {item.commentCount}
        </span>
        {item.closesAtLabel && (
          <span className={item.isClosed ? "" : "text-primary"}>
            {item.closesAtLabel}
          </span>
        )}
      </footer>
    </Link>
  );
}
