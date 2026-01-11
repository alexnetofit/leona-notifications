'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  showLogout?: boolean;
}

export default function Header({ showLogout = true }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-dark-800 border-b border-dark-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/image/logo.svg"
                alt="Leona"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-semibold text-dark-50">
              Leona <span className="text-accent">Notifications</span>
            </span>
          </Link>

          {showLogout && (
            <nav className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-dark-300 hover:text-dark-100 transition-colors text-sm"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="text-dark-300 hover:text-dark-100 transition-colors text-sm"
              >
                Configurações
              </Link>
              <button
                onClick={handleLogout}
                className="text-dark-400 hover:text-dark-200 transition-colors text-sm"
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
