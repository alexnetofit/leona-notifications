'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { PushSubscription } from '@/types';
import type { User } from '@supabase/supabase-js';

interface SettingsContentProps {
  user: User;
  subscriptions: PushSubscription[];
}

export default function SettingsContent({ user, subscriptions }: SettingsContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<number | null>(null);

  const handleRemoveSubscription = async (id: number) => {
    setLoading(id);
    try {
      await supabase.from('push_subscriptions').delete().eq('id', id);
      router.refresh();
    } catch (err) {
      console.error('Error removing subscription:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const parseUserAgent = (ua: string | null): string => {
    if (!ua) return 'Dispositivo desconhecido';
    
    if (ua.includes('iPhone')) return '📱 iPhone';
    if (ua.includes('iPad')) return '📱 iPad';
    if (ua.includes('Android')) return '📱 Android';
    if (ua.includes('Windows')) return '💻 Windows';
    if (ua.includes('Mac')) return '💻 Mac';
    if (ua.includes('Linux')) return '💻 Linux';
    
    return '🖥️ Navegador';
  };

  return (
    <div className="space-y-8">
      {/* Account Section */}
      <section className="card">
        <h2 className="text-lg font-semibold text-dark-100 mb-4">Conta</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-dark-400">Email</label>
            <p className="text-dark-100">{user.email}</p>
          </div>
          <div>
            <label className="text-sm text-dark-400">ID do Usuário</label>
            <p className="text-dark-500 text-sm font-mono">{user.id}</p>
          </div>
        </div>
      </section>

      {/* Push Subscriptions Section */}
      <section className="card">
        <h2 className="text-lg font-semibold text-dark-100 mb-4">
          Dispositivos Registrados
        </h2>
        <p className="text-sm text-dark-400 mb-4">
          Dispositivos que receberão notificações push quando seus webhooks forem acionados.
        </p>
        
        {subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-4 bg-dark-850 rounded-lg border border-dark-700"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{parseUserAgent(sub.user_agent).split(' ')[0]}</span>
                  <div>
                    <p className="text-sm text-dark-200">
                      {parseUserAgent(sub.user_agent).split(' ').slice(1).join(' ') || 'Dispositivo'}
                    </p>
                    <p className="text-xs text-dark-500">
                      Registrado em {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSubscription(sub.id)}
                  disabled={loading === sub.id}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  {loading === sub.id ? 'Removendo...' : 'Remover'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-dark-400">
            <p>Nenhum dispositivo registrado.</p>
            <p className="text-sm mt-1">
              Ative as notificações no dashboard para receber alertas.
            </p>
          </div>
        )}
      </section>

      {/* iOS Warning */}
      <section className="card bg-yellow-900/10 border-yellow-800/30">
        <div className="flex items-start gap-3">
          <span className="text-xl">📱</span>
          <div>
            <h3 className="font-medium text-yellow-200">Nota para usuários iOS</h3>
            <p className="text-sm text-yellow-200/70 mt-1">
              No iPhone/iPad, as notificações push só funcionam se o app estiver instalado como PWA.
              <br />
              Para instalar: abra o Safari → Compartilhar → Adicionar à Tela de Início.
            </p>
          </div>
        </div>
      </section>

      {/* Logout Section */}
      <section className="card">
        <h2 className="text-lg font-semibold text-dark-100 mb-4">Sessão</h2>
        <button
          onClick={handleLogout}
          className="btn-secondary text-red-400 hover:text-red-300 hover:border-red-800"
        >
          Sair da Conta
        </button>
      </section>
    </div>
  );
}
