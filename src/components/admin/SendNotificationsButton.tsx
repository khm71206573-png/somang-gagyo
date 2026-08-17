"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface SendResult {
  processed: number;
  sent: number;
  failed: number;
}

export function SendNotificationsButton() {
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSend() {
    setIsSending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/send-notifications", {
        method: "POST",
      });
      const data = (await response.json()) as SendResult & { error?: string };

      if (!response.ok) {
        setMessage(data.error ?? "발송에 실패했어요.");
        return;
      }

      setMessage(
        data.processed === 0
          ? "발송할 예약 알림이 없어요."
          : `${data.processed}건 처리 · ${data.sent}건 발송 성공${
              data.failed ? ` · ${data.failed}건 실패` : ""
            }`,
      );
    } catch {
      setMessage("발송 요청에 실패했어요.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="flex flex-col gap-stack-sm pb-4">
      <h2 className="text-title-lg text-foreground">예약 알림 발송</h2>
      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {isSending ? "발송 중..." : "발송 시각이 된 예약 알림 지금 보내기"}
      </button>
      {message && <p className="text-label-sm text-muted-foreground">{message}</p>}
    </section>
  );
}
