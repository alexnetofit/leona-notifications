'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp' | 'no-subscription'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = useMemo(() => createClient(), []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus first OTP input when step changes
  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  // Check Stripe subscription before sending OTP
  const checkSubscription = async (userEmail: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/stripe/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      return data.hasActiveSubscription === true;
    } catch (error) {
      console.error('Subscription check error:', error);
      // In case of error, allow login (fail open)
      return true;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // First, check Stripe subscription
      const hasSubscription = await checkSubscription(email);
      
      if (!hasSubscription) {
        setStep('no-subscription');
        setLoading(false);
        return;
      }

      // If subscription is active, proceed with OTP
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setStep('otp');
      setCountdown(60);
      setMessage({
        type: 'success',
        text: 'Código enviado! Verifique seu email.',
      });
    } catch (error: unknown) {
      console.error('OTP error:', error);
      
      // Check for rate limit error
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('security purposes') || errorMessage.includes('rate limit')) {
        const seconds = errorMessage.match(/after (\d+) seconds/)?.[1] || '60';
        setMessage({
          type: 'error',
          text: `Aguarde ${seconds} segundos antes de solicitar outro código.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Erro ao enviar código. Tente novamente.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length !== 6) {
      setMessage({ type: 'error', text: 'Digite o código completo.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (error) throw error;

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Verify error:', error);
      setMessage({
        type: 'error',
        text: 'Código inválido ou expirado.',
      });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    
    // Handle paste
    if (value.length > 1) {
      const digits = value.slice(0, 6).split('');
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;

      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setMessage({
        type: 'success',
        text: 'Novo código enviado!',
      });
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      console.error('Resend error:', error);
      
      // Check for rate limit error
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('security purposes') || errorMessage.includes('rate limit')) {
        const seconds = errorMessage.match(/after (\d+) seconds/)?.[1] || '60';
        setCountdown(parseInt(seconds));
        setMessage({
          type: 'error',
          text: `Aguarde ${seconds} segundos antes de reenviar.`,
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Erro ao reenviar código. Tente novamente.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('email');
    setOtp(['', '', '', '', '', '']);
    setMessage(null);
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
          {step === 'email' ? (
            // Step 1: Email
            <form onSubmit={handleSendOtp} className="space-y-6">
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Enviar Código
                  </span>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-dark-400">
                  Enviaremos um código de 6 dígitos para seu email.
                </p>
              </div>
            </form>
          ) : step === 'no-subscription' ? (
            // Step: No Subscription
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-dark-50 mb-3">
                Assinatura não encontrada
              </h2>
              
              <p className="text-dark-300 mb-6">
                Não foi encontrada uma assinatura ativa do Leona para o email <span className="text-accent-light">{email}</span>.
              </p>
              
              <p className="text-dark-400 text-sm mb-6">
                Para utilizar o Leona Notifications, é necessário ter uma assinatura ativa.
              </p>

              <a
                href="https://leonasolutions.io/register"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Fazer cadastro
              </a>

              <button
                type="button"
                onClick={handleBack}
                className="mt-4 text-sm text-dark-400 hover:text-accent-light transition-colors cursor-pointer"
              >
                Tentar com outro email
              </button>
            </div>
          ) : (
            // Step 2: OTP Code
            <form onSubmit={handleVerifyOtp} className="space-y-6 relative z-10">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-dark-200">
                    Código de Verificação
                  </label>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-dark-400 hover:text-accent-light transition-colors relative z-20 cursor-pointer"
                  >
                    Trocar email
                  </button>
                </div>
                <p className="text-xs text-dark-400 mb-4">
                  Enviado para <span className="text-accent-light">{email}</span>
                </p>
                
                {/* OTP Inputs */}
                <div className="flex justify-center gap-2 sm:gap-3 relative z-10">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        if (pastedData) {
                          const newOtp = [...otp];
                          pastedData.split('').forEach((char, i) => {
                            if (i < 6) newOtp[i] = char;
                          });
                          setOtp(newOtp);
                          const nextIndex = Math.min(pastedData.length, 5);
                          inputRefs.current[nextIndex]?.focus();
                        }
                      }}
                      className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold bg-dark-800/50 border border-dark-600/50 rounded-xl text-dark-50 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all cursor-text"
                      disabled={loading}
                    />
                  ))}
                </div>
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
                disabled={loading || otp.join('').length !== 6}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verificar Código
                  </span>
                )}
              </button>

              <div className="text-center relative z-20">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  className={`text-sm transition-colors cursor-pointer ${
                    countdown > 0
                      ? 'text-dark-500 cursor-not-allowed'
                      : 'text-accent-light hover:text-accent'
                  }`}
                >
                  {countdown > 0 ? (
                    <>Reenviar código em {countdown}s</>
                  ) : (
                    <>Reenviar código</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-xs mt-8">
          © {new Date().getFullYear()} Leona Notifications
        </p>
      </div>
    </div>
  );
}
