"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !groupName.trim()) {
      setError("이름과 소속 가교를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          groupName: groupName.trim(),
          phone: phone.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "등록에 실패했어요.");
      }

      router.push("/pending");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
    } finally {
      // 성공 후 이동이 막히는 경우(예: 미들웨어가 다시 이 페이지로 돌려보내는 경우)에도
      // 버튼이 "제출 중..."에 영구히 멈춰있지 않도록 항상 풀어준다.
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-label-sm text-foreground">
          이름 <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="실명을 입력해주세요"
          className="rounded-md border border-border bg-card px-4 py-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="groupName" className="text-label-sm text-foreground">
          소속 가교 <span className="text-destructive">*</span>
        </label>
        <input
          id="groupName"
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          placeholder="예: 1가교, 은혜가교"
          className="rounded-md border border-border bg-card px-4 py-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-label-sm text-foreground">
          연락처 <span className="text-muted-foreground">(선택)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="010-0000-0000"
          className="rounded-md border border-border bg-card px-4 py-3 text-body-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {error && <p className="text-label-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-primary py-4 text-body-lg font-semibold text-primary-foreground transition-opacity active:opacity-80 disabled:opacity-60"
      >
        {isSubmitting ? "제출 중..." : "제출하기"}
      </button>
    </form>
  );
}
