import type { SongLyricsStanza } from "@/lib/mock-data";

interface SongLyricsProps {
  stanzas: SongLyricsStanza[];
}

export function SongLyrics({ stanzas }: SongLyricsProps) {
  return (
    <section className="flex flex-col gap-stack-md">
      <h3 className="text-title-lg text-foreground">가사</h3>
      <div className="flex flex-col gap-5 rounded-lg border border-outline/15 bg-card p-5 text-center shadow-[0_2px_10px_rgba(44,44,44,0.04)]">
        {stanzas.map((stanza, index) => (
          <div key={index} className="flex flex-col gap-1">
            {stanza.lines.map((line, lineIndex) => (
              <p
                key={lineIndex}
                className="text-body-lg leading-relaxed text-foreground"
              >
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
