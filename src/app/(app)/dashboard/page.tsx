'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import EndpointCard from '@/components/EndpointCard';
import PushPermission from '@/components/PushPermission';
import Header from '@/components/Header';
import SettingsContent from '../settings/SettingsContent';
import { useEndpoints, useSubscriptions } from '@/hooks/useAppData';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://notifications.leonaflow.com';

type Tab = 'dashboard' | 'settings';

// Skeleton loader for cards
function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-dark-700/50" />
        <div>
          <div className="w-32 h-5 rounded bg-dark-700/50 mb-2" />
          <div className="w-24 h-4 rounded bg-dark-700/50" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="w-full h-16 rounded-lg bg-dark-700/50" />
        <div className="w-full h-10 rounded-lg bg-dark-700/50" />
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-dark-700/50" />
            <div className="w-40 h-5 rounded bg-dark-700/50" />
          </div>
          <div className="space-y-3">
            <div className="w-full h-4 rounded bg-dark-700/50" />
            <div className="w-3/4 h-4 rounded bg-dark-700/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'settings' ? 'settings' : 'dashboard';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  
  const { endpoints, isLoading: endpointsLoading, mutate: mutateEndpoints } = useEndpoints();
  const { subscriptions, user, isLoading: subscriptionsLoading, mutate: mutateSubscriptions } = useSubscriptions();

  // Sync tab with URL on mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'settings') {
      setActiveTab('settings');
    }
  }, [searchParams]);

  // Update URL without navigation (for sharing/bookmarking)
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    const url = tab === 'settings' ? '/dashboard?tab=settings' : '/dashboard';
    window.history.replaceState({}, '', url);
  };

  return (
    <>
      {/* Header with tabs */}
      <Header activeTab={activeTab} onTabChange={switchTab} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative z-10">
        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Push Permission Banner */}
            <section className="mb-8">
              <PushPermission onSubscribed={() => mutateSubscriptions()} />
            </section>

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">
                  Suas Notificações
                </h1>
                <p className="text-dark-300 mt-1">
                  Gerencie suas notificações e receba alertas em tempo real
                </p>
              </div>
              <Link href="/endpoints/new" className="btn-primary shrink-0">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nova Notificação
                </span>
              </Link>
            </div>

            {/* Endpoints Grid */}
            {endpointsLoading ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : endpoints.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {endpoints.map((endpoint) => (
                  <EndpointCard
                    key={endpoint.id}
                    endpoint={endpoint}
                    appUrl={APP_URL}
                    onDelete={() => mutateEndpoints()}
                  />
                ))}
              </div>
            ) : (
              <div className="card text-center py-12 glow-border">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-accent-bright/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-dark-100 mb-2">Nenhuma notificação criada</h3>
                <p className="text-dark-300 mb-6">
                  Crie sua primeira notificação para começar a receber alertas.
                </p>
                <Link href="/endpoints/new" className="btn-primary inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Criar Primeira Notificação
                </Link>
              </div>
            )}

            {/* Info Section */}
            <section className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="card card-hover group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                  </svg>
                </div>
                <h3 className="font-semibold text-dark-50 mb-2">Desconexão</h3>
                <p className="text-sm text-dark-300">
                  Receba alertas quando uma instância desconectar do sistema.
                </p>
              </div>
              
              <div className="card card-hover group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-dark-50 mb-2">Venda Aprovada</h3>
                <p className="text-sm text-dark-300">
                  Seja notificado instantaneamente quando uma venda for aprovada.
                </p>
              </div>
              
              <div className="card card-hover group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-dark-50 mb-2">Genérico</h3>
                <p className="text-sm text-dark-300">
                  Crie notificações personalizadas para qualquer tipo de evento.
                </p>
              </div>
            </section>

            {/* Tutorial Video */}
            <section className="mt-12">
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center text-red-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-dark-50">Tutorial</h2>
                    <p className="text-sm text-dark-400">Aprenda a configurar suas notificações</p>
                  </div>
                </div>
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-dark-900/50">
                  <iframe
                    src="https://www.youtube.com/embed/oZdVTxLj2LA?start=14"
                    title="Tutorial Leona Notifications"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl">
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">Configurações</h1>
              <p className="text-dark-300 mt-1">
                Gerencie sua conta e dispositivos
              </p>
            </div>

            {subscriptionsLoading || !user ? (
              <SettingsSkeleton />
            ) : (
              <SettingsContent 
                user={user}
                subscriptions={subscriptions}
                onMutate={mutateSubscriptions}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation - Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 sm:hidden glass-header border-t border-white/10 z-50 pb-5">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => switchTab('dashboard')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-accent-light bg-accent/10'
                : 'text-dark-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Início</span>
          </button>
          <button
            onClick={() => switchTab('settings')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'text-accent-light bg-accent/10'
                : 'text-dark-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">Config</span>
          </button>
        </div>
      </nav>
    </>
  );
}
