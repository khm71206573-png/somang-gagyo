import Link from "next/link";
import {
  FileEdit,
  Library,
  Podcast,
  CalendarDays,
  UserPlus,
  Megaphone,
} from "lucide-react";
import type {
  QuickManagementAction,
  QuickManagementIcon,
} from "@/lib/mock-data";

interface QuickManagementGridProps {
  actions: QuickManagementAction[];
}

const iconMap: Record<QuickManagementIcon, typeof FileEdit> = {
  devotion: FileEdit,
  song: Library,
  sermon: Podcast,
  calendar: CalendarDays,
  memberApproval: UserPlus,
  notification: Megaphone,
};

const cardClassName =
  "flex flex-col items-center justify-center gap-3 rounded-md border border-outline-variant/40 bg-card p-4 shadow-[0px_4px_14px_rgba(44,44,44,0.03)] transition-colors hover:bg-surface-container-low active:scale-[0.98]";

export function QuickManagementGrid({ actions }: QuickManagementGridProps) {
  return (
    <section className="flex flex-col gap-stack-sm">
      <h2 className="text-title-lg text-foreground">빠른 관리</h2>
      <div className="grid grid-cols-2 gap-gutter-card">
        {actions.map((action) => {
          const Icon = iconMap[action.icon];
          const content = (
            <>
              <Icon className="h-7 w-7 text-primary" />
              <span className="text-body-md font-medium text-foreground">
                {action.label}
              </span>
            </>
          );

          if (action.href) {
            return (
              <Link key={action.id} href={action.href} className={cardClassName}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={action.id}
              type="button"
              disabled
              className={`${cardClassName} cursor-not-allowed opacity-60`}
            >
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}
