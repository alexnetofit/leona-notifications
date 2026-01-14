import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import webpush from 'web-push';

// Configure web-push
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    `mailto:admin@${process.env.APP_URL?.replace('https://', '') || 'notifications.leonaflow.com'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Get all subscriptions for user
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.id);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Erro ao buscar dispositivos' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum dispositivo para verificar',
        removed: 0,
        total: 0,
      });
    }

    const invalidIds: number[] = [];

    // Test each subscription with a silent/empty push
    for (const sub of subscriptions) {
      try {
        // Send a minimal test notification
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({ type: 'verify' }), // Silent verification
          {
            TTL: 0, // Don't store if device is offline
          }
        );
      } catch (error: unknown) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        console.log(`Subscription ${sub.id} error:`, statusCode, (error as Error)?.message);
        
        // Any error means the subscription is likely invalid
        // 410 Gone, 404 Not Found, 401 Unauthorized, etc.
        if (statusCode && (statusCode === 410 || statusCode === 404 || statusCode === 401 || statusCode >= 400)) {
          invalidIds.push(sub.id);
        }
      }
    }

    // Remove invalid subscriptions
    if (invalidIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', invalidIds);
    }

    return NextResponse.json({
      success: true,
      message: invalidIds.length > 0 
        ? `${invalidIds.length} dispositivo(s) inválido(s) removido(s)`
        : 'Todos os dispositivos estão válidos',
      removed: invalidIds.length,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar dispositivos' },
      { status: 500 }
    );
  }
}
