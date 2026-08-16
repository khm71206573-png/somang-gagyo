import type { DevotionDetail } from "@/lib/mock-data";

interface ScriptureHeadingProps {
  devotion: DevotionDetail;
}

export function ScriptureHeading({ devotion }: ScriptureHeadingProps) {
  return (
    <section className="text-center">
      <p className="mb-1 text-label-sm text-primary">{devotion.dateLabel}</p>
      <h2 className="font-heading text-headline-md text-foreground">
        {devotion.title}
      </h2>
      <p className="mt-2 text-body-md text-muted-foreground">
        {devotion.reference}
      </p>
    </section>
  );
}
