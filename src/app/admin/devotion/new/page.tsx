"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import {
  DevotionFormFields,
  emptyDevotionFormValues,
  type DevotionFormValues,
} from "@/components/admin/DevotionFormFields";
import { DevotionPhotoPicker } from "@/components/admin/DevotionPhotoPicker";
import { errorText, submitButton } from "@/components/admin/adminFormStyles";
import { useCreateDevotion } from "@/hooks/useCreateDevotion";
import { useGenerateDevotionQuestions } from "@/hooks/useGenerateDevotionQuestions";
import { useFetchDevotionSource } from "@/hooks/useFetchDevotionSource";
import { useOcrDevotionPhoto } from "@/hooks/useOcrDevotionPhoto";
import {
  DEVOTION_SOURCES,
  devotionSourceLabels,
  type DevotionSource,
} from "@/lib/devotionSource";
import { toDateString } from "@/lib/supabase/queries/utils";

/** 한 편이 두 페이지라 보통 2장, 넉넉히 4장까지 받는다. */
const MAX_PHOTOS = 4;

export default function NewDevotionPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateDevotion();
  const { mutateAsync: generateQuestions, isPending: isGenerating } =
    useGenerateDevotionQuestions();
  const { mutateAsync: fetchSource, isPending: isFetchingSource } =
    useFetchDevotionSource();
  const { mutateAsync: readPhotos, isPending: isReadingPhotos } =
    useOcrDevotionPhoto();

  const [source, setSource] = useState<DevotionSource>("daily_bible");
  const [values, setValues] = useState<DevotionFormValues>(() =>
    emptyDevotionFormValues(toDateString(new Date())),
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch(next: Partial<DevotionFormValues>) {
    setValues((current) => ({ ...current, ...next }));
  }

  // 본문만 가져와 채운다. 묵상 질문은 아래 "AI로 질문 만들기"를
  // 눌렀을 때만 만들고, 비워두면 기본 질문으로 나간다.
  async function handleFetchSource() {
    setError(null);
    setNotice(null);
    try {
      const fetched = await fetchSource();
      patch({
        devotionDate: fetched.devotionDate,
        tag: "매일성경",
        title: fetched.title,
        reference: fetched.reference,
        verses: fetched.verses.join("\n"),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오늘의 묵상을 가져오지 못했어요.");
    }
  }

  // 사진에서 읽은 값으로 입력칸을 채우기만 한다. 저장은 사람이 확인한 뒤에 한다.
  async function handleReadPhotos(files: File[]) {
    setError(null);
    setNotice(null);
    try {
      const read = await readPhotos(files);
      patch({
        devotionDate: read.devotionDate,
        tag: devotionSourceLabels.kingdom_qt,
        title: read.title,
        reference: read.reference,
        hymn: read.hymn,
        verses: read.verses.join("\n"),
        questions: read.questions.join("\n"),
        commentary: read.commentary,
        prayer: read.prayer,
        practice: read.practice,
        footnotes: read.footnotes,
        pageLabel: read.pageLabel,
      });
      setImageUrls(read.imageUrls);
      setNotice(
        read.warning ??
          "사진에서 읽어왔어요. 저장하기 전에 사진과 한 번 대조해주세요.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "사진을 읽지 못했어요.");
    }
  }

  async function handleGenerateQuestions() {
    setError(null);
    if (!values.reference.trim() || !values.verses.trim()) {
      setError("본문 구절과 말씀 내용을 먼저 입력해주세요.");
      return;
    }
    try {
      const generated = await generateQuestions({
        reference: values.reference,
        verses: values.verses,
      });
      patch({ questions: generated.join("\n") });
    } catch (err) {
      setError(err instanceof Error ? err.message : "묵상 질문 생성에 실패했어요.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!values.title.trim() || !values.reference.trim() || !values.verses.trim()) {
      setError("제목, 본문 구절, 말씀 내용을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ ...values, source, imageUrls });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="묵상 등록" listHref="/admin/devotion" />
      <main className="px-margin-main pt-stack-sm">
        <nav className="mb-stack-md flex border-b border-outline-variant/30">
          {DEVOTION_SOURCES.map((id) => {
            const isActive = id === source;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSource(id)}
                className={
                  isActive
                    ? "relative flex-1 pb-3 text-center text-body-lg font-semibold text-primary"
                    : "relative flex-1 pb-3 text-center text-body-lg text-muted-foreground transition-colors hover:text-primary"
                }
              >
                {devotionSourceLabels[id]}
                {isActive && (
                  <div className="absolute -bottom-px left-0 h-[2px] w-full rounded-t-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>

        {source === "daily_bible" ? (
          <button
            type="button"
            onClick={handleFetchSource}
            disabled={isFetchingSource}
            className="mb-stack-md flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isFetchingSource ? "가져오는 중..." : "오늘의 묵상 본문 가져오기"}
          </button>
        ) : (
          <DevotionPhotoPicker
            maxPhotos={MAX_PHOTOS}
            isReading={isReadingPhotos}
            onRead={handleReadPhotos}
          />
        )}

        {notice && (
          <p className="mb-stack-md rounded-md bg-warning-container px-4 py-3 text-label-sm text-warning-container-foreground">
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <DevotionFormFields
            source={source}
            values={values}
            onChange={patch}
            onGenerateQuestions={handleGenerateQuestions}
            isGeneratingQuestions={isGenerating}
          />

          {error && <p className={errorText}>{error}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "등록 중..." : "묵상 등록하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
