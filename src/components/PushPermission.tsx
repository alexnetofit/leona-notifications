'use client';

import { useState, useEffect } from 'react';

interface PushPermissionProps {
  onSubscribed?: () => void;
}

export default function PushPermission({ onSubscribed }: PushPermissionProps) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const subscribeToPush = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setError('Permissão negada. Ative as notificações nas configurações do navegador.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setError('Chave VAPID não configurada.');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar subscription');
      }

      onSubscribed?.();
    } catch (err) {
      console.error('Push subscription error:', err);
      setError('Erro ao ativar notificações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (permission === 'unsupported') {
    return (
      <div className="card bg-yellow-900/20 border-yellow-800/50">
        <p className="text-sm text-yellow-200">
          ⚠️ Seu navegador não suporta notificações push. Use Chrome, Firefox ou Edge.
        </p>
      </div>
    );
  }

  if (permission === 'granted') {
    return (
      <div className="card bg-accent/10 border-accent/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-accent">Notificações ativadas</p>
            <p className="text-xs text-dark-400">Este dispositivo receberá notificações push.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-dark-100">Ativar Notificações Push</h3>
          <p className="text-sm text-dark-400 mt-1">
            Receba alertas em tempo real quando seus webhooks forem acionados.
          </p>
          {error && (
            <p className="text-sm text-red-400 mt-2">{error}</p>
          )}
          <button
            onClick={subscribeToPush}
            disabled={loading}
            className="btn-primary mt-4"
          >
            {loading ? 'Ativando...' : 'Ativar Notificações'}
          </button>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
