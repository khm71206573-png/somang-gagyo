import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col items-center justify-center gap-4 bg-background px-margin-main text-center">
      <WifiOff className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
      <div>
        <p className="text-title-lg text-foreground">오프라인 상태예요</p>
        <p className="mt-2 text-body-md text-muted-foreground">
          인터넷 연결을 확인해주세요. 이전에 열어본 오늘의 묵상과 통독
          분량은 오프라인에서도 볼 수 있어요.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        홈으로 가기
      </Link>
    </div>
  );
}
