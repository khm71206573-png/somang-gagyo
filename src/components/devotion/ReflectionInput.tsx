"use client";

import { useState, type FormEvent } from "react";
import { useCreateDevotionNote } from "@/hooks/useCreateDevotionNote";

interface ReflectionInputProps {
  devotionId: string;
}

export function ReflectionInput({ devotionId }: ReflectionInputProps) {
  const { mutate: createNote, isPending, error } = useCreateDevotionNote();
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);

    if (!content.trim()) {
      setLocalError("나눔 내용을 입력해주세요.");
      return;
    }

    createNote(
      { devotionId, content },
      { onSuccess: () => setContent("") },
    );
  }

  const errorMessage =
    localError ?? (error instanceof Error ? error.message : null);

  return (
    <section className="flex flex-col gap-stack-md">
      <h3 className="text-title-lg text-foreground">나의 묵상 나눔</h3>
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-outline/15 bg-card p-5 shadow-[0_2px_10px_rgba(44,44,44,0.04)] transition-colors focus-within:border-primary"
      >
        <label
          htmlFor="reflection-input"
          className="mb-3 block text-label-sm text-muted-foreground"
        >
          한 줄이면 충분해요
        </label>
        <textarea
          id="reflection-input"
          rows={3}
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            setLocalError(null);
          }}
          placeholder="오늘의 깨달음을 나누어주세요..."
          className="w-full resize-none border-none bg-transparent p-0 text-body-md text-foreground placeholder:text-outline focus:outline-none focus:ring-0"
        />
        {errorMessage && (
          <p className="mt-2 text-label-sm text-destructive">{errorMessage}</p>
        )}
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary-container active:scale-95 disabled:opacity-60"
          >
            {isPending ? "남기는 중..." : "나눔 남기기"}
          </button>
        </div>
      </form>
    </section>
  );
}
