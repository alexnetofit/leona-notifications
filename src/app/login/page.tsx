'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

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
          emailRedirectTo: `${window.location.origin}/dashboard`,
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-dark-900 to-dark-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <Image
              src="/image/logo.svg"
              alt="Leona"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-dark-50">
            Leona <span className="text-gradient">Notifications</span>
          </h1>
          <p className="text-dark-400 mt-2">
            Receba notificações em tempo real via webhooks
          </p>
        </div>

        {/* Login Card */}
        <div className="card">
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
                className={`p-4 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'bg-red-900/20 text-red-400 border border-red-900/50'
                }`}
              >
                {message.text}
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
                'Entrar com Magic Link'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dark-700 text-center">
            <p className="text-sm text-dark-500">
              Enviaremos um link de acesso para seu email.
              <br />
              Sem senha, sem complicação.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-600 text-xs mt-8">
          © {new Date().getFullYear()} Leona Notifications
        </p>
      </div>
    </div>
  );
}
