import { Clock3, XCircle } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const isRejected = profile?.status === "rejected";

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-4 bg-background px-margin-main text-center">
      {isRejected ? (
        <XCircle className="h-12 w-12 text-destructive" />
      ) : (
        <Clock3 className="h-12 w-12 text-primary" />
      )}
      <h1 className="font-heading text-title-lg text-foreground">
        {isRejected ? "가입이 승인되지 않았어요" : "승인 대기 중이에요"}
      </h1>
      <p className="text-body-md text-muted-foreground">
        {isRejected
          ? "문의사항은 교회 사무실로 연락해 주세요."
          : "관리자 승인 후 이용하실 수 있어요. 조금만 기다려 주세요."}
      </p>
      <LogoutButton className="mt-4 rounded-md border border-border px-6 py-3 text-body-md text-foreground" />
    </div>
  );
}
