import { createServiceClient } from "@/lib/supabase/service";
import { isGoneSubscriptionError, sendPushNotification } from "./webPush";

const BATCH_SIZE = 20;

export interface ProcessDueNotificationsResult {
  processed: number;
  sent: number;
  failed: number;
  removedSubscriptions: number;
}

/**
 * 발송 시각이 도래한 예약 알림을 승인된 교인 전원에게 발송하고 sent_at을 기록한다.
 * Cron·관리자 수동 발송 버튼 양쪽에서 동일한 발송 로직을 쓰기 위한 공용 함수.
 */
export async function processDueNotifications(): Promise<ProcessDueNotificationsResult> {
  const supabase = createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: dueNotifications, error: fetchError } = await supabase
    .from("scheduled_notifications")
    .select("id, title, body, url")
    .is("sent_at", null)
    .lte("send_at", nowIso)
    .order("send_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!dueNotifications || dueNotifications.length === 0) {
    return { processed: 0, sent: 0, failed: 0, removedSubscriptions: 0 };
  }

  const [{ data: approvedMembers }, { data: subscriptions }] = await Promise.all([
    supabase.from("members").select("id").eq("status", "approved"),
    supabase.from("push_subscriptions").select("id, member_id, endpoint, p256dh, auth"),
  ]);

  const approvedIds = new Set((approvedMembers ?? []).map((m) => m.id));
  const targets = (subscriptions ?? []).filter((sub) => approvedIds.has(sub.member_id));

  let sentCount = 0;
  let failedCount = 0;
  const staleSubscriptionIds = new Set<string>();

  for (const notification of dueNotifications) {
    await Promise.all(
      targets.map(async (target) => {
        try {
          await sendPushNotification(
            {
              endpoint: target.endpoint,
              keys: { p256dh: target.p256dh, auth: target.auth },
            },
            {
              title: notification.title,
              body: notification.body,
              url: notification.url ?? "/",
            },
          );
          sentCount += 1;
        } catch (error) {
          failedCount += 1;
          if (isGoneSubscriptionError(error)) {
            staleSubscriptionIds.add(target.id);
          }
        }
      }),
    );

    await supabase
      .from("scheduled_notifications")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", notification.id);
  }

  if (staleSubscriptionIds.size > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", Array.from(staleSubscriptionIds));
  }

  return {
    processed: dueNotifications.length,
    sent: sentCount,
    failed: failedCount,
    removedSubscriptions: staleSubscriptionIds.size,
  };
}
