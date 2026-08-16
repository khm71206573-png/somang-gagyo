import { AlertCircle } from "lucide-react";
import type { MissedPortionAlert as MissedPortionAlertData } from "@/lib/mock-data";

interface MissedPortionAlertProps {
  alert: MissedPortionAlertData;
}

export function MissedPortionAlert({ alert }: MissedPortionAlertProps) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-surface-dim bg-warning-container p-4">
      <div className="flex items-center gap-2 text-warning">
        <AlertCircle className="h-5 w-5" fill="currentColor" />
        <span className="font-medium text-body-md">{alert.message}</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-md border border-warning bg-card py-2 text-label-sm text-warning transition-transform active:scale-95"
        >
          {alert.catchUpLabel}
        </button>
        <button
          type="button"
          className="flex-1 rounded-md bg-warning py-2 text-label-sm text-warning-foreground transition-transform active:scale-95"
        >
          {alert.restartLabel}
        </button>
      </div>
    </section>
  );
}
