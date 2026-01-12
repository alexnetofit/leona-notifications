'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import InstallPrompt from '@/components/InstallPrompt';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Link de acesso enviado! Verifique seu email.',
      });
      setEmail('');
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao enviar link. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-cosmic particles-bg relative overflow-hidden">
      {/* Glowing orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      
      {/* Wave lines effect */}
      <div className="wave-lines" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 relative animate-float">
            <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl" />
            <Image
              src="/image/logo_login.png"
              alt="Leona"
              fill
              className="object-contain relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-dark-50 mb-2">
            Leona
          </h1>
          <p className="text-xl text-gradient-glow font-medium">
            Notifications
          </p>
          <p className="text-dark-300 mt-3 text-sm">
            Receba notificações em tempo real via webhooks
          </p>
        </div>

        {/* Login Card */}
        <div className="card glow-border">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-200 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="input"
                disabled={loading}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg text-sm backdrop-blur-sm ${
                  message.type === 'success'
                    ? 'bg-accent/10 text-accent-light border border-accent/30'
                    : 'bg-red-900/20 text-red-400 border border-red-900/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {message.text}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Entrar com Magic Link
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-dark-400">
              Enviaremos um link de acesso para seu email.
              <br />
              <span className="text-dark-300">Sem senha, sem complicação.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-xs mt-8">
          © {new Date().getFullYear()} Leona Notifications
        </p>
      </div>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
