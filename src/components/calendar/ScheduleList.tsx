import { ScheduleEventCard } from "@/components/calendar/ScheduleEventCard";
import type { ScheduleEvent } from "@/lib/mock-data";

interface ScheduleListProps {
  dateLabel: string;
  events: ScheduleEvent[];
}

export function ScheduleList({ dateLabel, events }: ScheduleListProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-title-lg text-foreground">{dateLabel}</h3>
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
