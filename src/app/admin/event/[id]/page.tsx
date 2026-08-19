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
import { useEvent } from "@/hooks/useEvent";
import { useUpdateEvent } from "@/hooks/useUpdateEvent";

type EventType = "church" | "birthday" | "other";

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "church", label: "교회 일정" },
  { value: "birthday", label: "생일" },
  { value: "other", label: "기타" },
];

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } = useEvent(id);
  const { mutateAsync, isPending } = useUpdateEvent();

  const [eventDate, setEventDate] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("church");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setEventDate(data.event_date);
    setTitle(data.title);
    setType(data.type);
    setStartTime(data.start_time ?? "");
    setLocation(data.location ?? "");
    setDescription(data.description ?? "");
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
      setFormError("일정 제목을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ id, eventDate, title, type, startTime, location, description });
      router.push("/admin/event");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "수정에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="일정 수정" />
      <main className="px-margin-main pt-stack-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <div className={fieldGroup}>
            <label htmlFor="eventDate" className={fieldLabel}>
              날짜 <span className="text-destructive">*</span>
            </label>
            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="title" className={fieldLabel}>
              일정 제목 <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="type" className={fieldLabel}>
              구분
            </label>
            <select
              id="type"
              value={type}
              onChange={(event) => setType(event.target.value as EventType)}
              className={fieldInput}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={fieldGroup}>
            <label htmlFor="startTime" className={fieldLabel}>
              시작 시각 <span className="text-muted-foreground">(선택)</span>
            </label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="location" className={fieldLabel}>
              장소 <span className="text-muted-foreground">(선택)</span>
            </label>
            <input
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="description" className={fieldLabel}>
              설명 <span className="text-muted-foreground">(선택)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={fieldTextarea}
            />
          </div>

          {formError && <p className={errorText}>{formError}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "수정 중..." : "일정 수정하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
