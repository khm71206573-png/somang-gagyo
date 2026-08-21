import Image from "next/image";
import Link from "next/link";
import { Music, PlayCircle } from "lucide-react";
import type { SongInfo } from "@/lib/mock-data";

interface SongCardProps {
  song: SongInfo | null;
}

export function SongCard({ song }: SongCardProps) {
  // 표지 이미지가 없는 찬양도 있어서 이미지 유무를 따로 확인한다.
  const coverImageUrl = song?.coverImageUrl ? song.coverImageUrl : null;

  return (
    <Link
      href="/song"
      className="flex cursor-pointer flex-col justify-between rounded-md border border-border bg-card p-4 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)] transition-transform duration-200 active:scale-[0.98]"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-surface-container-low">
        {coverImageUrl ? (
          <>
            <Image
              src={coverImageUrl}
              alt={song?.title ?? ""}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <PlayCircle className="h-8 w-8 text-white" fill="currentColor" />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Music className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div>
        <h4 className="truncate text-body-md font-semibold text-foreground">
          {song?.title ?? "오늘의 찬양"}
        </h4>
        <p className="truncate text-label-sm text-muted-foreground">
          {song ? song.artist : "아직 등록 전이에요"}
        </p>
      </div>
    </Link>
  );
}
