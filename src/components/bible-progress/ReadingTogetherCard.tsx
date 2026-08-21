"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import type { ReadingTogether } from "@/lib/mock-data";
import { useSendCheer } from "@/hooks/useSendCheer";

interface ReadingTogetherCardProps {
  data: ReadingTogether;
}

export function ReadingTogetherCard({ data }: ReadingTogetherCardProps) {
  const { mutate: sendCheer, isPending, error } = useSendCheer();
  const alreadyCheered = data.hasCheeredToday;

  return (
    <section className="flex flex-col gap-stack-md">
      <div className="flex items-end justify-between">
        <h3 className="text-title-lg text-foreground">
          같은 플랜을 읽는 사람들
        </h3>
        <button
          type="button"
          disabled={isPending || alreadyCheered}
          onClick={() => sendCheer()}
          className={
            alreadyCheered
              ? "flex items-center gap-1 text-label-sm text-muted-foreground"
              : "flex items-center gap-1 text-label-sm text-primary transition-transform hover:underline active:scale-95 disabled:opacity-60"
          }
        >
          {isPending ? "보내는 중..." : alreadyCheered ? "응원 보냄" : data.ctaLabel}
          <Heart
            className="h-3.5 w-3.5"
            fill={alreadyCheered ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div className="flex items-center gap-4 rounded-lg border border-surface-dim bg-surface-bright p-4 shadow-[0_4px_20px_-2px_rgba(44,44,44,0.04)]">
        <div className="flex -space-x-2">
          {data.avatarUrls.map((url) => (
            <Image
              key={url}
              src={url}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border-2 border-surface-bright object-cover"
            />
          ))}
          <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-bright bg-surface-container-highest">
            <span className="text-[10px] text-muted-foreground">
              +{data.extraCount}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="text-label-sm text-foreground">{data.message}</p>
          {data.cheerCount > 0 && (
            <p className="text-label-sm text-muted-foreground">
              오늘 {data.cheerCount}명이 응원을 보냈어요
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-label-sm text-destructive">
          {error instanceof Error ? error.message : "응원을 보내지 못했어요."}
        </p>
      )}
    </section>
  );
}
