import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col justify-center gap-8 bg-background px-margin-main">
      <div className="text-center">
        <h1 className="font-heading text-headline-md text-primary">
          가입 정보 입력
        </h1>
        <p className="mt-2 text-body-md text-muted-foreground">
          관리자가 확인할 수 있도록 실명과 소속 가교를 알려주세요.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
