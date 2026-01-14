'use client';

import Link from 'next/link';
import EndpointCard from '@/components/EndpointCard';
import PushPermission from '@/components/PushPermission';
import { useEndpoints } from '@/hooks/useAppData';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://notifications.leonaflow.com';

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

export default function DashboardPage() {
  const { endpoints, isLoading, mutate } = useEndpoints();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative z-10">
      {/* Push Permission Banner */}
      <section className="mb-8">
        <PushPermission onSubscribed={() => mutate()} />
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
      {isLoading ? (
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
              onDelete={() => mutate()}
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
    </main>
  );
}
