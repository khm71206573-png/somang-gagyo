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
      {events.map((event) => (
        <ScheduleEventCard key={event.id} event={event} />
      ))}
    </section>
  );
}
