import { createClient } from '@/lib/supabase/server';
import SettingsContent from './SettingsContent';
import type { PushSubscription } from '@/types';

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative z-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">Configurações</h1>
        <p className="text-dark-300 mt-1">
          Gerencie sua conta e dispositivos
        </p>
      </div>

      <SettingsContent 
        user={user!}
        subscriptions={(subscriptions as PushSubscription[]) || []}
      />
    </main>
  );
}
