import type { SermonSummary } from "@/lib/mock-data";

interface SermonSummaryTabProps {
  summary: SermonSummary;
}

export function SermonSummaryTab({ summary }: SermonSummaryTabProps) {
  return (
    <section className="space-y-stack-md">
      <div className="mb-stack-lg mt-4 border-l-4 border-primary py-1 pl-4">
        <p className="text-title-lg italic leading-relaxed text-primary">
          &ldquo;{summary.quote}&rdquo;
        </p>
      </div>
      <div className="space-y-4 text-body-lg leading-relaxed text-muted-foreground">
        {summary.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
