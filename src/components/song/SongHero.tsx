import Image from "next/image";
import { Play } from "lucide-react";
import type { SongDetail } from "@/lib/mock-data";

interface SongHeroProps {
  song: SongDetail;
}

export function SongHero({ song }: SongHeroProps) {
  return (
    <section className="flex flex-col items-center text-center">
      <div className="relative mb-6 aspect-square w-[70%] overflow-hidden rounded-lg shadow-[0px_4px_24px_rgba(44,44,44,0.08)]">
        <Image
          src={song.coverImageUrl}
          alt={song.title}
          fill
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 rounded-lg border border-outline-variant/30" />
      </div>
      <h2 className="mb-2 font-heading text-headline-md text-foreground">
        {song.title}
      </h2>
      <p className="mb-6 text-body-lg text-muted-foreground">{song.artist}</p>
      <button
        type="button"
        disabled={!song.youtubeUrl}
        onClick={() => {
          if (song.youtubeUrl) {
            window.open(song.youtubeUrl, "_blank", "noopener,noreferrer");
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-4 text-primary-foreground shadow-[0px_2px_8px_rgba(145,71,35,0.2)] transition-all duration-200 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Play className="h-5 w-5" fill="currentColor" />
        <span className="text-title-lg">{song.listenLabel}</span>
      </button>
    </section>
  );
}
