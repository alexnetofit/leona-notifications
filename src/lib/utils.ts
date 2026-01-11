import { nanoid } from 'nanoid';

export function generateEndpointId(): string {
  return nanoid(12);
}

export function generateSecret(): string {
  return nanoid(32);
}

export function getWebhookUrl(endpointId: string, secret: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || '';
  return `${baseUrl}/api/webhook/${endpointId}?token=${secret}`;
}

export function formatEndpointType(type: string): string {
  const types: Record<string, string> = {
    disconnected: '🔌 Desconexão',
    sale_approved: '💰 Venda Aprovada',
    generic: '📨 Genérico',
  };
  return types[type] || type;
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
