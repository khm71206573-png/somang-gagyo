import type { LyricStanza } from "@/lib/mock-data";

interface SongLyricsProps {
  stanzas: LyricStanza[];
}

export function SongLyrics({ stanzas }: SongLyricsProps) {
  return (
    <section className="px-2">
      <h3 className="mb-6 inline-block border-b border-outline-variant/30 pb-2 text-title-lg text-foreground">
        가사
      </h3>
      <div className="space-y-8 text-center text-body-md leading-[2.2] text-muted-foreground">
        {stanzas.map((stanza) => (
          <p
            key={stanza.lines.join("-")}
            className={
              stanza.highlighted ? "font-medium text-foreground" : undefined
            }
          >
            {stanza.lines.map((line, index) => (
              <span key={line}>
                {line}
                {index < stanza.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  );
}
