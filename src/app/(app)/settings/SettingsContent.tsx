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

  const getDeviceInfo = (ua: string | null): { icon: React.ReactNode; name: string } => {
    if (!ua) return { 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ), 
      name: 'Dispositivo desconhecido' 
    };
    
    if (ua.includes('iPhone')) return { 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ), 
      name: 'iPhone' 
    };
    if (ua.includes('iPad')) return { 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ), 
      name: 'iPad' 
    };
    if (ua.includes('Android')) return { 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ), 
      name: 'Android' 
    };
    if (ua.includes('Windows')) return { 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ), 
      name: 'Windows' 
    };
    if (ua.includes('Mac')) return { 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ), 
      name: 'Mac' 
    };
    if (ua.includes('Linux')) return { 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ), 
      name: 'Linux' 
    };
    
    return { 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ), 
      name: 'Navegador' 
    };
  };

  return (
    <div className="space-y-6">
      {/* Account Section */}
      <section className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent-bright/20 flex items-center justify-center text-accent-light">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-dark-50">Conta</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-dark-900/50 rounded-lg border border-white/5">
            <label className="text-xs text-dark-400 uppercase tracking-wide font-medium">Email</label>
            <p className="text-dark-50 mt-1">{user.email}</p>
          </div>
          <div className="p-4 bg-dark-900/50 rounded-lg border border-white/5">
            <label className="text-xs text-dark-400 uppercase tracking-wide font-medium">ID do Usuário</label>
            <p className="text-dark-400 text-sm font-mono mt-1">{user.id}</p>
          </div>
        </div>
      </section>

      {/* Push Subscriptions Section */}
      <section className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center text-blue-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark-50">Dispositivos Registrados</h2>
            <p className="text-sm text-dark-400">
              Dispositivos que receberão notificações push
            </p>
          </div>
        </div>
        
        {subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const device = getDeviceInfo(sub.user_agent);
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg border border-white/5 group hover:border-accent/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/10 to-accent-bright/10 flex items-center justify-center text-accent-light">
                      {device.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-100">{device.name}</p>
                      <p className="text-xs text-dark-400">
                        Registrado em {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSubscription(sub.id)}
                    disabled={loading === sub.id}
                    className="px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading === sub.id ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </span>
                    ) : 'Remover'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-dark-800/50 flex items-center justify-center">
              <svg className="w-6 h-6 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-dark-300">Nenhum dispositivo registrado.</p>
            <p className="text-sm text-dark-400 mt-1">
              Ative as notificações no dashboard para receber alertas.
            </p>
          </div>
        )}
      </section>

      {/* iOS Warning */}
      <section className="card border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-amber-200">Nota para usuários iOS</h3>
            <p className="text-sm text-amber-200/70 mt-1">
              No iPhone/iPad, as notificações push só funcionam se o app estiver instalado como PWA.
            </p>
            <p className="text-sm text-amber-200/70 mt-2">
              Para instalar: Safari → <span className="text-amber-300">Compartilhar</span> → <span className="text-amber-300">Adicionar à Tela de Início</span>
            </p>
          </div>
        </div>
      </section>

      {/* Logout Section */}
      <section className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center text-red-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-dark-50">Sessão</h2>
        </div>
        <button
          onClick={handleLogout}
          className="btn-secondary text-red-400 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/10 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair da Conta
        </button>
      </section>
    </div>
  );
}
