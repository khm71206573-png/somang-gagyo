import { createServiceClient } from "@/lib/supabase/service";
import { isGoneSubscriptionError, sendPushNotification } from "./webPush";

export interface SendCheerResult {
  sent: number;
  failed: number;
}

/**
 * 같은 통독 플랜을 읽는 다른 교인들에게 응원 푸시를 보낸다.
 * 푸시 구독이 없는 교인은 자연스럽게 건너뛰고, 만료된 구독은 정리한다.
 */
export async function sendCheerNotifications(
  planId: string,
  senderId: string,
  senderName: string,
): Promise<SendCheerResult> {
  const supabase = createServiceClient();

  const { data: planMembers } = await supabase
    .from("member_plans")
    .select("member_id")
    .eq("plan_id", planId)
    .eq("is_active", true);

  const targetIds = (planMembers ?? [])
    .map((row) => row.member_id as string)
    .filter((id) => id !== senderId);

  if (targetIds.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("member_id", targetIds);

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  const staleSubscriptionIds = new Set<string>();

  await Promise.all(
    subscriptions.map(async (target) => {
      try {
        await sendPushNotification(
          {
            endpoint: target.endpoint,
            keys: { p256dh: target.p256dh, auth: target.auth },
          },
          {
            title: "통독 응원이 도착했어요",
            body: `${senderName}님이 함께 읽는 분들을 응원했어요!`,
            url: "/bible-progress",
          },
        );
        sent += 1;
      } catch (error) {
        failed += 1;
        if (isGoneSubscriptionError(error)) {
          staleSubscriptionIds.add(target.id);
        }
      }
    }),
  );

  if (staleSubscriptionIds.size > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", Array.from(staleSubscriptionIds));
  }

  return { sent, failed };
}
