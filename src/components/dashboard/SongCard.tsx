import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { SongInfo } from "@/lib/mock-data";

interface SongCardProps {
  song: SongInfo;
}

export function SongCard({ song }: SongCardProps) {
  return (
    <Link
      href="/song"
      className="flex cursor-pointer flex-col justify-between rounded-md border border-border bg-card p-4 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)] transition-transform duration-200 active:scale-[0.98]"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md">
        <Image
          src={song.coverImageUrl}
          alt={song.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <PlayCircle className="h-8 w-8 text-white" fill="currentColor" />
        </div>
      </div>
      <div>
        <h4 className="truncate text-body-md font-semibold text-foreground">
          {song.title}
        </h4>
        <p className="truncate text-label-sm text-muted-foreground">
          {song.artist}
        </p>
      </div>
    </Link>
  );
}
