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
import { useCreateDevotion } from "@/hooks/useCreateDevotion";
import { toDateString } from "@/lib/supabase/queries/utils";

export default function NewDevotionPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateDevotion();

  const [devotionDate, setDevotionDate] = useState(toDateString(new Date()));
  const [tag, setTag] = useState("");
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [verses, setVerses] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !reference.trim() || !verses.trim()) {
      setError("제목, 본문 구절, 말씀 내용을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ devotionDate, tag, title, reference, verses });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="묵상 등록" listHref="/admin/devotion" />
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

          {error && <p className={errorText}>{error}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "등록 중..." : "묵상 등록하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
