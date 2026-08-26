"use client";

import { useCallback, useEffect, useState } from "react";
import { Hand, X } from "lucide-react";

/**
 * 가이드를 처음 열었을 때 뜨는 튜토리얼.
 *
 * 가이드를 읽는 데 꼭 필요한 조작만 다섯 단계로 직접 눌러보게 한다.
 * 안내가 가리키는 자리는 화면이 어두워지지 않아 실제로 눌러볼 수 있고,
 * 누르면 진짜 동작이 일어나면서 다음 단계로 넘어간다.
 */

export const GUIDE_TOUR_STORAGE_KEY = "somang-guide-tour-done";

interface TourStep {
  /** 안내가 가리킬 요소의 id. 없으면 화면 가운데 안내만 띄운다. */
  targetId?: string;
  title: string;
  body: string;
  /**
   * true면 그 자리를 직접 눌러야 다음으로 넘어간다.
   * false면 눌러볼 수 없고 "다음"으로만 넘어간다.
   */
  interactive: boolean;
}

const STEPS: TourStep[] = [
  {
    targetId: "guide-chip-song",
    title: "① 여기를 눌러보세요",
    body: "위쪽 목차예요. 보고 싶은 부분으로 바로 갈 수 있어요. '찬양'을 눌러보세요.",
    interactive: true,
  },
  {
    targetId: "guide-toggle-song",
    title: "② 제목을 눌러 접어요",
    body: "제목 줄을 누르면 그 부분이 접혀요. 다시 누르면 펼쳐집니다. 한번 눌러보세요.",
    interactive: true,
  },
  {
    targetId: "guide-address-copy",
    title: "③ 주소를 복사해요",
    body: "앱 주소를 복사해 다른 분께 보낼 수 있어요. 눌러보세요.",
    interactive: true,
  },
  {
    targetId: "guide-tour-replay",
    title: "④ 다시 보고 싶을 때",
    body: "이 버튼을 누르면 지금 이 안내를 처음부터 다시 볼 수 있어요.",
    interactive: false,
  },
  {
    title: "⑤ 다 익히셨어요",
    body: "이제 편하게 읽어보세요. 가이드는 더보기 → 앱 사용 가이드에서 언제든 다시 열 수 있어요.",
    interactive: false,
  },
];

interface GuideTourProps {
  open: boolean;
  onClose: () => void;
}

interface Spot {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** 안내 구멍이 요소보다 조금 넉넉하게 뚫리도록 두는 여백 */
const SPOT_PADDING = 8;

export function GuideTour({ open, onClose }: GuideTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spot, setSpot] = useState<Spot | null>(null);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const finish = useCallback(() => {
    setStepIndex(0);
    onClose();
  }, [onClose]);

  const goNext = useCallback(() => {
    setStepIndex((current) => {
      if (current >= STEPS.length - 1) return current;
      return current + 1;
    });
  }, []);

  useEffect(() => {
    if (open) setStepIndex(0);
  }, [open]);

  // 가리킬 자리를 찾아 화면 안으로 옮기고, 그 위치를 계속 따라간다.
  useEffect(() => {
    if (!open) {
      setSpot(null);
      return;
    }

    const targetId = step.targetId;
    if (!targetId) {
      setSpot(null);
      return;
    }

    const target = document.getElementById(targetId);
    if (!target) {
      setSpot(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const isFullyVisible = rect.top >= 90 && rect.bottom <= window.innerHeight - 90;
    if (!isFullyVisible) {
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    let frame = 0;
    function measure() {
      const element = document.getElementById(targetId!);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setSpot({
        top: rect.top - SPOT_PADDING,
        left: rect.left - SPOT_PADDING,
        width: rect.width + SPOT_PADDING * 2,
        height: rect.height + SPOT_PADDING * 2,
      });
      frame = window.requestAnimationFrame(measure);
    }

    frame = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(frame);
  }, [open, step.targetId]);

  // 가리킨 자리를 실제로 누르면 다음 단계로 넘어간다.
  useEffect(() => {
    if (!open || !step.interactive || !step.targetId) return;

    const target = document.getElementById(step.targetId);
    if (!target) return;

    function handleClick() {
      // 누른 동작(이동·접기·복사)이 먼저 보이도록 살짝 뒤에 넘어간다.
      window.setTimeout(goNext, 450);
    }

    target.addEventListener("click", handleClick);
    return () => target.removeEventListener("click", handleClick);
  }, [open, step.interactive, step.targetId, goNext]);

  if (!open) return null;

  const hasSpot = Boolean(step.targetId) && spot !== null;
  // 가리킨 자리가 화면 위쪽이면 안내를 아래에, 아래쪽이면 위에 둔다.
  const isSpotOnTop =
    hasSpot && spot!.top + spot!.height / 2 < window.innerHeight / 2;

  return (
    // 막 자체는 클릭을 받지 않는다. 어두운 네 조각과 안내 상자만 클릭을 막아,
    // 가운데 뚫린 자리는 실제로 눌러볼 수 있다.
    <div
      className="pointer-events-none fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
    >
      {hasSpot ? (
        <>
          {/* 구멍 뚫린 어두운 막. 네 조각으로 나눠 가운데만 비워둔다. */}
          <div
            className="pointer-events-auto absolute inset-x-0 top-0 bg-black/55"
            style={{ height: Math.max(spot!.top, 0) }}
          />
          <div
            className="pointer-events-auto absolute inset-x-0 bottom-0 bg-black/55"
            style={{ top: spot!.top + spot!.height }}
          />
          <div
            className="pointer-events-auto absolute left-0 bg-black/55"
            style={{
              top: spot!.top,
              height: spot!.height,
              width: Math.max(spot!.left, 0),
            }}
          />
          <div
            className="pointer-events-auto absolute right-0 bg-black/55"
            style={{
              top: spot!.top,
              height: spot!.height,
              left: spot!.left + spot!.width,
            }}
          />
          {/* 눌러야 할 자리를 감싸는 테두리 (누르는 건 그대로 통과한다) */}
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-lg border-2 border-primary ring-4 ring-primary/30"
            style={{
              top: spot!.top,
              left: spot!.left,
              width: spot!.width,
              height: spot!.height,
            }}
          />
        </>
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-black/55" />
      )}

      <div
        className={
          hasSpot
            ? "absolute inset-x-0 px-margin-main"
            : "absolute inset-0 flex items-center justify-center px-margin-main"
        }
        style={
          hasSpot
            ? isSpotOnTop
              ? { top: spot!.top + spot!.height + 14 }
              : { bottom: window.innerHeight - spot!.top + 14 }
            : undefined
        }
      >
        <div className="pointer-events-auto mx-auto w-full max-w-[420px] rounded-lg bg-card p-5 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Hand className="h-4 w-4" />
              </span>
              <p className="text-title-lg text-foreground">{step.title}</p>
            </div>
            <button
              type="button"
              onClick={finish}
              aria-label="안내 닫기"
              className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-container-low"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-2 text-body-md leading-relaxed text-muted-foreground">
            {step.body}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5" aria-hidden>
              {STEPS.map((item, itemIndex) => (
                <span
                  key={item.title}
                  className={
                    itemIndex === stepIndex
                      ? "h-1.5 w-5 rounded-full bg-primary"
                      : "h-1.5 w-1.5 rounded-full bg-outline-variant"
                  }
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isLast && (
                <button
                  type="button"
                  onClick={finish}
                  className="px-2 py-2 text-label-sm text-muted-foreground"
                >
                  그만 보기
                </button>
              )}
              <button
                type="button"
                onClick={isLast ? finish : goNext}
                className="rounded-md bg-primary px-4 py-2.5 text-label-sm font-semibold text-primary-foreground transition-opacity active:opacity-80"
              >
                {isLast ? "가이드 보기" : "다음"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
