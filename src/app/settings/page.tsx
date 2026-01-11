import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import SettingsContent from './SettingsContent';
import type { PushSubscription } from '@/types';

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-50">Configurações</h1>
          <p className="text-dark-400 mt-1">
            Gerencie sua conta e dispositivos
          </p>
        </div>

        <SettingsContent 
          user={user}
          subscriptions={(subscriptions as PushSubscription[]) || []}
        />
      </main>
    </div>
  );
}
