"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import {
  DevotionFormFields,
  emptyDevotionFormValues,
  type DevotionFormValues,
} from "@/components/admin/DevotionFormFields";
import { errorText, submitButton } from "@/components/admin/adminFormStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useDevotion } from "@/hooks/useDevotion";
import { useUpdateDevotion } from "@/hooks/useUpdateDevotion";
import { useGenerateDevotionQuestions } from "@/hooks/useGenerateDevotionQuestions";
import { arrayToLines, versesToLines } from "@/lib/adminFormParsing";
import { commentaryToText, footnotesToText } from "@/lib/devotionQtParsing";
import {
  devotionSourceLabels,
  toDevotionSource,
  type DevotionSource,
} from "@/lib/devotionSource";

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

  const [source, setSource] = useState<DevotionSource>("daily_bible");
  const [values, setValues] = useState<DevotionFormValues>(() =>
    emptyDevotionFormValues(""),
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;

    setSource(toDevotionSource(data.source));
    setValues({
      devotionDate: data.devotion_date,
      tag: data.tag ?? "",
      title: data.title,
      reference: data.reference,
      // 절 번호를 함께 보여줘야 저장할 때 번호가 1부터 다시 매겨지지 않는다.
      verses: versesToLines(data.verses),
      questions: arrayToLines(data.questions.map((q) => q.question)),
      hymn: data.hymn ?? "",
      commentary: commentaryToText(data.commentary ?? []),
      prayer: data.prayer ?? "",
      practice: data.practice ?? "",
      footnotes: footnotesToText(data.footnotes ?? []),
      pageLabel: data.page_label ?? "",
    });
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

  const photoUrls = data.image_urls ?? [];

  function patch(next: Partial<DevotionFormValues>) {
    setValues((current) => ({ ...current, ...next }));
  }

  async function handleGenerateQuestions() {
    setFormError(null);
    if (!values.reference.trim() || !values.verses.trim()) {
      setFormError("본문 구절과 말씀 내용을 먼저 입력해주세요.");
      return;
    }
    try {
      const generated = await generateQuestions({
        reference: values.reference,
        verses: values.verses,
      });
      patch({ questions: generated.join("\n") });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "묵상 질문 생성에 실패했어요.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!values.title.trim() || !values.reference.trim() || !values.verses.trim()) {
      setFormError("제목, 본문 구절, 말씀 내용을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({
        id,
        ...values,
        source,
        // 사진은 등록할 때 올린 것을 그대로 둔다.
        imageUrls: data?.image_urls ?? [],
      });
      router.push("/admin/devotion");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "수정에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="묵상 수정" listHref="/admin/devotion" />
      <main className="px-margin-main pt-stack-sm">
        <p className="mb-stack-md text-label-sm text-muted-foreground">
          출처 · {devotionSourceLabels[source]}
        </p>

        {photoUrls.length > 0 && (
          <section className="mb-stack-md flex flex-col gap-stack-sm rounded-md border border-outline-variant/40 bg-surface-container-low p-4">
            <p className="text-label-sm text-muted-foreground">
              등록할 때 쓴 사진이에요. 눌러서 크게 보고 아래 내용과 대조해주세요.
            </p>
            <ul className="flex gap-2 overflow-x-auto pb-1">
              {photoUrls.map((url) => (
                <li key={url} className="shrink-0">
                  <a href={url} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="QT 지면 사진"
                      className="h-28 w-24 rounded-md border border-outline-variant/40 object-cover"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <DevotionFormFields
            source={source}
            values={values}
            onChange={patch}
            onGenerateQuestions={handleGenerateQuestions}
            isGeneratingQuestions={isGenerating}
          />

          {formError && <p className={errorText}>{formError}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "수정 중..." : "수정하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
