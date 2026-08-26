"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Hand,
  HandHeart,
  Heart,
  Home,
  LayoutGrid,
  ListMusic,
  LogIn,
  Megaphone,
  Music,
  Pause,
  PartyPopper,
  PenLine,
  Share2,
  Smartphone,
  UserCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  guideCards,
  guideChapters,
  type GuideCard,
  type GuideIcon,
} from "@/lib/guideCards";

const ICONS: Record<GuideIcon, LucideIcon> = {
  guide: BookOpenCheck,
  smartphone: Smartphone,
  download: Download,
  login: LogIn,
  tabs: LayoutGrid,
  home: Home,
  music: Music,
  listMusic: ListMusic,
  book: BookOpen,
  pen: PenLine,
  bookMarked: BookMarked,
  calendarCheck: CalendarCheck,
  pause: Pause,
  cheer: HandHeart,
  hand: Hand,
  heart: Heart,
  users: Users,
  calendar: CalendarCheck,
  megaphone: Megaphone,
  bell: Bell,
  profile: UserCircle,
  share: Share2,
  done: PartyPopper,
};

/** 각 장이 시작되는 카드 번호. 위쪽 칩을 누르면 이 카드로 넘어간다. */
const CHAPTER_START = new Map(
  guideChapters.map((chapter) => [
    chapter.id,
    guideCards.findIndex((card) => card.chapterId === chapter.id),
  ]),
);

export function GuideCardDeck() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const total = guideCards.length;
  const current = guideCards[index];

  const scrollToCard = useCallback((target: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const clamped = Math.max(0, Math.min(target, guideCards.length - 1));
    scroller.scrollTo({ left: clamped * scroller.clientWidth, behavior: "smooth" });
  }, []);

  // 손가락으로 넘긴 위치를 그대로 따라간다. (스크롤이 카드 단위로 붙는다)
  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;

    const next = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setIndex((prev) => (prev === next ? prev : next));
  }

  // 보고 있는 장의 칩이 항상 화면 안에 들어오게 한다.
  useEffect(() => {
    const chips = chipsRef.current;
    if (!chips) return;

    const active = chips.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [current.chapterId]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") scrollToCard(index + 1);
      if (event.key === "ArrowLeft") scrollToCard(index - 1);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, scrollToCard]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 장 고르기 */}
      <div
        ref={chipsRef}
        className="flex shrink-0 gap-2 overflow-x-auto px-margin-main pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {guideChapters.map((chapter) => {
          const isActive = chapter.id === current.chapterId;
          return (
            <button
              key={chapter.id}
              type="button"
              data-active={isActive}
              aria-pressed={isActive}
              onClick={() => scrollToCard(CHAPTER_START.get(chapter.id) ?? 0)}
              className={
                isActive
                  ? "shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-label-sm font-semibold text-primary-foreground"
                  : "shrink-0 rounded-full border border-outline-variant bg-card px-3.5 py-1.5 text-label-sm text-muted-foreground transition-colors hover:bg-surface-container-low"
              }
            >
              {chapter.label}
            </button>
          );
        })}
      </div>

      {/* 카드 */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {guideCards.map((card, cardIndex) => (
          <div
            key={card.id}
            aria-hidden={cardIndex !== index}
            className="flex h-full w-full shrink-0 snap-center snap-always px-margin-main pb-1"
          >
            <GuideCardView card={card} />
          </div>
        ))}
      </div>

      {/* 진행 상황과 이동 버튼 */}
      <div className="shrink-0 px-margin-main pb-stack-md pt-3">
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="가이드 진행"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => scrollToCard(index - 1)}
            disabled={index === 0}
            className="flex items-center gap-1 rounded-md border border-outline-variant px-4 py-2.5 text-label-sm text-muted-foreground transition-colors hover:bg-surface-container-low disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </button>

          <span className="text-label-sm font-semibold tabular-nums text-muted-foreground">
            {index + 1} / {total}
          </span>

          <button
            type="button"
            onClick={() => scrollToCard(index + 1)}
            disabled={index === total - 1}
            className="flex items-center gap-1 rounded-md bg-primary px-4 py-2.5 text-label-sm font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-40"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function GuideCardView({ card }: { card: GuideCard }) {
  const Icon = ICONS[card.icon];
  const isCover = card.variant === "cover";

  return (
    <article
      className={
        isCover
          ? "flex h-full w-full flex-col items-center justify-center gap-4 overflow-y-auto rounded-lg border border-primary/25 bg-primary/5 p-7 text-center"
          : "flex h-full w-full flex-col gap-4 overflow-y-auto rounded-lg border border-outline-variant/30 bg-card p-6 shadow-[0_2px_14px_rgba(44,44,44,0.05)]"
      }
    >
      <span
        className={
          isCover
            ? "flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
            : "flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
        }
      >
        <Icon className={isCover ? "h-8 w-8" : "h-[22px] w-[22px]"} />
      </span>

      <div className={isCover ? "" : "flex flex-col gap-1"}>
        <p className="text-[11px] font-semibold tracking-wider text-primary">
          {card.eyebrow}
        </p>
        <h2
          className={
            isCover
              ? "mt-2 font-heading text-headline-md text-foreground"
              : "font-heading text-headline-md-mobile text-foreground"
          }
        >
          {card.title}
        </h2>
      </div>

      {card.body && (
        <p className="text-body-md leading-relaxed text-muted-foreground">
          {card.body}
        </p>
      )}

      {card.steps && (
        <ol className="flex flex-col gap-3">
          {card.steps.map((step, stepIndex) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-[12px] font-bold tabular-nums text-primary-foreground">
                {stepIndex + 1}
              </span>
              <span className="text-body-md leading-relaxed text-foreground">
                {step}
              </span>
            </li>
          ))}
        </ol>
      )}

      {card.points && (
        <ul className="flex flex-col gap-2.5">
          {card.points.map((point) => (
            <li key={point} className="flex gap-2.5">
              <span
                aria-hidden
                className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50"
              />
              <span className="text-body-md leading-relaxed text-foreground">
                {point}
              </span>
            </li>
          ))}
        </ul>
      )}

      {card.tip && (
        <div className="mt-auto rounded-md border border-secondary/30 bg-secondary/10 p-3.5">
          <p className="text-[11px] font-bold tracking-wide text-secondary">
            {card.tip.label}
          </p>
          <p className="mt-1 text-label-sm leading-relaxed text-foreground">
            {card.tip.text}
          </p>
        </div>
      )}
    </article>
  );
}
