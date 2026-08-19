import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  isGoneSubscriptionError,
  sendPushNotification,
} from "@/lib/push/webPush";

export const dynamic = "force-dynamic";

const BATCH_SIZE = 20;

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!dueNotifications || dueNotifications.length === 0) {
    return NextResponse.json({ processed: 0, sent: 0, failed: 0 });
  }

  const [{ data: approvedProfiles }, { data: subscriptions }] = await Promise.all([
    supabase.from("profiles").select("id").eq("status", "approved"),
    supabase.from("push_subscriptions").select("id, member_id, endpoint, p256dh, auth"),
  ]);

  const approvedIds = new Set((approvedProfiles ?? []).map((p) => p.id));
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

  return NextResponse.json({
    processed: dueNotifications.length,
    sent: sentCount,
    failed: failedCount,
    removedSubscriptions: staleSubscriptionIds.size,
  });
}
