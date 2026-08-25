"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Send, Trash2 } from "lucide-react";
import { useCreateAnnouncementComment } from "@/hooks/useCreateAnnouncementComment";
import { useDeleteAnnouncementComment } from "@/hooks/useDeleteAnnouncementComment";
import { useIsAdmin } from "@/hooks/useProfile";
import type { AnnouncementCommentItem } from "@/lib/supabase/queries/announcement";

interface AnnouncementCommentsProps {
  announcementId: string;
  comments: AnnouncementCommentItem[];
}

export function AnnouncementComments({
  announcementId,
  comments,
}: AnnouncementCommentsProps) {
  const isAdmin = useIsAdmin();
  const { mutateAsync, isPending } = useCreateAnnouncementComment();
  const {
    mutate: deleteComment,
    isPending: isDeleting,
    variables: deletingId,
  } = useDeleteAnnouncementComment();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ announcementId, content });
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "댓글을 남기지 못했어요.");
    }
  }

  return (
    <section className="flex flex-col gap-stack-sm">
      <h2 className="text-title-lg text-foreground">댓글 {comments.length}</h2>

      {comments.length === 0 ? (
        <p className="rounded-lg border border-outline-variant/40 bg-card p-4 text-center text-label-sm text-muted-foreground">
          아직 댓글이 없어요. 먼저 의견을 남겨보세요.
        </p>
      ) : (
        <div className="flex flex-col gap-gutter-card">
          {comments.map((comment) => (
            <article
              key={comment.id}
              className="flex gap-3 rounded-lg border border-outline-variant/20 bg-card p-4"
            >
              <Image
                src={comment.avatarUrl}
                alt={comment.author}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-full bg-surface-container object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-label-sm font-semibold text-foreground">
                    {comment.author}
                    <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                      {comment.timeAgo}
                    </span>
                  </p>
                  {(comment.isMine || isAdmin) && (
                    <button
                      type="button"
                      aria-label="댓글 삭제"
                      disabled={isDeleting && deletingId === comment.id}
                      onClick={() => {
                        if (window.confirm("이 댓글을 삭제할까요?")) {
                          deleteComment(comment.id);
                        }
                      }}
                      className="shrink-0 text-outline transition-colors hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-body-md leading-relaxed text-foreground">
                  {comment.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="댓글을 남겨주세요."
            aria-label="댓글 입력"
            className="min-w-0 flex-1 resize-none rounded-md border border-border bg-card px-4 py-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            aria-label="댓글 등록"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        {error && <p className="text-label-sm text-destructive">{error}</p>}
      </form>
    </section>
  );
}
