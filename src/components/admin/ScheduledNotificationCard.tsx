import { Clock } from "lucide-react";
import type { ScheduledNotification } from "@/lib/mock-data";

interface ScheduledNotificationCardProps {
  notification: ScheduledNotification;
}

export function ScheduledNotificationCard({
  notification,
}: ScheduledNotificationCardProps) {
  return (
    <section
      id="scheduled-notification"
      className="flex scroll-mt-20 flex-col gap-stack-sm pb-4"
    >
      <h2 className="text-title-lg text-foreground">발송 예약된 알림</h2>
      <div className="flex items-start gap-3 rounded-md border border-primary/20 bg-primary/10 p-4">
        <Clock className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <p className="text-body-md font-medium text-foreground">
            {notification.title}
          </p>
          <p className="mt-1 text-label-sm text-muted-foreground">
            {notification.scheduleLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
