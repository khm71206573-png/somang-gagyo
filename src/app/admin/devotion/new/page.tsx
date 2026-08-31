"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import {
  DevotionFormFields,
  emptyDevotionFormValues,
  type DevotionFormValues,
} from "@/components/admin/DevotionFormFields";
import { DevotionOcrSummary } from "@/components/admin/DevotionOcrSummary";
import { DevotionPhotoPicker } from "@/components/admin/DevotionPhotoPicker";
import { errorText, submitButton } from "@/components/admin/adminFormStyles";
import { useCreateDevotion } from "@/hooks/useCreateDevotion";
import { useGenerateDevotionQuestions } from "@/hooks/useGenerateDevotionQuestions";
import { useOcrDevotionPhoto } from "@/hooks/useOcrDevotionPhoto";
import { DEVOTION_SOURCE_LABEL } from "@/lib/devotionSource";
import { toDateString } from "@/lib/supabase/queries/utils";

/** 한 편이 두 페이지라 보통 2장, 넉넉히 4장까지 받는다. */
const MAX_PHOTOS = 4;

export default function NewDevotionPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateDevotion();
  const { mutateAsync: generateQuestions, isPending: isGenerating } =
    useGenerateDevotionQuestions();
  const { mutateAsync: readPhotos, isPending: isReadingPhotos } =
    useOcrDevotionPhoto();

  const [values, setValues] = useState<DevotionFormValues>(() =>
    emptyDevotionFormValues(toDateString(new Date())),
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  /** 사진을 한 번이라도 읽어냈는지. 읽은 내용 요약을 띄울지 정한다. */
  const [hasRead, setHasRead] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  /** 사진 읽기 오류는 사진 고르는 자리 옆에, 등록 오류는 등록 버튼 옆에 띄운다. */
  const [readError, setReadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function patch(next: Partial<DevotionFormValues>) {
    setValues((current) => ({ ...current, ...next }));
  }

  // 사진에서 읽은 값으로 입력칸을 채우기만 한다. 저장은 사람이 확인한 뒤에 한다.
  async function handleReadPhotos(files: File[]) {
    setReadError(null);
    setNotice(null);
    try {
      const read = await readPhotos(files);
      patch({
        devotionDate: read.devotionDate,
        tag: DEVOTION_SOURCE_LABEL,
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
      setHasRead(true);
      // 날짜가 오늘과 많이 다르거나 못 읽었을 때만 따로 알린다.
      // 잘 읽힌 경우는 아래 "읽어온 내용" 요약이 대신 말해준다.
      setNotice(read.warning);
    } catch (err) {
      setReadError(err instanceof Error ? err.message : "사진을 읽지 못했어요.");
    }
  }

  async function handleGenerateQuestions() {
    setSubmitError(null);
    if (!values.reference.trim() || !values.verses.trim()) {
      setSubmitError("본문 구절과 말씀 내용을 먼저 입력해주세요.");
      return;
    }
    try {
      const generated = await generateQuestions({
        reference: values.reference,
        verses: values.verses,
      });
      patch({ questions: generated.join("\n") });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "묵상 질문 생성에 실패했어요.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    if (!values.title.trim() || !values.reference.trim() || !values.verses.trim()) {
      setSubmitError("제목, 본문 구절, 말씀 내용을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ ...values, imageUrls });
      router.push("/admin");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "등록에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="묵상 등록" listHref="/admin/devotion" />
      <main className="px-margin-main pt-stack-sm">
        <DevotionPhotoPicker
          maxPhotos={MAX_PHOTOS}
          isReading={isReadingPhotos}
          onRead={handleReadPhotos}
        />

        {/* 날짜 경고는 요약보다 먼저 눈에 띄어야 한다. */}
        {notice && (
          <p className="mb-stack-md rounded-md bg-warning-container px-4 py-3 text-label-sm text-warning-container-foreground">
            {notice}
          </p>
        )}

        {readError && (
          <p className="mb-stack-md rounded-md bg-destructive/10 px-4 py-3 text-label-sm text-destructive">
            {readError}
          </p>
        )}

        {hasRead && <DevotionOcrSummary values={values} />}

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <DevotionFormFields
            values={values}
            onChange={patch}
            onGenerateQuestions={handleGenerateQuestions}
            isGeneratingQuestions={isGenerating}
          />

          {submitError && <p className={errorText}>{submitError}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "등록 중..." : "묵상 등록하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
