import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Extract device identifier from user agent
function getDeviceIdentifier(userAgent: string | null): string | null {
  if (!userAgent) return null;
  
  // Extract key device identifiers that stay consistent
  // This helps identify the same device even with different endpoints
  const ua = userAgent.toLowerCase();
  
  // Check for specific devices/browsers
  if (ua.includes('iphone')) return 'iphone';
  if (ua.includes('ipad')) return 'ipad';
  if (ua.includes('android')) {
    // Try to get device model for Android
    const match = userAgent.match(/\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(';');
      if (parts.length >= 3) {
        return `android-${parts[2].trim().toLowerCase().replace(/\s+/g, '-')}`;
      }
    }
    return 'android';
  }
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('macintosh') || ua.includes('mac os')) return 'mac';
  if (ua.includes('linux')) return 'linux';
  
  return 'unknown';
}

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
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Subscription inválida' },
        { status: 400 }
      );
    }

    const deviceId = getDeviceIdentifier(userAgent);

    // If we can identify the device, remove old subscriptions from the same device
    // This prevents duplicates when user reinstalls or clears browser data
    if (deviceId && userAgent) {
      // Get all subscriptions for this user
      const { data: existingSubscriptions } = await supabase
        .from('push_subscriptions')
        .select('id, user_agent, endpoint')
        .eq('user_id', user.id);

      if (existingSubscriptions && existingSubscriptions.length > 0) {
        // Find subscriptions from the same device type (but different endpoint)
        const duplicates = existingSubscriptions.filter(sub => {
          if (sub.endpoint === subscription.endpoint) return false; // Keep the current one
          const subDeviceId = getDeviceIdentifier(sub.user_agent);
          return subDeviceId === deviceId;
        });

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
