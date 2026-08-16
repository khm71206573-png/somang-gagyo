import Image from "next/image";
import type { PastSong } from "@/lib/mock-data";

interface PastSongsScrollProps {
  songs: PastSong[];
}

export function PastSongsScroll({ songs }: PastSongsScrollProps) {
  return (
    <section className="pb-8 pt-4">
      <h3 className="mb-4 px-2 text-title-lg text-foreground">지난 찬양</h3>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className={
              index === songs.length - 1
                ? "group flex w-32 shrink-0 snap-start flex-col gap-2 pr-4"
                : "group flex w-32 shrink-0 snap-start flex-col gap-2"
            }
          >
            <div className="relative h-32 w-32 overflow-hidden rounded-md border border-outline-variant/20 shadow-sm">
              <Image
                src={song.coverImageUrl}
                alt={song.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <p className="truncate text-label-sm text-foreground transition-colors group-hover:text-primary">
              {song.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
