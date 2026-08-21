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
          const weekendClassName =
            weekday === 0
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

          if (day.isSelected) {
            return (
              <button
                key={`${index}-${day.date}`}
                type="button"
                onClick={() => onSelectDate(day.date)}
                className="relative z-10 flex flex-col items-center py-2 text-body-md text-primary-foreground"
              >
                <div className="absolute inset-0 -z-10 m-auto h-8 w-8 rounded-full bg-primary shadow-sm" />
                <span>{day.date}</span>
                <div className="absolute bottom-0 flex gap-1">
                  {day.dots?.map((dot) => (
                    <div
                      key={dot}
                      className="h-1 w-1 rounded-full bg-primary-foreground"
                    />
                  ))}
                </div>
              </button>
            );
          }

          return (
            <button
              key={`${index}-${day.date}`}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className={`relative flex flex-col items-center rounded-lg py-2 text-body-md transition-colors hover:bg-surface-container-low ${weekendClassName}`}
            >
              <span>{day.date}</span>
              {day.dots && day.dots.length > 0 && (
                <div className="absolute bottom-0 flex gap-1">
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
