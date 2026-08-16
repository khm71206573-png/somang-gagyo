import { Lightbulb } from "lucide-react";
import type { ReflectionQuestion } from "@/lib/mock-data";

interface ReflectionQuestionsProps {
  questions: ReflectionQuestion[];
}

export function ReflectionQuestions({ questions }: ReflectionQuestionsProps) {
  return (
    <section className="flex flex-col gap-stack-md">
      <h3 className="flex items-center gap-2 text-title-lg text-foreground">
        <Lightbulb className="h-5 w-5 text-secondary" />
        묵상 질문
      </h3>
      <div className="divide-y divide-outline-variant/30 rounded-lg bg-surface-container-low p-5">
        {questions.map((question) => (
          <div key={question.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-container text-sm font-bold text-success-container-foreground">
              {question.id}
            </span>
            <p className="pt-0.5 text-body-md text-foreground">
              {question.question}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
