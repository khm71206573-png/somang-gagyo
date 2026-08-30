import type { DevotionFootnote } from "@/lib/mock-data";

interface FootnoteListProps {
  footnotes: DevotionFootnote[];
}

/** 지면 각주. 매일 읽는 것은 아니라서 접어둔다. */
export function FootnoteList({ footnotes }: FootnoteListProps) {
  if (footnotes.length === 0) return null;

  return (
    <details className="rounded-lg border border-outline-variant/40 px-5 py-4">
      <summary className="cursor-pointer text-label-sm font-medium text-muted-foreground">
        각주 {footnotes.length}개
      </summary>
      <ul className="mt-3 flex flex-col gap-2">
        {footnotes.map((footnote, index) => (
          <li key={`${footnote.marker}-${index}`} className="flex gap-2">
            <span className="shrink-0 text-label-sm font-bold text-primary">
              {footnote.marker || "·"}
            </span>
            <p className="text-label-sm leading-relaxed text-muted-foreground">
              {footnote.text}
              {footnote.verse ? ` (${footnote.verse}절)` : ""}
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
