'use client';

import { useSubscriptions } from '@/hooks/useAppData';
import SettingsContent from './SettingsContent';

// Skeleton loader
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

export default function SettingsPage() {
  const { subscriptions, user, isLoading, mutate } = useSubscriptions();

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative z-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">Configurações</h1>
        <p className="text-dark-300 mt-1">
          Gerencie sua conta e dispositivos
        </p>
      </div>

      {isLoading || !user ? (
        <SettingsSkeleton />
      ) : (
        <SettingsContent 
          user={user}
          subscriptions={subscriptions}
          onMutate={mutate}
        />
      )}
    </main>
  );
}
