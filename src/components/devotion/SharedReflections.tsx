"use client";

import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import type { SharedReflection } from "@/lib/mock-data";
import { useDeleteDevotionNote } from "@/hooks/useDeleteDevotionNote";

interface SharedReflectionsProps {
  reflections: SharedReflection[];
  participantCount: number;
}

export function SharedReflections({
  reflections,
  participantCount,
}: SharedReflectionsProps) {
  const { mutate: deleteNote, isPending, variables: deletingId } =
    useDeleteDevotionNote();

  return (
    <section className="mb-8 flex flex-col gap-stack-md">
      <div className="flex items-end justify-between">
        <h3 className="text-title-lg text-foreground">함께한 나눔</h3>
        <span className="text-label-sm text-primary">
          {participantCount}명 참여
        </span>
      </div>
      <div className="flex flex-col gap-gutter-card">
        {reflections.map((reflection) => (
          <article
            key={reflection.id}
            className="rounded-lg border border-outline/15 bg-card p-4 shadow-[0_2px_10px_rgba(44,44,44,0.04)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {reflection.avatarUrl ? (
                  <Image
                    src={reflection.avatarUrl}
                    alt={reflection.author}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full bg-surface-container-highest object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-tertiary-container font-bold text-tertiary-container-foreground">
                    {reflection.author.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-label-sm font-semibold text-foreground">
                    {reflection.author}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {reflection.timeAgo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={reflection.isLiked ? "좋아요 취소" : "좋아요"}
                  className={
                    reflection.isLiked
                      ? "text-primary"
                      : "text-outline transition-colors hover:text-primary"
                  }
                >
                  <Heart
                    className="h-5 w-5"
                    fill={reflection.isLiked ? "currentColor" : "none"}
                  />
                </button>
                {reflection.isMine && (
                  <button
                    type="button"
                    aria-label="나눔 삭제"
                    disabled={isPending && deletingId === reflection.id}
                    onClick={() => {
                      if (window.confirm("이 나눔을 삭제할까요?")) {
                        deleteNote(reflection.id);
                      }
                    }}
                    className="text-outline transition-colors hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-body-md text-foreground">
              {reflection.content}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
