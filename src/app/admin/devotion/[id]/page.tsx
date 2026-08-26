"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import {
  fieldGroup,
  fieldInput,
  fieldLabel,
  fieldTextarea,
  errorText,
  submitButton,
} from "@/components/admin/adminFormStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useDevotion } from "@/hooks/useDevotion";
import { useUpdateDevotion } from "@/hooks/useUpdateDevotion";
import { useGenerateDevotionQuestions } from "@/hooks/useGenerateDevotionQuestions";
import { arrayToLines } from "@/lib/adminFormParsing";

export default function EditDevotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } = useDevotion(id);
  const { mutateAsync, isPending } = useUpdateDevotion();
  const { mutateAsync: generateQuestions, isPending: isGenerating } =
    useGenerateDevotionQuestions();

  const [devotionDate, setDevotionDate] = useState("");
  const [tag, setTag] = useState("");
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [verses, setVerses] = useState("");
  const [questions, setQuestions] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setDevotionDate(data.devotion_date);
    setTag(data.tag ?? "");
    setTitle(data.title);
    setReference(data.reference);
    setVerses(arrayToLines(data.verses.map((verse) => verse.text)));
    setQuestions(arrayToLines(data.questions.map((q) => q.question)));
  }, [data]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  async function handleGenerateQuestions() {
    setFormError(null);
    if (!reference.trim() || !verses.trim()) {
      setFormError("본문 구절과 말씀 내용을 먼저 입력해주세요.");
      return;
    }
    try {
      const generated = await generateQuestions({ reference, verses });
      setQuestions(generated.join("\n"));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "묵상 질문 생성에 실패했어요.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!title.trim() || !reference.trim() || !verses.trim()) {
      setFormError("제목, 본문 구절, 말씀 내용을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ id, devotionDate, tag, title, reference, verses, questions });
      router.push("/admin/devotion");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "수정에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="묵상 수정" />
      <main className="px-margin-main pt-stack-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <div className={fieldGroup}>
            <label htmlFor="devotionDate" className={fieldLabel}>
              날짜 <span className="text-destructive">*</span>
            </label>
            <input
              id="devotionDate"
              type="date"
              value={devotionDate}
              onChange={(event) => setDevotionDate(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="tag" className={fieldLabel}>
              태그 <span className="text-muted-foreground">(선택)</span>
            </label>
            <input
              id="tag"
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              placeholder="예: 오늘의 묵상"
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="title" className={fieldLabel}>
              제목 <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="묵상 제목"
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="reference" className={fieldLabel}>
              본문 구절 <span className="text-destructive">*</span>
            </label>
            <input
              id="reference"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="예: 요한복음 3:16"
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="verses" className={fieldLabel}>
              말씀 내용 <span className="text-destructive">*</span>
              <span className="ml-1 text-muted-foreground">(한 줄에 한 절씩)</span>
            </label>
            <textarea
              id="verses"
              rows={6}
              value={verses}
              onChange={(event) => setVerses(event.target.value)}
              placeholder={"하나님이 세상을 이처럼 사랑하사...\n이는 그를 믿는 자마다..."}
              className={fieldTextarea}
            />
          </div>

          <div className={fieldGroup}>
            <div className="flex items-center justify-between">
              <label htmlFor="questions" className={fieldLabel}>
                묵상 질문 <span className="text-muted-foreground">(선택, 한 줄에 하나씩)</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={isGenerating}
                className="text-label-sm font-medium text-primary disabled:opacity-50"
              >
                {isGenerating ? "생성 중..." : "AI로 질문 만들기"}
              </button>
            </div>
            <textarea
              id="questions"
              rows={4}
              value={questions}
              onChange={(event) => setQuestions(event.target.value)}
              placeholder={
                "오늘 본문에서 하나님은 어떤 분으로 묘사되고 있나요?\n이 말씀이 지금 내 삶과 어떻게 연결되나요?\n오늘 하루 실천하고 싶은 것은 무엇인가요?"
              }
              className={fieldTextarea}
            />
          </div>

          {formError && <p className={errorText}>{formError}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "수정 중..." : "묵상 수정하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
