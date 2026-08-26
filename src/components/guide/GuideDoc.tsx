"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  BookMarked,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Hand,
  Home,
  LogIn,
  MoreHorizontal,
  Music,
  Smartphone,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GuideTour, GUIDE_TOUR_STORAGE_KEY } from "@/components/guide/GuideTour";
import {
  GUIDE_APP_HOST,
  GUIDE_APP_URL,
  guideBlocks,
  guideChapters,
  guideFaq,
  type GuideBlock,
  type GuideChapter,
  type GuideChapterId,
  type GuideIcon,
} from "@/lib/guideContent";

const ICONS: Record<GuideIcon, LucideIcon> = {
  smartphone: Smartphone,
  login: LogIn,
  home: Home,
  music: Music,
  book: BookOpen,
  bookMarked: BookMarked,
  hand: Hand,
  users: Users,
  more: MoreHorizontal,
};

export function GuideDoc() {
  const router = useRouter();
  const chipsRef = useRef<HTMLDivElement>(null);
  /** 목차를 눌러 이동하는 동안에는 스크롤을 따라 칩이 바뀌지 않게 잠근다. */
  const lockedUntilRef = useRef(0);
  const [activeId, setActiveId] = useState<GuideChapterId>(guideChapters[0].id);
  const [closedIds, setClosedIds] = useState<GuideChapterId[]>([]);
  const [showTopButton, setShowTopButton] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // 처음 열었을 때 한 번만 안내를 띄운다. (건너뛰거나 끝내면 다시 뜨지 않는다)
  useEffect(() => {
    try {
      if (window.localStorage.getItem(GUIDE_TOUR_STORAGE_KEY) !== "1") {
        setIsTourOpen(true);
      }
    } catch {
      // 저장이 막힌 브라우저에서는 안내를 띄우지 않는다.
    }
  }, []);

  function closeTour() {
    setIsTourOpen(false);
    try {
      window.localStorage.setItem(GUIDE_TOUR_STORAGE_KEY, "1");
    } catch {
      // 저장하지 못해도 이번 방문에서는 닫힌 상태로 둔다.
    }
  }

  // 붙어 있는 목차 바로 아래를 지나간 부분 중 가장 마지막 것을 "읽고 있는 부분"으로 본다.
  useEffect(() => {
    function handleScroll() {
      setShowTopButton(window.scrollY > 400);

      let current = guideChapters[0].id;
      for (const chapter of guideChapters) {
        const section = document.getElementById(`guide-section-${chapter.id}`);
        if (!section) continue;
        if (section.getBoundingClientRect().top <= 160) current = chapter.id;
      }

      if (Date.now() < lockedUntilRef.current) return;
      setActiveId((previous) => (previous === current ? previous : current));
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // 보고 있는 부분의 칩이 항상 화면 안에 들어오게 한다.
  useEffect(() => {
    const active = chipsRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    active?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeId]);

  function goToChapter(chapterId: GuideChapterId) {
    setActiveId(chapterId);
    lockedUntilRef.current = Date.now() + 900;
    setClosedIds((current) => current.filter((id) => id !== chapterId));
    // 접혀 있던 부분이 펼쳐진 뒤에 자리를 잡도록 다음 그리기까지 기다린다.
    window.requestAnimationFrame(() => {
      document
        .getElementById(`guide-section-${chapterId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleChapter(chapterId: GuideChapterId) {
    setClosedIds((current) =>
      current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId],
    );
  }

  return (
    <div className="mx-auto w-full max-w-[760px] pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <header className="flex items-center gap-2 px-margin-main pb-2 pt-stack-md">
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={() => {
              if (window.history.length > 1) router.back();
              else router.push("/more");
            }}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-container-low"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-title-lg text-foreground">앱 사용 가이드</h1>
          <button
            type="button"
            id="guide-tour-replay"
            onClick={() => setIsTourOpen(true)}
            className="rounded-full border border-outline-variant px-3 py-1.5 text-label-sm text-muted-foreground transition-colors hover:bg-surface-container-low"
          >
            사용법 안내
          </button>
        </header>

        <nav
          ref={chipsRef}
          aria-label="가이드 목차"
          className="flex gap-2 overflow-x-auto px-margin-main pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {guideChapters.map((chapter) => {
            const isActive = chapter.id === activeId;
            return (
              <button
                key={chapter.id}
                type="button"
                id={`guide-chip-${chapter.id}`}
                data-active={isActive}
                aria-current={isActive}
                onClick={() => goToChapter(chapter.id)}
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
        </nav>
      </div>

      <main className="px-margin-main">
        <section className="border-b border-outline-variant/40 pb-stack-lg pt-stack-sm">
          <h2 className="font-heading text-headline-md text-foreground">
            휴대폰에 담는 우리 교회 신앙생활
          </h2>
          <p className="mt-2 text-body-md leading-relaxed text-muted-foreground">
            설치부터 탭마다 무엇을 할 수 있는지까지 담았어요. 처음 쓰는 분도 이
            순서대로만 따라오시면 됩니다.
          </p>
        </section>

        {guideChapters.map((chapter) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            blocks={guideBlocks.filter((block) => block.chapterId === chapter.id)}
            isOpen={!closedIds.includes(chapter.id)}
            onToggle={() => toggleChapter(chapter.id)}
          />
        ))}

        <section className="pt-stack-lg">
          <h2 className="font-heading text-headline-md-mobile text-foreground">
            자주 묻는 질문
          </h2>
          <div className="mt-stack-md flex flex-col gap-2">
            {guideFaq.map((item) => (
              <details
                key={item.question}
                className="rounded-lg border border-outline-variant/30 bg-card px-5 py-4"
              >
                <summary className="cursor-pointer list-none text-body-md font-semibold text-foreground marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-2 text-body-md leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <p className="pt-stack-lg text-center text-label-sm text-muted-foreground">
          소망가교 · 말씀과 기도로 함께 잇는 공동체
        </p>
      </main>

      {showTopButton && (
        <button
          type="button"
          aria-label="맨 위로"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-outline-variant bg-card text-muted-foreground shadow-[0_4px_16px_rgba(44,44,44,0.16)] transition-colors hover:bg-surface-container-low"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <GuideTour open={isTourOpen} onClose={closeTour} />
    </div>
  );
}

interface ChapterSectionProps {
  chapter: GuideChapter;
  blocks: GuideBlock[];
  isOpen: boolean;
  onToggle: () => void;
}

function ChapterSection({ chapter, blocks, isOpen, onToggle }: ChapterSectionProps) {
  const Icon = ICONS[chapter.icon];

  return (
    <section
      id={`guide-section-${chapter.id}`}
      className="scroll-mt-[124px] border-b border-outline-variant/40 py-stack-lg last:border-b-0"
    >
      <button
        type="button"
        id={`guide-toggle-${chapter.id}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-3 text-left"
      >
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-heading text-headline-md-mobile text-foreground">
            {chapter.title}
          </span>
          <span className="mt-1 block text-body-md leading-relaxed text-muted-foreground">
            {chapter.lead}
          </span>
        </span>
        <ChevronDown
          className={
            isOpen
              ? "mt-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform"
              : "mt-2 h-5 w-5 shrink-0 -rotate-90 text-muted-foreground transition-transform"
          }
        />
      </button>

      {isOpen && (
        <div className="mt-stack-md flex flex-col gap-gutter-card">
          {blocks.map((block) => (
            <BlockView key={block.id} block={block} />
          ))}
        </div>
      )}
    </section>
  );
}

function BlockView({ block }: { block: GuideBlock }) {
  return (
    <article className="rounded-lg border border-outline-variant/30 bg-card p-5 shadow-[0_2px_10px_rgba(44,44,44,0.03)]">
      <h3 className="text-body-lg font-semibold text-foreground">{block.title}</h3>

      {block.body && (
        <p className="mt-2 text-body-md leading-relaxed text-muted-foreground">
          {block.body}
        </p>
      )}

      {block.showAddress && <GuideAddress />}

      {block.steps && (
        <ol className="mt-3 flex flex-col gap-3">
          {block.steps.map((step, stepIndex) => (
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

      {block.points && (
        <ul className="mt-3 flex flex-col gap-2.5">
          {block.points.map((point) => (
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

      {block.tip && (
        <div className="mt-4 rounded-md border border-secondary/30 bg-secondary/10 p-3.5">
          <p className="text-[11px] font-bold tracking-wide text-secondary">
            {block.tip.label}
          </p>
          <p className="mt-1 text-label-sm leading-relaxed text-foreground">
            {block.tip.text}
          </p>
        </div>
      )}
    </article>
  );
}

/** 앱 주소를 보여주고, 눌러서 복사할 수 있게 한다. */
function GuideAddress() {
  const [isCopied, setIsCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(GUIDE_APP_URL);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // 복사가 막힌 브라우저에서는 주소를 그대로 읽어 입력하면 된다.
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-3.5 py-3">
      <p className="min-w-0 flex-1 truncate text-body-md font-semibold text-primary">
        {GUIDE_APP_HOST}
      </p>
      <button
        type="button"
        id="guide-address-copy"
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground transition-opacity active:opacity-80"
      >
        {isCopied ? (
          <>
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            복사했어요
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            주소 복사
          </>
        )}
      </button>
    </div>
  );
}
