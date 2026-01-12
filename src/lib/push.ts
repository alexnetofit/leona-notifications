import webpush from 'web-push';
import type { NotificationPayload } from '@/types';

// Configure web-push with VAPID keys
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    `mailto:admin@${process.env.APP_URL?.replace('https://', '') || 'leona.vercel.app'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

export function buildNotificationPayload(
  title: string,
  body: string
): NotificationPayload {
  return {
    title,
    body,
    icon: '/image/notification_logo_1.png',
    badge: '/image/notification_logo_1.png',
    data: {
      url: '/dashboard',
    },
  };
}
