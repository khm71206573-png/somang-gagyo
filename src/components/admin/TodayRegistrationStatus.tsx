import Link from "next/link";
import { BookOpen, Music, Newspaper, Check } from "lucide-react";
import type {
  RegistrationStatusItem,
  RegistrationStatusIcon,
} from "@/lib/mock-data";

interface TodayRegistrationStatusProps {
  items: RegistrationStatusItem[];
}

const iconMap: Record<RegistrationStatusIcon, typeof BookOpen> = {
  devotion: BookOpen,
  song: Music,
  groupMaterial: Newspaper,
};

export function TodayRegistrationStatus({
  items,
}: TodayRegistrationStatusProps) {
  return (
    <section className="flex flex-col gap-stack-sm">
      <h2 className="text-title-lg text-foreground">
        오늘의 콘텐츠 등록 현황
      </h2>
      <div className="flex items-center justify-between rounded-md border border-outline-variant/40 bg-card p-5 shadow-[0px_4px_14px_rgba(44,44,44,0.03)]">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon];
          const itemClassName = item.isRegistered
            ? "flex flex-1 flex-col items-center gap-2"
            : "flex flex-1 flex-col items-center gap-2 opacity-60";
          const content = (
            <>
              <div
                className={
                  item.isRegistered
                    ? "relative flex h-12 w-12 items-center justify-center rounded-full bg-success-container/30"
                    : "flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest"
                }
              >
                <Icon
                  className={
                    item.isRegistered
                      ? "h-6 w-6 text-success-container-foreground"
                      : "h-6 w-6 text-muted-foreground"
                  }
                  fill={item.isRegistered ? "currentColor" : "none"}
                />
                {item.isRegistered && (
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-secondary text-secondary-foreground">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                )}
              </div>
              <span
                className={
                  item.isRegistered
                    ? "text-label-sm text-foreground"
                    : "text-label-sm text-muted-foreground"
                }
              >
                {item.isRegistered ? item.label : "미등록"}
              </span>
            </>
          );

          return (
            <div key={item.id} className="flex flex-1 items-center">
              {index > 0 && (
                <div className="mr-2 h-10 w-px shrink-0 bg-outline-variant/30" />
              )}
              {item.href ? (
                <Link href={item.href} className={itemClassName}>
                  {content}
                </Link>
              ) : (
                <div className={itemClassName}>{content}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
