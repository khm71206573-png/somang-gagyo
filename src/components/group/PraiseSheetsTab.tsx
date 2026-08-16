import { Play, ListMusic } from "lucide-react";
import type { PraiseSheet } from "@/lib/mock-data";

interface PraiseSheetsTabProps {
  sheets: PraiseSheet[];
}

export function PraiseSheetsTab({ sheets }: PraiseSheetsTabProps) {
  return (
    <section className="space-y-stack-md">
      {sheets.map((sheet) => (
        <div
          key={sheet.id}
          className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-card p-4 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]"
        >
          <div>
            <div className="mb-1 inline-block rounded bg-success-container px-2 py-0.5 text-[11px] font-bold text-success-container-foreground">
              {sheet.key}
            </div>
            <h3 className="text-body-lg text-foreground">{sheet.title}</h3>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="유튜브 재생"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-muted-foreground transition-colors hover:bg-surface-container-highest"
            >
              <Play className="h-5 w-5" fill="currentColor" />
            </button>
            <button
              type="button"
              aria-label="악보 보기"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
            >
              <ListMusic className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
