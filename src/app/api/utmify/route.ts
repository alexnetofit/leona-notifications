import { NextRequest, NextResponse } from 'next/server';

async function handleRequest(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const token = searchParams.get('token');
    const phone = searchParams.get('phone') || '';
    const priceincents = searchParams.get('priceincents');
    const name = searchParams.get('name') || 'Produto';

    // Validar parametros obrigatorios
    if (!token || !priceincents) {
      return NextResponse.json(
        { error: 'token e priceincents sao obrigatorios' },
        { status: 400 }
      );
    }

    // Gerar orderId unico e datas
    const now = new Date();
    const orderId = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0') +
      String(now.getMilliseconds()).padStart(3, '0');

    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Montar payload
    const payload = {
      orderId,
      platform: 'pixPixel',
      paymentMethod: 'pix',
      status: 'paid',
      createdAt: dateStr,
      approvedDate: dateStr,
      refundedAt: null,
      customer: {
        name: 'Nao identificado',
        email: 'nao@identificado.com.br',
        phone,
        document: null,
        country: 'BR',
        ip: ''
      },
      products: [
        {
          id: '1',
          name,
          planId: null,
          planName: null,
          quantity: 1,
          priceInCents: priceincents
        }
      ],
      trackingParameters: {
        src: null,
        sck: null,
        utm_source: null,
        utm_campaign: null,
        utm_medium: null,
        utm_content: null,
        utm_term: null
      },
      commission: {
        totalPriceInCents: priceincents,
        gatewayFeeInCents: 0,
        userCommissionInCents: priceincents
      },
      isTest: false
    };

    // Fazer POST para UTMify
    const response = await fetch('https://api.utmify.com.br/api/v1/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': token
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar requisicao' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
