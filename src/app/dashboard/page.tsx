import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import EndpointCard from '@/components/EndpointCard';
import PushPermission from '@/components/PushPermission';
import type { Endpoint } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: endpoints } = await supabase
    .from('endpoints')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const appUrl = process.env.APP_URL || 'https://leona.vercel.app';

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Push Permission Banner */}
        <section className="mb-8">
          <PushPermission />
        </section>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark-50">Seus Endpoints</h1>
            <p className="text-dark-400 mt-1">
              Gerencie seus webhooks e receba notificações em tempo real
            </p>
          </div>
          <Link href="/endpoints/new" className="btn-primary">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Endpoint
            </span>
          </Link>
        </div>

        {/* Endpoints Grid */}
        {endpoints && endpoints.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {endpoints.map((endpoint: Endpoint) => (
              <EndpointCard
                key={endpoint.id}
                endpoint={endpoint}
                appUrl={appUrl}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-dark-200 mb-2">Nenhum endpoint criado</h3>
            <p className="text-dark-400 mb-6">
              Crie seu primeiro endpoint para começar a receber notificações.
            </p>
            <Link href="/endpoints/new" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Criar Primeiro Endpoint
            </Link>
          </div>
        )}

        {/* Info Section */}
        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center mb-4">
              <span className="text-xl">🔌</span>
            </div>
            <h3 className="font-medium text-dark-100 mb-2">Desconexão</h3>
            <p className="text-sm text-dark-400">
              Receba alertas quando uma instância desconectar do sistema.
            </p>
          </div>
          
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center mb-4">
              <span className="text-xl">💰</span>
            </div>
            <h3 className="font-medium text-dark-100 mb-2">Venda Aprovada</h3>
            <p className="text-sm text-dark-400">
              Seja notificado instantaneamente quando uma venda for aprovada.
            </p>
          </div>
          
          <div className="card">
            <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center mb-4">
              <span className="text-xl">📨</span>
            </div>
            <h3 className="font-medium text-dark-100 mb-2">Genérico</h3>
            <p className="text-sm text-dark-400">
              Crie notificações personalizadas para qualquer tipo de evento.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
