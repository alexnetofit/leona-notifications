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
    <>
      {/* Header Desktop Only */}
      <header className="glass-header sticky top-0 z-40 hidden sm:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-3 group">
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

            {/* Desktop Navigation */}
            {showLogout && (
              <nav className="flex items-center gap-2">
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

      {/* Mobile Bottom Navigation */}
      {showLogout && (
        <nav className="fixed bottom-0 left-0 right-0 sm:hidden glass-header border-t border-white/10 z-50 pb-5">
          <div className="flex items-center justify-around py-3">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                isActive('/dashboard')
                  ? 'text-accent-light bg-accent/10'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Início</span>
            </Link>
            <Link
              href="/settings"
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                isActive('/settings')
                  ? 'text-accent-light bg-accent/10'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium">Config</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-dark-400 hover:text-red-400 transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs font-medium">Sair</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
