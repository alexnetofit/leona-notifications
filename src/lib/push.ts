import webpush from 'web-push';
import type { NotificationPayload } from '@/types';

// Configure web-push with VAPID keys
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    `mailto:admin@${process.env.APP_URL?.replace('https://', '') || 'notifications.leonaflow.com'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushResult {
  success: boolean;
  gone?: boolean; // true if 410/404 error (subscription invalid - app uninstalled)
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload
): Promise<PushResult> {
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
    return { success: true };
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    
    // 410 Gone or 404 = subscription invalid (app uninstalled)
    if (statusCode === 410 || statusCode === 404) {
      console.log('Subscription expired/invalid, marking for removal');
      return { success: false, gone: true };
    }
    
    console.error('Error sending push notification:', error);
    return { success: false };
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
