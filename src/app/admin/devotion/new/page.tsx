"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch(next: Partial<DevotionFormValues>) {
    setValues((current) => ({ ...current, ...next }));
  }

  // 사진에서 읽은 값으로 입력칸을 채우기만 한다. 저장은 사람이 확인한 뒤에 한다.
  async function handleReadPhotos(files: File[]) {
    setError(null);
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
      await mutateAsync({ ...values, imageUrls });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
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

        {notice && (
          <p className="mb-stack-md rounded-md bg-warning-container px-4 py-3 text-label-sm text-warning-container-foreground">
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <DevotionFormFields
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
