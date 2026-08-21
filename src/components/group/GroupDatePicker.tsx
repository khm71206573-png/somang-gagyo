"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { WEEKDAY_LABELS, toDateString } from "@/lib/supabase/queries/utils";

interface GroupDatePickerProps {
  open: boolean;
  /** 현재 선택된 날짜 (yyyy-mm-dd) */
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export function GroupDatePicker({
  open,
  selectedDate,
  onSelect,
  onClose,
}: GroupDatePickerProps) {
  const [viewDate, setViewDate] = useState(() => new Date(`${selectedDate}T00:00:00`));

  // 다시 열 때는 선택된 날짜가 있는 달부터 보여준다.
  useEffect(() => {
    if (open) setViewDate(new Date(`${selectedDate}T00:00:00`));
  }, [open, selectedDate]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = toDateString(new Date());

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shiftMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-margin-main">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="날짜 선택"
        className="relative w-full max-w-[400px] rounded-2xl bg-background p-5 shadow-[0_8px_32px_rgba(44,44,44,0.16)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => shiftMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container-low"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-title-lg text-foreground">
            {year}년 {month + 1}월
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => shiftMonth(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container-low"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container-low"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAY_LABELS.map((label, index) => (
            <div
              key={label}
              className={
                index === 0
                  ? "pb-2 text-label-sm text-sunday"
                  : index === 6
                    ? "pb-2 text-label-sm text-saturday"
                    : "pb-2 text-label-sm text-muted-foreground"
              }
            >
              {label}
            </div>
          ))}

          {cells.map((date, index) => {
            if (date === null) {
              return <div key={`empty-${index}`} className="py-2" />;
            }

            const dateStr = toDateString(new Date(year, month, date));
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            const weekday = index % 7;
            const weekendClassName =
              weekday === 0
                ? "text-sunday"
                : weekday === 6
                  ? "text-saturday"
                  : "text-foreground";

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => {
                  onSelect(dateStr);
                  onClose();
                }}
                className={
                  isSelected
                    ? "mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary text-body-md text-primary-foreground"
                    : `mx-auto flex h-9 w-9 items-center justify-center rounded-full text-body-md transition-colors hover:bg-surface-container-low ${weekendClassName} ${
                        isToday ? "ring-1 ring-primary/40" : ""
                      }`
                }
              >
                {date}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            onSelect(todayStr);
            onClose();
          }}
          className="mt-4 w-full rounded-md border border-outline-variant py-2.5 text-label-sm text-foreground transition-colors hover:bg-surface-container-low"
        >
          오늘로 이동
        </button>
      </div>
    </div>
  );
}
