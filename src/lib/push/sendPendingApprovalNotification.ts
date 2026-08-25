import { createServiceClient } from "@/lib/supabase/service";
import { isGoneSubscriptionError, sendPushNotification } from "./webPush";

export interface SendPendingApprovalNotificationInput {
  /** 가입을 신청한 사람의 이름 */
  name: string;
  /** 소속 가교 (없으면 문구에서 생략) */
  groupName?: string | null;
}

export interface SendPendingApprovalNotificationResult {
  sent: number;
  failed: number;
}

/**
 * 새 가입 신청이 들어오면 승인 권한이 있는 관리자들의 휴대폰으로 푸시를 보낸다.
 * 알림을 켜지 않은 관리자는 자연스럽게 건너뛰고, 만료된 구독은 정리한다.
 */
export async function sendPendingApprovalNotification({
  name,
  groupName,
}: SendPendingApprovalNotificationInput): Promise<SendPendingApprovalNotificationResult> {
  const supabase = createServiceClient();

  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .eq("status", "approved");

  const adminIds = (admins ?? []).map((admin) => admin.id as string);
  if (adminIds.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .in("member_id", adminIds);

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
            title: "가입 승인 요청",
            body: groupName
              ? `${name}님(${groupName})이 가입을 신청했어요.`
              : `${name}님이 가입을 신청했어요.`,
            url: "/admin",
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
