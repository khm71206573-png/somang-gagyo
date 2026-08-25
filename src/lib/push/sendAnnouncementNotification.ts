import { createServiceClient } from "@/lib/supabase/service";
import { isGoneSubscriptionError, sendPushNotification } from "./webPush";

export interface SendAnnouncementNotificationInput {
  announcementId: string;
  title: string;
  /** 투표 공지면 알림 문구를 투표에 맞게 바꾼다. */
  isPoll: boolean;
  /** 공지를 올린 관리자. 본인에게는 보내지 않는다. */
  authorId: string;
}

export interface SendAnnouncementNotificationResult {
  sent: number;
  failed: number;
}

/**
 * 새 공지사항이 올라오면 승인된 교인 전원의 휴대폰으로 푸시를 보낸다.
 * 푸시 구독이 없는 교인은 자연스럽게 건너뛰고, 만료된 구독은 정리한다.
 */
export async function sendAnnouncementNotification({
  announcementId,
  title,
  isPoll,
  authorId,
}: SendAnnouncementNotificationInput): Promise<SendAnnouncementNotificationResult> {
  const supabase = createServiceClient();

  const [{ data: approvedProfiles }, { data: subscriptions }] = await Promise.all([
    supabase.from("profiles").select("id").eq("status", "approved"),
    supabase.from("push_subscriptions").select("id, member_id, endpoint, p256dh, auth"),
  ]);

  const approvedIds = new Set((approvedProfiles ?? []).map((profile) => profile.id));
  const targets = (subscriptions ?? []).filter(
    (subscription) =>
      approvedIds.has(subscription.member_id) && subscription.member_id !== authorId,
  );

  if (targets.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  const staleSubscriptionIds = new Set<string>();

  await Promise.all(
    targets.map(async (target) => {
      try {
        await sendPushNotification(
          {
            endpoint: target.endpoint,
            keys: { p256dh: target.p256dh, auth: target.auth },
          },
          {
            title: isPoll ? "새 투표가 올라왔어요" : "새 공지사항이 올라왔어요",
            body: title,
            url: `/announcement/${announcementId}`,
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
