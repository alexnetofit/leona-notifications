import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendPushNotification, buildNotificationPayload } from '@/lib/push';
import type { Endpoint, PushSubscription, DisconnectedPayload } from '@/types';

// Create a service client for webhook routes (bypasses RLS)
async function createServiceClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );
}

async function handleWebhook(request: NextRequest, endpointId: string) {
  const supabase = await createServiceClient();
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // Validate token
  if (!token) {
    return NextResponse.json(
      { error: 'Token não fornecido' },
      { status: 401 }
    );
  }

  // Get endpoint
  const { data: endpoint, error: endpointError } = await supabase
    .from('endpoints')
    .select('*')
    .eq('id', endpointId)
    .single();

  if (endpointError || !endpoint) {
    return NextResponse.json(
      { error: 'Endpoint não encontrado' },
      { status: 404 }
    );
  }

  // Validate secret
  if (endpoint.secret !== token) {
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    );
  }

  // Parse request body and query
  let payload: Record<string, unknown> | null = null;
  const query: Record<string, string> = {};

  try {
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      payload = await request.json();
    }
  } catch {
    // No JSON body, that's fine
  }

  url.searchParams.forEach((value, key) => {
    if (key !== 'token') {
      query[key] = value;
    }
  });

  // Build notification based on endpoint type
  let title: string;
  let body: string;

  const typedEndpoint = endpoint as Endpoint;

  switch (typedEndpoint.type) {
    case 'disconnected': {
      const data = payload as DisconnectedPayload | null;
      if (data?.event === 'disconnected' && data?.instance_name) {
        title = `🚨 Atenção! ${data.instance_name} desconectou!`;
        body = `O número ${data.instance_number || 'desconhecido'} precisa de atenção`;
      } else {
        title = '🚨 Atenção! Instância desconectou!';
        body = 'Abra o painel para ver detalhes.';
      }
      break;
    }
    case 'sale_approved': {
      const valor = query.valor || '(não informado)';
      title = '🤑 Venda Aprovada!';
      body = `Valor: ${valor}`;
      break;
    }
    case 'generic': {
      title = typedEndpoint.generic_title || '📨 Nova Notificação';
      body = typedEndpoint.generic_body || 'Você recebeu uma nova notificação.';
      break;
    }
    default:
      title = '🔔 Notificação';
      body = 'Você recebeu uma nova notificação.';
  }

  // Get user's push subscriptions
  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', typedEndpoint.user_id);

  if (subError) {
    console.error('Error fetching subscriptions:', subError);
  }

  // Send push notifications to all devices
  let sent = false;
  let errorMessage: string | null = null;

  if (subscriptions && subscriptions.length > 0) {
    const notificationPayload = buildNotificationPayload(title, body);
    
    const results = await Promise.all(
      (subscriptions as PushSubscription[]).map(async (sub) => {
        try {
          return await sendPushNotification(
            {
              endpoint: sub.endpoint,
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
            notificationPayload
          );
        } catch (err) {
          console.error('Push error for subscription:', sub.id, err);
          return false;
        }
      })
    );

    sent = results.some(Boolean);
    if (!sent) {
      errorMessage = 'Falha ao enviar para todos os dispositivos';
    }
  } else {
    errorMessage = 'Nenhum dispositivo registrado';
  }

  // Log webhook event
  await supabase.from('webhook_logs').insert({
    endpoint_id: endpointId,
    payload,
    query,
    sent,
    error: errorMessage,
  });

  return NextResponse.json({
    success: sent,
    message: sent ? 'Notificação enviada' : 'Nenhuma notificação enviada',
    devices: subscriptions?.length || 0,
    error: errorMessage,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  const { endpointId } = await params;
  return handleWebhook(request, endpointId);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ endpointId: string }> }
) {
  const { endpointId } = await params;
  return handleWebhook(request, endpointId);
}
