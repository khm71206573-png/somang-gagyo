"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import {
  fieldGroup,
  fieldInput,
  fieldLabel,
  fieldTextarea,
  errorText,
  submitButton,
} from "@/components/admin/adminFormStyles";
import { useCreateDevotion } from "@/hooks/useCreateDevotion";
import { useGenerateDevotionQuestions } from "@/hooks/useGenerateDevotionQuestions";
import { useFetchDevotionSource } from "@/hooks/useFetchDevotionSource";
import { toDateString } from "@/lib/supabase/queries/utils";

export default function NewDevotionPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateDevotion();
  const { mutateAsync: generateQuestions, isPending: isGenerating } =
    useGenerateDevotionQuestions();
  const { mutateAsync: fetchSource, isPending: isFetchingSource } =
    useFetchDevotionSource();

  const [devotionDate, setDevotionDate] = useState(toDateString(new Date()));
  const [tag, setTag] = useState("");
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [verses, setVerses] = useState("");
  const [questions, setQuestions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  async function handleFetchSource() {
    setError(null);
    setIsAutoFilling(true);
    try {
      const source = await fetchSource();
      setDevotionDate(source.devotionDate);
      setTag("매일성경");
      setTitle(source.title);
      setReference(source.reference);
      const versesText = source.verses.join("\n");
      setVerses(versesText);

      try {
        const generated = await generateQuestions({
          reference: source.reference,
          verses: versesText,
        });
        setQuestions(generated.join("\n"));
      } catch (err) {
        setError(
          err instanceof Error
            ? `본문은 가져왔지만 질문 자동 생성에 실패했어요: ${err.message}`
            : "본문은 가져왔지만 질문 자동 생성에 실패했어요.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오늘의 묵상을 가져오지 못했어요.");
    } finally {
      setIsAutoFilling(false);
    }
  }

  async function handleGenerateQuestions() {
    setError(null);
    if (!reference.trim() || !verses.trim()) {
      setError("본문 구절과 말씀 내용을 먼저 입력해주세요.");
      return;
    }
    try {
      const generated = await generateQuestions({ reference, verses });
      setQuestions(generated.join("\n"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "묵상 질문 생성에 실패했어요.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !reference.trim() || !verses.trim()) {
      setError("제목, 본문 구절, 말씀 내용을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ devotionDate, tag, title, reference, verses, questions });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="묵상 등록" listHref="/admin/devotion" />
      <main className="px-margin-main pt-stack-sm">
        <button
          type="button"
          onClick={handleFetchSource}
          disabled={isAutoFilling}
          className="mb-stack-md flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {isAutoFilling
            ? isFetchingSource
              ? "가져오는 중..."
              : "질문 생성 중..."
            : "오늘의 묵상 가져와서 자동 입력"}
        </button>

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
                {isGenerating ? "생성 중..." : "AI로 질문 자동 생성"}
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

          {error && <p className={errorText}>{error}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "등록 중..." : "묵상 등록하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
