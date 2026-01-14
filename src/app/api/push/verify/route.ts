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
    const results: { id: number; status: string; error?: string }[] = [];

    // Test each subscription with a real test notification
    for (const sub of subscriptions) {
      try {
        // Send a real test notification to verify
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({ 
            type: 'verify',
            title: 'Verificação',
            body: 'Teste de conectividade',
            silent: true // Custom flag to suppress display in service worker
          }),
          {
            TTL: 60, // Give 60 seconds to deliver
            urgency: 'high',
          }
        );
        results.push({ id: sub.id, status: 'valid' });
      } catch (error: unknown) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        const errorMessage = (error as Error)?.message || 'Unknown error';
        
        console.log(`Subscription ${sub.id} verification failed:`, {
          statusCode,
          message: errorMessage,
          endpoint: sub.endpoint.substring(0, 50) + '...'
        });
        
        results.push({ 
          id: sub.id, 
          status: 'invalid', 
          error: `${statusCode}: ${errorMessage}` 
        });
        
        // Mark as invalid for any error response
        // 410 = Gone (unsubscribed)
        // 404 = Not found
        // 401 = Unauthorized
        // 403 = Forbidden
        // Any 4xx or 5xx = problem
        if (statusCode) {
          invalidIds.push(sub.id);
        }
      }
    }

    console.log('Verification results:', JSON.stringify(results, null, 2));

    // Remove invalid subscriptions
    if (invalidIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('id', invalidIds);
      
      if (deleteError) {
        console.error('Error deleting invalid subscriptions:', deleteError);
      }
    }

    return NextResponse.json({
      success: true,
      message: invalidIds.length > 0 
        ? `${invalidIds.length} dispositivo(s) inválido(s) removido(s)`
        : 'Todos os dispositivos estão válidos',
      removed: invalidIds.length,
      total: subscriptions.length,
      details: results, // Include details for debugging
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar dispositivos' },
      { status: 500 }
    );
  }
}
