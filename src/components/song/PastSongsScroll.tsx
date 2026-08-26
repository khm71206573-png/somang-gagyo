import Image from "next/image";
import { Play } from "lucide-react";
import type { PastSong } from "@/lib/mock-data";

interface PastSongsScrollProps {
  songs: PastSong[];
}

export function PastSongsScroll({ songs }: PastSongsScrollProps) {
  return (
    <section className="pb-8 pt-4">
      <h3 className="mb-4 px-2 text-title-lg text-foreground">지난 찬양</h3>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {songs.map((song, index) => {
          const className =
            index === songs.length - 1
              ? "group flex w-32 shrink-0 snap-start flex-col gap-2 pr-4"
              : "group flex w-32 shrink-0 snap-start flex-col gap-2";

          const cover = (
            <>
              <div className="relative h-32 w-32 overflow-hidden rounded-md border border-outline-variant/20 shadow-sm">
                <Image
                  src={song.coverImageUrl}
                  alt={song.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {song.youtubeUrl && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <Play className="h-7 w-7 text-white" fill="currentColor" />
                  </span>
                )}
              </div>
              <p className="truncate text-label-sm text-foreground transition-colors group-hover:text-primary">
                {song.title}
              </p>
            </>
          );

          // 유튜브 주소가 있는 곡은 눌러서 바로 들을 수 있다.
          return song.youtubeUrl ? (
            <a
              key={song.id}
              href={song.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${song.title} 유튜브로 듣기`}
              className={`${className} transition-transform active:scale-95`}
            >
              {cover}
            </a>
          ) : (
            <div key={song.id} className={className}>
              {cover}
            </div>
          );
        })}
      </div>
    </section>
  );
}
