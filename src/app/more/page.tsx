import { MoreTopBar } from "@/components/more/MoreTopBar";
import { MoreMenuList } from "@/components/more/MoreMenuList";
import { BottomNav } from "@/components/layout/BottomNav";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { PushSubscribeButton } from "@/components/push/PushSubscribeButton";
import { moreMenuItems } from "@/lib/mock-data";

export default function MorePage() {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[100px]">
      <MoreTopBar />
      <main className="flex flex-col gap-stack-lg px-margin-main pt-stack-md">
        <MoreMenuList items={moreMenuItems} />
        <PushSubscribeButton />
        <LogoutButton className="self-center text-label-sm text-muted-foreground underline" />
      </main>
      <BottomNav />
    </div>
  );
}
