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
import { useBulletin } from "@/hooks/useBulletin";
import { useUpdateBulletin } from "@/hooks/useUpdateBulletin";
import { arrayToLines } from "@/lib/adminFormParsing";

export default function EditBulletinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } = useBulletin(id);
  const { mutateAsync, isPending } = useUpdateBulletin();

  const [bulletinDate, setBulletinDate] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setBulletinDate(data.bulletin_date);
    setImageUrls(arrayToLines(data.image_urls));
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

    if (!imageUrls.trim()) {
      setFormError("이미지 URL을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ id, bulletinDate, imageUrls });
      router.push("/admin/bulletin");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "수정에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="주보 수정" />
      <main className="px-margin-main pt-stack-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <div className={fieldGroup}>
            <label htmlFor="bulletinDate" className={fieldLabel}>
              날짜 <span className="text-destructive">*</span>
            </label>
            <input
              id="bulletinDate"
              type="date"
              value={bulletinDate}
              onChange={(event) => setBulletinDate(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="imageUrls" className={fieldLabel}>
              이미지 URL <span className="text-destructive">*</span>
              <span className="ml-1 text-muted-foreground">(한 줄에 하나씩, 페이지 순서대로)</span>
            </label>
            <textarea
              id="imageUrls"
              rows={6}
              value={imageUrls}
              onChange={(event) => setImageUrls(event.target.value)}
              placeholder={"https://.../bulletin-p1.jpg\nhttps://.../bulletin-p2.jpg"}
              className={fieldTextarea}
            />
          </div>

          {formError && <p className={errorText}>{formError}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "수정 중..." : "주보 수정하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
