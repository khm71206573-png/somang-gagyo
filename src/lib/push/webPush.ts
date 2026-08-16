import webPush, { WebPushError } from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export interface PushSubscriptionKeys {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification(
  subscription: PushSubscriptionKeys,
  payload: PushPayload,
) {
  ensureConfigured();
  return webPush.sendNotification(subscription, JSON.stringify(payload));
}

export function isGoneSubscriptionError(error: unknown) {
  return (
    error instanceof WebPushError &&
    (error.statusCode === 404 || error.statusCode === 410)
  );
}
