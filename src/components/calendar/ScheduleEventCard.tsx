import Image from "next/image";
import { Cake } from "lucide-react";
import type { ScheduleEvent } from "@/lib/mock-data";
import { eventCategory } from "@/lib/eventCategories";

interface ScheduleEventCardProps {
  event: ScheduleEvent;
}

export function ScheduleEventCard({ event }: ScheduleEventCardProps) {
  const category = eventCategory(event.type);
  const isBirthday = event.type === "birthday";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-surface-container-highest/50 bg-card p-4 shadow-[0_2px_10px_rgba(44,44,44,0.02)]">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${category.dotClassName}`} />
        <span className={`text-label-sm ${category.textClassName}`}>
          {category.label}
        </span>
      </div>

      {isBirthday ? (
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-surface-container-highest">
              {event.avatarUrl && (
                <Image
                  src={event.avatarUrl}
                  alt={event.title}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-surface-container-highest bg-card">
              <Cake className="h-3.5 w-3.5 text-secondary" fill="currentColor" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-body-lg font-semibold text-foreground">
              {event.title}
            </h4>
            <p className="mt-0.5 text-label-sm text-muted-foreground">
              {event.subtitle}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-body-lg font-semibold text-foreground">
              {event.title}
            </h4>
            {event.subtitle && (
              <p className="mt-1 text-body-md text-muted-foreground">
                {event.subtitle}
              </p>
            )}
          </div>
          {event.time && (
            <span className="shrink-0 text-body-md text-muted-foreground">
              {event.time}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
