import { ScheduleEventCard } from "@/components/calendar/ScheduleEventCard";
import type { ScheduleEvent } from "@/lib/mock-data";

interface ScheduleListProps {
  dateLabel: string;
  holidayName?: string | null;
  events: ScheduleEvent[];
}

export function ScheduleList({
  dateLabel,
  holidayName,
  events,
}: ScheduleListProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-title-lg text-foreground">{dateLabel}</h3>
        {holidayName && (
          <span className="rounded-full bg-sunday/10 px-2 py-0.5 text-label-sm text-sunday">
            {holidayName}
          </span>
        )}
      </div>
      {events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-outline-variant/60 py-stack-lg text-center text-body-md text-muted-foreground">
          이 날은 등록된 일정이 없어요.
        </p>
      ) : (
        events.map((event) => (
          <ScheduleEventCard key={event.id} event={event} />
        ))
      )}
    </section>
  );
}
