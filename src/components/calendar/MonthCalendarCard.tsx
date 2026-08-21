"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarMonthData } from "@/lib/mock-data";
import { EVENT_CATEGORIES, eventCategory } from "@/lib/eventCategories";

interface MonthCalendarCardProps {
  month: CalendarMonthData;
  onSelectDate: (date: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthCalendarCard({
  month,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthCalendarCardProps) {
  return (
    <section className="rounded-lg bg-card p-4 shadow-[0_4px_24px_rgba(44,44,44,0.04)]">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          onClick={onPrevMonth}
          className="flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-container-low"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-title-lg text-foreground">{month.label}</h2>
        <button
          type="button"
          aria-label="다음 달"
          onClick={onNextMonth}
          className="flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-container-low"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-4 text-center">
        {month.weekdayLabels.map((label, index) => (
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

        {month.days.map((day, index) => {
          const weekday = index % 7;
          // 공휴일은 일요일과 같은 빨간색으로 보여준다.
          const dayColorClassName =
            day.holidayName || weekday === 0
              ? "text-sunday"
              : weekday === 6
                ? "text-saturday"
                : "text-foreground";

          if (!day.isCurrentMonth) {
            return (
              <div
                key={`${index}-${day.date}`}
                className="py-2 text-body-md text-surface-dim"
              >
                {day.date}
              </div>
            );
          }

          return (
            <button
              key={`${index}-${day.date}`}
              type="button"
              title={day.holidayName ?? undefined}
              onClick={() => onSelectDate(day.date)}
              className={
                day.isSelected
                  ? "relative z-10 flex flex-col items-center gap-0.5 pt-2 pb-3 text-body-md text-primary-foreground"
                  : `relative flex flex-col items-center gap-0.5 rounded-lg pt-2 pb-3 text-body-md transition-colors hover:bg-surface-container-low ${dayColorClassName}`
              }
            >
              {day.isSelected && (
                <div className="absolute left-1/2 top-1 -z-10 h-8 w-8 -translate-x-1/2 rounded-full bg-primary shadow-sm" />
              )}
              <span>{day.date}</span>
              {day.holidayName && (
                <span className="w-full truncate px-0.5 text-[9px] leading-none text-sunday">
                  {day.holidayName}
                </span>
              )}
              {day.dots && day.dots.length > 0 && (
                <div className="absolute bottom-0.5 flex gap-1">
                  {day.dots.map((dot) => (
                    <div
                      key={dot}
                      className={`h-1 w-1 rounded-full ${eventCategory(dot).dotClassName}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-sunday" />
          <span className="text-label-sm text-muted-foreground">공휴일</span>
        </div>
        {EVENT_CATEGORIES.map((category) => (
          <div key={category.value} className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${category.dotClassName}`} />
            <span className="text-label-sm text-muted-foreground">
              {category.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
