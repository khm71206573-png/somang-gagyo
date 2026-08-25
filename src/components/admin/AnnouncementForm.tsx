"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  errorText,
  fieldGroup,
  fieldInput,
  fieldLabel,
  fieldTextarea,
  submitButton,
} from "@/components/admin/adminFormStyles";
import type {
  AnnouncementOptionInput,
  CreateAnnouncementInput,
} from "@/hooks/useCreateAnnouncement";
import type {
  AnnouncementKind,
  AnnouncementPollType,
} from "@/lib/supabase/queries/announcement";

export interface AnnouncementFormInitialValue {
  kind: AnnouncementKind;
  pollType: AnnouncementPollType | null;
  title: string;
  content: string | null;
  isPinned: boolean;
  allowMultiple: boolean;
  hideVoters: boolean;
  closesAt: string | null;
  options: AnnouncementOptionInput[];
}

interface AnnouncementFormProps {
  initialValue?: AnnouncementFormInitialValue;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (value: CreateAnnouncementInput) => Promise<void>;
}

interface OptionRow extends AnnouncementOptionInput {
  /** 행을 추가·삭제해도 입력 포커스가 튀지 않도록 하는 로컬 키 */
  key: string;
}

const KIND_OPTIONS: { value: AnnouncementKind; label: string; description: string }[] = [
  { value: "post", label: "일반 게시글", description: "안내 사항을 글로 올려요" },
  { value: "poll", label: "투표", description: "의견이나 일정을 모아요" },
];

const POLL_TYPE_OPTIONS: {
  value: AnnouncementPollType;
  label: string;
  description: string;
}[] = [
  {
    value: "schedule",
    label: "일정투표",
    description: "후보 날짜 중에 가능한 날을 고르게 해요",
  },
  {
    value: "choice",
    label: "문항투표",
    description: "문항 중에 하나(또는 여러 개)를 고르게 해요",
  },
];

let optionKeySeed = 0;
function createOptionRow(option?: AnnouncementOptionInput): OptionRow {
  optionKeySeed += 1;
  return {
    key: `option-${optionKeySeed}`,
    id: option?.id,
    label: option?.label ?? "",
    optionDate: option?.optionDate ?? "",
    startTime: option?.startTime ?? "",
  };
}

/** ISO 문자열 → <input type="datetime-local">이 받는 현지 시각 문자열 */
function toDatetimeLocalValue(isoString: string) {
  const date = new Date(isoString);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function AnnouncementForm({
  initialValue,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
}: AnnouncementFormProps) {
  const [kind, setKind] = useState<AnnouncementKind>("post");
  const [pollType, setPollType] = useState<AnnouncementPollType>("schedule");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [hideVoters, setHideVoters] = useState(false);
  const [closesAtLocal, setClosesAtLocal] = useState("");
  const [options, setOptions] = useState<OptionRow[]>([
    createOptionRow(),
    createOptionRow(),
  ]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialValue) return;

    setKind(initialValue.kind);
    setPollType(initialValue.pollType ?? "schedule");
    setTitle(initialValue.title);
    setContent(initialValue.content ?? "");
    setIsPinned(initialValue.isPinned);
    setAllowMultiple(initialValue.allowMultiple);
    setHideVoters(initialValue.hideVoters);
    setClosesAtLocal(
      initialValue.closesAt ? toDatetimeLocalValue(initialValue.closesAt) : "",
    );
    setOptions(
      initialValue.options.length > 0
        ? initialValue.options.map((option) => createOptionRow(option))
        : [createOptionRow(), createOptionRow()],
    );
  }, [initialValue]);

  function updateOption(key: string, patch: Partial<AnnouncementOptionInput>) {
    setOptions((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit({
        kind,
        pollType,
        title,
        content,
        isPinned,
        allowMultiple: kind === "poll" && allowMultiple,
        hideVoters: kind === "poll" && hideVoters,
        closesAt:
          kind === "poll" && closesAtLocal
            ? new Date(closesAtLocal).toISOString()
            : null,
        options:
          kind === "poll"
            ? options.map((option) => ({
                id: option.id,
                label: option.label,
                optionDate: option.optionDate,
                startTime: option.startTime,
              }))
            : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했어요.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
      <fieldset className={fieldGroup}>
        <legend className={`${fieldLabel} mb-2`}>공지 종류</legend>
        <div className="flex gap-2">
          {KIND_OPTIONS.map((option) => {
            const isSelected = option.value === kind;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setKind(option.value)}
                className={
                  isSelected
                    ? "flex flex-1 flex-col gap-1 rounded-lg border-2 border-primary bg-primary/5 p-3 text-left"
                    : "flex flex-1 flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container p-3 text-left transition-colors hover:bg-surface-container-high"
                }
              >
                <span
                  className={
                    isSelected
                      ? "text-label-sm font-semibold text-primary"
                      : "text-label-sm font-medium text-foreground"
                  }
                >
                  {option.label}
                </span>
                <span className="text-[11px] leading-snug text-muted-foreground">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className={fieldGroup}>
        <label htmlFor="title" className={fieldLabel}>
          제목 <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="예) 가을 수련회 안내"
          className={fieldInput}
        />
      </div>

      <div className={fieldGroup}>
        <label htmlFor="content" className={fieldLabel}>
          내용{" "}
          {kind === "post" ? (
            <span className="text-destructive">*</span>
          ) : (
            <span className="text-muted-foreground">(선택)</span>
          )}
        </label>
        <textarea
          id="content"
          rows={kind === "post" ? 8 : 4}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={
            kind === "post"
              ? "공지 내용을 적어주세요."
              : "투표를 왜 하는지 짧게 설명해주세요."
          }
          className={fieldTextarea}
        />
      </div>

      {kind === "poll" && (
        <>
          <fieldset className={fieldGroup}>
            <legend className={`${fieldLabel} mb-2`}>투표 방식</legend>
            <div className="flex gap-2">
              {POLL_TYPE_OPTIONS.map((option) => {
                const isSelected = option.value === pollType;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setPollType(option.value)}
                    className={
                      isSelected
                        ? "flex flex-1 flex-col gap-1 rounded-lg border-2 border-primary bg-primary/5 p-3 text-left"
                        : "flex flex-1 flex-col gap-1 rounded-lg border border-outline-variant bg-surface-container p-3 text-left transition-colors hover:bg-surface-container-high"
                    }
                  >
                    <span
                      className={
                        isSelected
                          ? "text-label-sm font-semibold text-primary"
                          : "text-label-sm font-medium text-foreground"
                      }
                    >
                      {option.label}
                    </span>
                    <span className="text-[11px] leading-snug text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className={fieldGroup}>
            <span className={fieldLabel}>
              {pollType === "schedule" ? "후보 일정" : "투표 문항"}{" "}
              <span className="text-destructive">*</span>
            </span>
            <div className="flex flex-col gap-2">
              {options.map((option, index) => (
                <div
                  key={option.key}
                  className="flex flex-col gap-2 rounded-md border border-outline-variant/60 bg-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {index + 1}번
                    </span>
                    <button
                      type="button"
                      aria-label="항목 삭제"
                      onClick={() =>
                        setOptions((rows) =>
                          rows.length <= 1
                            ? rows
                            : rows.filter((row) => row.key !== option.key),
                        )
                      }
                      className="text-outline transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {pollType === "schedule" ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="date"
                          aria-label={`${index + 1}번 날짜`}
                          value={option.optionDate}
                          onChange={(event) =>
                            updateOption(option.key, { optionDate: event.target.value })
                          }
                          className={`${fieldInput} min-w-0 flex-1`}
                        />
                        <input
                          type="time"
                          aria-label={`${index + 1}번 시각`}
                          value={option.startTime}
                          onChange={(event) =>
                            updateOption(option.key, { startTime: event.target.value })
                          }
                          className={`${fieldInput} min-w-0 flex-1`}
                        />
                      </div>
                      <input
                        aria-label={`${index + 1}번 메모`}
                        value={option.label}
                        onChange={(event) =>
                          updateOption(option.key, { label: event.target.value })
                        }
                        placeholder="메모 (선택) 예) 예배 후"
                        className={fieldInput}
                      />
                    </div>
                  ) : (
                    <input
                      aria-label={`${index + 1}번 문항`}
                      value={option.label}
                      onChange={(event) =>
                        updateOption(option.key, { label: event.target.value })
                      }
                      placeholder="문항 내용"
                      className={fieldInput}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOptions((rows) => [...rows, createOptionRow()])}
              className="flex items-center justify-center gap-1 rounded-md border border-dashed border-outline-variant py-3 text-label-sm text-muted-foreground transition-colors hover:bg-surface-container-low"
            >
              <Plus className="h-4 w-4" />
              {pollType === "schedule" ? "일정 추가" : "문항 추가"}
            </button>
          </div>

          <label className="flex items-center gap-3 rounded-md border border-outline-variant/60 bg-card p-3">
            <input
              type="checkbox"
              checked={allowMultiple}
              onChange={(event) => setAllowMultiple(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span className="flex flex-col">
              <span className="text-label-sm font-medium text-foreground">
                복수 선택 허용
              </span>
              <span className="text-[11px] text-muted-foreground">
                가능한 날짜를 여러 개 고를 수 있게 해요.
              </span>
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-md border border-outline-variant/60 bg-card p-3">
            <input
              type="checkbox"
              checked={hideVoters}
              onChange={(event) => setHideVoters(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            <span className="flex flex-col">
              <span className="text-label-sm font-medium text-foreground">
                투표자 이름 비공개
              </span>
              <span className="text-[11px] text-muted-foreground">
                누가 무엇을 골랐는지 감추고 참여 인원과 득표 수만 보여줘요.
              </span>
            </span>
          </label>

          <div className={fieldGroup}>
            <label htmlFor="closesAt" className={fieldLabel}>
              마감 시각 <span className="text-muted-foreground">(선택)</span>
            </label>
            <input
              id="closesAt"
              type="datetime-local"
              value={closesAtLocal}
              onChange={(event) => setClosesAtLocal(event.target.value)}
              className={fieldInput}
            />
            <p className="text-[11px] text-muted-foreground">
              비워두면 마감 없이 계속 투표할 수 있어요.
            </p>
          </div>
        </>
      )}

      <label className="flex items-center gap-3 rounded-md border border-outline-variant/60 bg-card p-3">
        <input
          type="checkbox"
          checked={isPinned}
          onChange={(event) => setIsPinned(event.target.checked)}
          className="h-4 w-4 accent-[var(--primary)]"
        />
        <span className="flex flex-col">
          <span className="text-label-sm font-medium text-foreground">상단 고정</span>
          <span className="text-[11px] text-muted-foreground">
            공지 목록 맨 위에 항상 보여줘요.
          </span>
        </span>
      </label>

      {error && <p className={errorText}>{error}</p>}

      <button type="submit" disabled={isPending} className={submitButton}>
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
