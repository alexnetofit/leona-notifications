'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="glass-header sticky top-0 z-40 hidden sm:block">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 relative">
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-md group-hover:bg-accent/30 transition-all" />
              <Image
                src="/image/logo_login.png"
                alt="Leona"
                fill
                className="object-contain relative z-10"
                priority
              />
            </div>
            <span className="text-xl font-semibold text-dark-50">
              Leona <span className="text-gradient">Notifications</span>
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
