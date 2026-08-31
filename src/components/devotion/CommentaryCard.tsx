import { BookOpenText } from "lucide-react";
import type { DevotionCommentarySection } from "@/lib/mock-data";

interface CommentaryCardProps {
  sections: DevotionCommentarySection[];
}

/** 하나님나라QT의 "하나님 나라 묵상하기" — 소제목별 해설 */
export function CommentaryCard({ sections }: CommentaryCardProps) {
  if (sections.length === 0) return null;

  return (
    <section className="flex flex-col gap-stack-md">
      <h3 className="flex items-center gap-2 text-title-lg text-foreground">
        <BookOpenText className="h-5 w-5 text-tertiary" />
        묵상
      </h3>
      <div className="flex flex-col gap-5 rounded-lg border border-outline/15 bg-card p-5 shadow-[0_2px_10px_rgba(44,44,44,0.04)]">
        {sections.map((section) => (
          <article key={section.heading} className="flex flex-col gap-2">
            <h4 className="text-body-lg font-semibold text-primary">
              {section.heading}
            </h4>
            {section.body.split("\n").map((paragraph, index) => (
              <p
                key={index}
                className="text-body-md leading-relaxed text-foreground"
              >
                {paragraph}
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
