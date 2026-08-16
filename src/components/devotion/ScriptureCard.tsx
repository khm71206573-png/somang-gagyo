import type { DevotionVerse } from "@/lib/mock-data";

interface ScriptureCardProps {
  verses: DevotionVerse[];
}

export function ScriptureCard({ verses }: ScriptureCardProps) {
  return (
    <section className="relative rounded-lg border border-outline/15 bg-card p-6 shadow-[0_2px_10px_rgba(44,44,44,0.04)]">
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          aria-label="글자 작게"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-container-highest"
        >
          가
        </button>
        <button
          type="button"
          aria-label="글자 크게"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-base font-bold text-muted-foreground transition-colors hover:bg-surface-container-highest"
        >
          가
        </button>
      </div>
      <div className="mt-8 space-y-4 text-body-lg leading-relaxed text-foreground">
        {verses.map((verse) => (
          <p key={verse.number} className="flex">
            <span className="mr-3 mt-1.5 w-3 shrink-0 text-right text-xs font-bold text-primary">
              {verse.number}
            </span>
            <span>{verse.text}</span>
          </p>
        ))}
      </div>
    </section>
  );
}
