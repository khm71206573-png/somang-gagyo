"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListMusic, Music, PlayCircle } from "lucide-react";
import type { SongInfo } from "@/lib/mock-data";
import type { DashboardPraiseSet } from "@/lib/supabase/queries/dashboard";

interface SongCardProps {
  song: SongInfo | null;
  /**
   * 예전 모양의 영속 캐시가 복원되면 이 값이 통째로 없을 수 있다.
   * 홈 화면이 통째로 멈추지 않도록 없으면 "아직 등록 전"으로 다룬다.
   */
  praiseSet?: DashboardPraiseSet | null;
}

/** 찬양콘티와 추천찬양이 번갈아 나오는 간격 */
const ROTATION_INTERVAL_MS = 4000;

export function SongCard({ song, praiseSet = null }: SongCardProps) {
  const [index, setIndex] = useState(0);

  // 4초에 한 번씩 찬양콘티 ↔ 추천찬양을 번갈아 보여준다.
  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % 2),
      ROTATION_INTERVAL_MS,
    );

    return () => window.clearInterval(timer);
  }, []);

  const isPraiseSlide = index === 0;

  // 누르면 찬양 탭의 해당 메뉴로 바로 열린다.
  const href = isPraiseSlide ? "/song?tab=praiseSet" : "/song?tab=recommended";
  const label = isPraiseSlide ? "주일 찬양콘티" : "추천찬양";
  const title = isPraiseSlide
    ? praiseSet
      ? praiseSet.isUpcoming
        ? "다가오는 주일 콘티"
        : "지난 주일 콘티"
      : "찬양콘티"
    : (song?.title ?? "오늘의 찬양");
  const subtitle = isPraiseSlide
    ? praiseSet
      ? `${praiseSet.sundayLabel} · ${praiseSet.itemCount}개`
      : "아직 등록 전이에요"
    : song
      ? song.artist
      : "아직 등록 전이에요";
  const coverImageUrl = isPraiseSlide
    ? (praiseSet?.coverImageUrl ?? null)
    : (song?.coverImageUrl ?? null);

  return (
    <Link
      href={href}
      className="flex cursor-pointer flex-col justify-between rounded-md border border-border bg-card p-4 shadow-[0_4px_20px_-4px_rgba(44,44,44,0.04)] transition-transform duration-200 active:scale-[0.98]"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-surface-container-low">
        {coverImageUrl ? (
          <>
            {/* 콘티 사진·유튜브 썸네일은 도메인이 제각각이라 next/image를 쓰지 않는다. */}
            {isPraiseSlide ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={coverImageUrl}
                alt={label}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={coverImageUrl}
                alt={title}
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              {isPraiseSlide ? (
                <ListMusic className="h-8 w-8 text-white" />
              ) : (
                <PlayCircle className="h-8 w-8 text-white" fill="currentColor" />
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {isPraiseSlide ? (
              <ListMusic className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Music className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        )}
      </div>
      {/* key가 바뀌면 새로 마운트돼 다음 내용이 부드럽게 나타난다. */}
      <div key={label} className="animate-in fade-in duration-500">
        <p className="text-[11px] font-semibold text-primary">{label}</p>
        <h4 className="truncate text-body-md font-semibold text-foreground">
          {title}
        </h4>
        <p className="truncate text-label-sm text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}
