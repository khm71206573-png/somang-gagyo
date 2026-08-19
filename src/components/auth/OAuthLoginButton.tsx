"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type LoginProvider = "google" | "kakao";

// 현재 활성화된 로그인 provider. 나중에 카카오로 되돌리려면 이 값만 바꾸면 된다.
const PROVIDER: LoginProvider = "google";

const PROVIDER_UI: Record<
  LoginProvider,
  { label: string; buttonClassName: string; icon: React.ReactNode }
> = {
  google: {
    label: "Google로 로그인",
    buttonClassName:
      "flex h-14 w-full items-center justify-center gap-3 rounded-md border border-border bg-white text-body-lg font-semibold text-[#1F1F1F] transition-opacity active:opacity-80 disabled:opacity-60",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.87c2.27-2.09 3.58-5.17 3.58-8.68Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.12A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.28a12 12 0 0 0 0 10.78l3.99-3.12Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l3.99 3.12C6.22 6.88 8.87 4.77 12 4.77Z"
        />
      </svg>
    ),
  },
  kakao: {
    label: "카카오로 로그인",
    buttonClassName:
      "flex h-14 w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] text-body-lg font-semibold text-[#191919] transition-opacity active:opacity-80 disabled:opacity-60",
    icon: (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.87 5.35 4.69 6.78-.15.55-.98 3.42-1 3.63 0 0-.02.17.09.24a.32.32 0 0 0 .25.03c.33-.05 3.81-2.5 4.4-2.92.5.07 1.02.11 1.57.11 5.52 0 10-3.58 10-8s-4.48-8-10-8Z" />
      </svg>
    ),
  },
};

export function OAuthLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const ui = PROVIDER_UI[PROVIDER];

  async function handleLogin() {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: PROVIDER,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={isLoading}
      className={ui.buttonClassName}
    >
      {ui.icon}
      {isLoading ? "이동 중..." : ui.label}
    </button>
  );
}
