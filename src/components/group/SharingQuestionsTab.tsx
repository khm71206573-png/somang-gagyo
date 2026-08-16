import { NotebookPen } from "lucide-react";
import type { SharingQuestion } from "@/lib/mock-data";

interface SharingQuestionsTabProps {
  questions: SharingQuestion[];
}

export function SharingQuestionsTab({ questions }: SharingQuestionsTabProps) {
  return (
    <section className="space-y-stack-md">
      {questions.map((question) => (
        <div
          key={question.id}
          className="rounded-lg border border-outline-variant/30 bg-card p-5 shadow-[0px_4px_20px_rgba(44,44,44,0.04)]"
        >
          <div className="mb-3 flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-label-sm font-bold">{question.id}</span>
            </div>
            <h3 className="text-body-lg text-foreground">
              {question.question}
            </h3>
          </div>
          <div className="mt-4 border-t border-surface-container-highest pt-4">
            <div className="mb-2 flex items-center gap-2 text-tertiary">
              <NotebookPen className="h-[18px] w-[18px]" />
              <span className="text-label-sm">생각 메모</span>
            </div>
            <textarea
              placeholder="나눔을 위한 메모를 남겨보세요..."
              className="h-20 w-full resize-none rounded-md border-none bg-surface-container-low p-3 text-body-md text-foreground placeholder:text-outline focus:bg-card focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      ))}
    </section>
  );
}
