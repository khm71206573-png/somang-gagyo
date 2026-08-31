"use client";

import { Check } from "lucide-react";
import type { DevotionFormValues } from "@/components/admin/DevotionFormFields";
import { linesToArray } from "@/lib/adminFormParsing";
import { textToCommentary, textToFootnotes } from "@/lib/devotionQtParsing";
import { formatDateLabel } from "@/lib/supabase/queries/utils";

interface DevotionOcrSummaryProps {
  values: DevotionFormValues;
}

/** 묵상 탭 화면과 같은 표기를 쓴다. ("2026년 8월 31일 월요일") */
function dateLabelOf(devotionDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(devotionDate)) return devotionDate;
  return formatDateLabel(new Date(`${devotionDate}T00:00:00`));
}

/**
 * 사진에서 읽어온 것을 한눈에 보여준다.
 * 아래 입력칸을 끝까지 훑지 않아도 무엇이 들어왔고 무엇이 비었는지 알 수 있게
 * 하려는 것. 값은 전부 아래 입력칸에서 고칠 수 있다.
 */
export function DevotionOcrSummary({ values }: DevotionOcrSummaryProps) {
  const verseCount = linesToArray(values.verses).length;
  const questionCount = linesToArray(values.questions).length;
  const commentaryCount = textToCommentary(values.commentary).length;
  const footnoteCount = textToFootnotes(values.footnotes).length;

  const counts = [
    { label: "말씀", value: verseCount, unit: "절" },
    { label: "질문", value: questionCount, unit: "개" },
    { label: "해설", value: commentaryCount, unit: "단락" },
    { label: "각주", value: footnoteCount, unit: "개" },
  ];

  return (
    <section className="mb-stack-md overflow-hidden rounded-md border border-outline-variant/40 bg-card">
      <header className="flex items-center gap-2 border-b border-outline-variant/30 px-4 py-3">
        <Check className="h-4 w-4 text-success" />
        <h2 className="text-body-md font-medium text-foreground">읽어온 내용</h2>
      </header>

      <dl className="flex flex-col gap-2 px-4 py-3">
        <div className="flex gap-3">
          <dt className="w-16 shrink-0 text-label-sm text-muted-foreground">날짜</dt>
          <dd className="text-label-sm text-foreground">
            {dateLabelOf(values.devotionDate)}
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-16 shrink-0 text-label-sm text-muted-foreground">제목</dt>
          <dd className="text-label-sm font-medium text-foreground">
            {values.title || <span className="text-destructive">못 읽었어요</span>}
          </dd>
        </div>
        <div className="flex gap-3">
          <dt className="w-16 shrink-0 text-label-sm text-muted-foreground">본문</dt>
          <dd className="text-label-sm text-foreground">
            {values.reference || <span className="text-destructive">못 읽었어요</span>}
          </dd>
        </div>
        {values.hymn && (
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-label-sm text-muted-foreground">찬송가</dt>
            <dd className="text-label-sm text-foreground">{values.hymn}</dd>
          </div>
        )}
      </dl>

      <ul className="flex border-t border-outline-variant/30">
        {counts.map((count) => (
          <li
            key={count.label}
            className="flex flex-1 flex-col items-center gap-0.5 border-r border-outline-variant/30 py-3 last:border-r-0"
          >
            <span className="text-label-sm text-muted-foreground">{count.label}</span>
            <span
              className={
                count.value > 0
                  ? "text-body-md font-semibold text-foreground"
                  : "text-body-md font-semibold text-muted-foreground"
              }
            >
              {count.value}
              {count.unit}
            </span>
          </li>
        ))}
      </ul>

      <p className="border-t border-outline-variant/30 px-4 py-3 text-label-sm text-muted-foreground">
        아래 칸에서 사진과 대조해 고친 뒤 등록해주세요.
      </p>
    </section>
  );
}
