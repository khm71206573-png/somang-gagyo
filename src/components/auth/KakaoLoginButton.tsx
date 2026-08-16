"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function KakaoLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
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
      className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] text-body-lg font-semibold text-[#191919] transition-opacity active:opacity-80 disabled:opacity-60"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="currentColor"
      >
        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.85 1.87 5.35 4.69 6.78-.15.55-.98 3.42-1 3.63 0 0-.02.17.09.24a.32.32 0 0 0 .25.03c.33-.05 3.81-2.5 4.4-2.92.5.07 1.02.11 1.57.11 5.52 0 10-3.58 10-8s-4.48-8-10-8Z" />
      </svg>
      {isLoading ? "이동 중..." : "카카오로 로그인"}
    </button>
  );
}
