"use client";

import { useState, type FormEvent } from "react";
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
import { useCreateBulletin } from "@/hooks/useCreateBulletin";
import { toDateString } from "@/lib/supabase/queries/utils";

export default function NewBulletinPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateBulletin();

  const [bulletinDate, setBulletinDate] = useState(toDateString(new Date()));
  const [imageUrls, setImageUrls] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!imageUrls.trim()) {
      setError("이미지 URL을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ bulletinDate, imageUrls });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="주보 등록" listHref="/admin/bulletin" />
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

          {error && <p className={errorText}>{error}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "등록 중..." : "주보 등록하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
