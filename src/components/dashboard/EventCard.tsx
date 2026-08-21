import Link from "next/link";
import type { EventItem } from "@/lib/mock-data";

interface EventCardProps {
  events: EventItem[];
}

export function EventCard({ events }: EventCardProps) {
  return (
    <Link
      href="/calendar"
      className="block rounded-md border border-border bg-card p-5 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)] transition-transform duration-200 active:scale-[0.98]"
    >
      <h3 className="mb-4 font-heading text-title-lg text-foreground">
        다가오는 일정
      </h3>
      <div className="space-y-3">
        {events.length === 0 && (
          <p className="py-2 text-body-md text-muted-foreground">
            다가오는 일정이 없어요.
          </p>
        )}
        {events.map((event, index) => (
          <div
            key={`${event.month}-${event.day}-${event.title}`}
            className={`flex items-center gap-4 py-2 ${
              index !== events.length - 1
                ? "border-b border-surface-container-high"
                : ""
            }`}
          >
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-md bg-surface-container-low">
              <span className="text-label-sm font-bold text-primary">
                {event.month}/{event.day}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {event.weekday}
              </span>
            </div>
            <p className="flex-1 text-body-md font-medium text-foreground">
              {event.title}
            </p>
          </div>
        ))}
      </div>
    </Link>
  );
}
