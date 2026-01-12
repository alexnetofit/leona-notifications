'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  showLogout?: boolean;
}

export default function Header({ showLogout = true }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="glass-header sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 relative">
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-md group-hover:bg-accent/30 transition-all" />
              <Image
                src="/image/logo.png"
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

          {showLogout && (
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/dashboard')
                    ? 'bg-accent/20 text-accent-light'
                    : 'text-dark-300 hover:text-dark-50 hover:bg-white/5'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive('/settings')
                    ? 'bg-accent/20 text-accent-light'
                    : 'text-dark-300 hover:text-dark-50 hover:bg-white/5'
                }`}
              >
                Configurações
              </Link>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-2 rounded-lg text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                Sair
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
