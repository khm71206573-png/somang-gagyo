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
import { useCreateEvent } from "@/hooks/useCreateEvent";
import { toDateString } from "@/lib/supabase/queries/utils";

type EventType = "church" | "gagyo" | "birthday" | "other";

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "church", label: "교회일정" },
  { value: "gagyo", label: "가교일정" },
  { value: "birthday", label: "생일" },
  { value: "other", label: "기타" },
];

export default function NewEventPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateEvent();

  const [eventDate, setEventDate] = useState(toDateString(new Date()));
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("church");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("일정 제목을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({ eventDate, title, type, startTime, location, description });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="일정 등록" listHref="/admin/event" />
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

          {error && <p className={errorText}>{error}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "등록 중..." : "일정 등록하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
