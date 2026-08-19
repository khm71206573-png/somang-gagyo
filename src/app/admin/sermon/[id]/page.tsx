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
import { useSermon } from "@/hooks/useSermon";
import { useUpdateSermon } from "@/hooks/useUpdateSermon";
import { arrayToLines, linesToBlocks } from "@/lib/adminFormParsing";

export default function EditSermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } = useSermon(id);
  const { mutateAsync, isPending } = useUpdateSermon();

  const [sermonDate, setSermonDate] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [preacher, setPreacher] = useState("");
  const [quote, setQuote] = useState("");
  const [summaryParagraphs, setSummaryParagraphs] = useState("");
  const [sharingQuestions, setSharingQuestions] = useState("");
  const [sermonSongs, setSermonSongs] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setSermonDate(data.sermon_date);
    setCategoryLabel(data.category_label ?? "");
    setTitle(data.title);
    setReference(data.reference ?? "");
    setPreacher(data.preacher ?? "");
    setQuote(data.quote ?? "");
    setSummaryParagraphs(
      linesToBlocks(data.summary_paragraphs.map((paragraph) => [paragraph])),
    );
    setSharingQuestions(
      arrayToLines(data.sharing_questions.map((item) => item.question)),
    );
    setSermonSongs(
      arrayToLines(
        data.sermonSongs.map((song) =>
          song.musical_key ? `${song.title} | ${song.musical_key}` : song.title,
        ),
      ),
    );
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("설교 제목을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({
        id,
        sermonDate,
        categoryLabel,
        title,
        reference,
        preacher,
        quote,
        summaryParagraphs,
        sharingQuestions,
        sermonSongs,
      });
      router.push("/admin/sermon");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "수정에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="설교 수정" />
      <main className="px-margin-main pt-stack-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <div className={fieldGroup}>
            <label htmlFor="sermonDate" className={fieldLabel}>
              날짜 <span className="text-destructive">*</span>
            </label>
            <input
              id="sermonDate"
              type="date"
              value={sermonDate}
              onChange={(event) => setSermonDate(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="categoryLabel" className={fieldLabel}>
              구분 <span className="text-muted-foreground">(선택, 예: 가교모임)</span>
            </label>
            <input
              id="categoryLabel"
              value={categoryLabel}
              onChange={(event) => setCategoryLabel(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="title" className={fieldLabel}>
              설교 제목 <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="reference" className={fieldLabel}>
              본문 구절 <span className="text-muted-foreground">(선택)</span>
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
            <label htmlFor="preacher" className={fieldLabel}>
              설교자 <span className="text-muted-foreground">(선택)</span>
            </label>
            <input
              id="preacher"
              value={preacher}
              onChange={(event) => setPreacher(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="quote" className={fieldLabel}>
              한 줄 요약 <span className="text-muted-foreground">(선택)</span>
            </label>
            <textarea
              id="quote"
              rows={2}
              value={quote}
              onChange={(event) => setQuote(event.target.value)}
              className={fieldTextarea}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="summaryParagraphs" className={fieldLabel}>
              설교 요약 <span className="text-muted-foreground">(선택, 문단은 빈 줄로 구분)</span>
            </label>
            <textarea
              id="summaryParagraphs"
              rows={6}
              value={summaryParagraphs}
              onChange={(event) => setSummaryParagraphs(event.target.value)}
              placeholder={"첫 번째 문단\n\n두 번째 문단"}
              className={fieldTextarea}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="sharingQuestions" className={fieldLabel}>
              나눔 질문 <span className="text-muted-foreground">(선택, 한 줄에 하나씩)</span>
            </label>
            <textarea
              id="sharingQuestions"
              rows={4}
              value={sharingQuestions}
              onChange={(event) => setSharingQuestions(event.target.value)}
              placeholder={"이번 주 나에게 가장 와닿은 부분은?\n삶에 어떻게 적용할 수 있을까요?"}
              className={fieldTextarea}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="sermonSongs" className={fieldLabel}>
              찬양 악보 <span className="text-muted-foreground">(선택, 한 줄에 &quot;제목 | 키&quot;)</span>
            </label>
            <textarea
              id="sermonSongs"
              rows={4}
              value={sermonSongs}
              onChange={(event) => setSermonSongs(event.target.value)}
              placeholder={"주 은혜임을 | G\n놀라운 은혜 | D"}
              className={fieldTextarea}
            />
          </div>

          {formError && <p className={errorText}>{formError}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "수정 중..." : "설교 수정하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
