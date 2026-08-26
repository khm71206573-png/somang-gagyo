import { GuideTopBar } from "@/components/guide/GuideTopBar";
import { GuideCardDeck } from "@/components/guide/GuideCardDeck";

export default function GuidePage() {
  return (
    // 카드가 한 장씩 화면에 꽉 차도록 페이지 자체는 스크롤하지 않는다.
    <div className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-background">
      <GuideTopBar />
      <GuideCardDeck />
    </div>
  );
}
