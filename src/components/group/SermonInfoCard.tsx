import type { SermonInfo } from "@/lib/mock-data";

interface SermonInfoCardProps {
  sermon: SermonInfo;
}

export function SermonInfoCard({ sermon }: SermonInfoCardProps) {
  return (
    <section className="flex flex-col items-center rounded-lg border border-outline-variant/30 bg-card p-6 text-center shadow-[0px_4px_20px_rgba(44,44,44,0.04)]">
      <div className="mb-4 inline-block rounded-full bg-surface-container px-3 py-1">
        <span className="text-label-sm text-tertiary">
          {sermon.categoryLabel}
        </span>
      </div>
      <h2 className="mb-2 font-heading text-display-lg text-primary">
        {sermon.title}
      </h2>
      <div className="mx-auto mb-4 h-0.5 w-12 bg-primary/20" />
      <p className="mb-1 text-title-lg text-foreground">{sermon.reference}</p>
      <p className="text-body-md text-muted-foreground">{sermon.preacher}</p>
    </section>
  );
}
