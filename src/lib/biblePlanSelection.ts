"use client";

const STORAGE_KEY = "bible-progress-selected-plan";

/** 통독탭에서 마지막으로 보던 플랜을 기억해 다시 들어와도 그대로 보여준다. */
export function readSelectedPlanId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function rememberSelectedPlanId(memberPlanId: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, memberPlanId);
  } catch {
    // 저장하지 못해도 이번 화면에서는 전환된다.
  }
}
