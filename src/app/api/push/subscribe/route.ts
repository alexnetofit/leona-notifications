import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscription, userAgent, deviceId } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Subscription inválida' },
        { status: 400 }
      );
    }

    // If we have a deviceId, remove old subscriptions from the same device
    // This prevents duplicates when user reinstalls or clears push data
    // but keeps localStorage (where deviceId is stored)
    if (deviceId) {
      // Get all subscriptions for this user with the same deviceId
      const { data: existingSubscriptions } = await supabase
        .from('push_subscriptions')
        .select('id, endpoint, device_id')
        .eq('user_id', user.id)
        .eq('device_id', deviceId);

      if (existingSubscriptions && existingSubscriptions.length > 0) {
        // Find subscriptions with different endpoint (old ones)
        const duplicates = existingSubscriptions.filter(
          sub => sub.endpoint !== subscription.endpoint
        );

        // Remove old subscriptions from the same device
        if (duplicates.length > 0) {
          const idsToDelete = duplicates.map(d => d.id);
          await supabase
            .from('push_subscriptions')
            .delete()
            .in('id', idsToDelete);
        }
      }
    }

    // Upsert subscription (update if exists, insert if not)
    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        user_agent: userAgent || null,
        device_id: deviceId || null,
      },
      {
        onConflict: 'user_id,endpoint',
      }
    );

    if (error) {
      console.error('Error saving subscription:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
