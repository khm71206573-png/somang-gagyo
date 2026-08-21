import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import type { SermonSummary } from "@/lib/mock-data";
import { useIsAdmin } from "@/hooks/useProfile";

interface SermonSummaryTabProps {
  summary: SermonSummary | null;
  sermonId: string | null;
}

export function SermonSummaryTab({ summary, sermonId }: SermonSummaryTabProps) {
  const isAdmin = useIsAdmin();

  if (!summary) {
    return (
      <section className="flex flex-col items-center gap-3 py-stack-lg">
        <p className="text-center text-body-md text-muted-foreground">
          등록된 설교요약이 아직 없어요.
        </p>
        {isAdmin && (
          <Link
            href="/admin/sermon/new"
            className="flex items-center gap-1.5 rounded-md border border-primary px-4 py-2 text-label-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
            설교요약 작성하기
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-stack-md">
      <div className="flex flex-col gap-4 rounded-lg border border-outline-variant/30 bg-card p-5 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            {summary.categoryLabel && (
              <span className="mb-1 inline-block rounded-sm bg-primary/10 px-2 py-1 text-label-sm text-primary">
                {summary.categoryLabel}
              </span>
            )}
            <h3 className="text-title-lg text-foreground">{summary.title}</h3>
            {summary.preacher && (
              <p className="mt-0.5 text-label-sm text-muted-foreground">
                {summary.preacher} 목사
              </p>
            )}
          </div>
          {isAdmin && sermonId && (
            <Link
              href={`/admin/sermon/${sermonId}`}
              aria-label="설교요약 수정"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-muted-foreground transition-colors hover:bg-surface-dim"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
        </div>

        {summary.quote && (
          <blockquote className="border-l-2 border-primary/40 pl-3 text-body-md italic text-foreground">
            {summary.quote}
          </blockquote>
        )}

        {summary.paragraphs.length > 0 && (
          <div className="flex flex-col gap-3">
            {summary.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-body-md leading-relaxed text-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>

      {summary.sharingQuestions.length > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border border-outline-variant/30 bg-card p-5 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]">
          <h4 className="text-body-lg font-semibold text-foreground">
            함께 나눌 질문
          </h4>
          <ol className="flex flex-col gap-2">
            {summary.sharingQuestions.map((item) => (
              <li key={item.id} className="flex gap-2 text-body-md text-foreground">
                <span className="shrink-0 font-semibold text-primary">
                  {item.id}.
                </span>
                <span>{item.question}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
