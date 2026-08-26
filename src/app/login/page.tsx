import Link from "next/link";
import { OAuthLoginButton } from "@/components/auth/OAuthLoginButton";

export default function LoginPage() {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center bg-background px-margin-main">
      <div className="mb-12 flex flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-headline-md text-primary">
          소망가교
        </h1>
        <p className="text-body-md text-muted-foreground">
          말씀과 기도로 함께 잇는 공동체
        </p>
      </div>
      <OAuthLoginButton />
      <p className="mt-6 text-center text-label-sm text-muted-foreground">
        로그인 후 관리자 승인이 완료되면 이용하실 수 있어요.
      </p>
      <Link
        href="/guide"
        className="mt-4 text-label-sm font-medium text-primary underline"
      >
        앱 설치와 사용법 보기
      </Link>
    </div>
  );
}
