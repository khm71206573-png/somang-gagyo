import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-4 bg-background px-margin-main text-center">
      <h1 className="font-heading text-title-lg text-foreground">
        로그인에 실패했어요
      </h1>
      <p className="text-body-md text-muted-foreground">
        로그인 처리 중 문제가 발생했습니다. 다시 시도해 주세요.
      </p>
      <Link
        href="/login"
        className="mt-2 rounded-md bg-primary px-6 py-3 text-body-md font-semibold text-primary-foreground"
      >
        다시 로그인하기
      </Link>
    </div>
  );
}
