'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';
import type { EndpointType, Endpoint } from '@/types';

export const dynamic = 'force-dynamic';

const endpointTypes: { value: EndpointType; label: string; description: string; icon: React.ReactNode; gradient: string }[] = [
  {
    value: 'disconnected',
    label: 'Desconexão',
    description: 'Alerta quando uma instância desconectar',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
    ),
    gradient: 'from-red-500/20 to-red-600/20',
  },
  {
    value: 'sale_approved',
    label: 'Venda Aprovada',
    description: 'Notifica quando uma venda for aprovada',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-green-500/20 to-emerald-600/20',
  },
  {
    value: 'generic',
    label: 'Genérico',
    description: 'Notificação personalizada para qualquer evento',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    gradient: 'from-accent/20 to-accent-bright/20',
  },
];

export default function EditEndpointPage() {
  const router = useRouter();
  const params = useParams();
  const endpointId = params.id as string;
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<EndpointType>('disconnected');
  const [saleTitle, setSaleTitle] = useState('');
  const [genericTitle, setGenericTitle] = useState('');
  const [genericBody, setGenericBody] = useState('');

  useEffect(() => {
    async function loadEndpoint() {
      try {
        const { data, error } = await supabase
          .from('endpoints')
          .select('*')
          .eq('id', endpointId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Notificação não encontrada');

        const ep = data as Endpoint;
        setEndpoint(ep);
        setName(ep.name);
        setType(ep.type);

        if (ep.type === 'sale_approved') {
          setSaleTitle(ep.generic_title || '🤑 Venda Aprovada!');
        } else if (ep.type === 'generic') {
          setGenericTitle(ep.generic_title || '');
          setGenericBody(ep.generic_body || '');
        }
      } catch (err) {
        console.error('Error loading endpoint:', err);
        setError('Erro ao carregar notificação.');
      } finally {
        setLoading(false);
      }
    }

    loadEndpoint();
  }, [endpointId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let titleToSave = null;
      let bodyToSave = null;

      if (type === 'sale_approved') {
        titleToSave = saleTitle || '🤑 Venda Aprovada!';
      } else if (type === 'generic') {
        titleToSave = genericTitle;
        bodyToSave = genericBody;
      }

      const { error: updateError } = await supabase
        .from('endpoints')
        .update({
          name,
          type,
          generic_title: titleToSave,
          generic_body: bodyToSave,
        })
        .eq('id', endpointId);

      if (updateError) throw updateError;

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error updating endpoint:', err);
      setError('Erro ao salvar notificação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const getIconColor = (typeValue: EndpointType) => {
    switch (typeValue) {
      case 'disconnected': return 'text-red-400';
      case 'sale_approved': return 'text-green-400';
      default: return 'text-accent-light';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic relative flex items-center justify-center">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="flex items-center gap-3 text-dark-300">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Carregando...
        </div>
      </div>
    );
  }

  if (!endpoint) {
    return (
      <div className="min-h-screen bg-cosmic relative">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative z-10">
          <div className="card text-center py-12">
            <p className="text-dark-300">Notificação não encontrada.</p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4">
              Voltar ao Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic relative">
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">Editar Notificação</h1>
          <p className="text-dark-300 mt-1">
            Atualize as configurações desta notificação
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="card">
            <label htmlFor="name" className="block text-sm font-medium text-dark-100 mb-2">
              Nome da Notificação
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Minha Loja Principal"
              required
              className="input"
            />
          </div>

          {/* Type Selection */}
          <div className="card">
            <label className="block text-sm font-medium text-dark-100 mb-4">
              Tipo de Notificação
            </label>
            <div className="space-y-3">
              {endpointTypes.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    type === option.value
                      ? 'border-accent/50 bg-accent/5 shadow-glow'
                      : 'border-white/10 hover:border-white/20 bg-dark-900/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={type === option.value}
                    onChange={(e) => setType(e.target.value as EndpointType)}
                    className="sr-only"
                  />
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center ${getIconColor(option.value)} shrink-0`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <span className="block font-semibold text-dark-50">{option.label}</span>
                    <span className="block text-sm text-dark-300 mt-0.5">{option.description}</span>
                  </div>
                  {type === option.value && (
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Sale Approved Title Field */}
          {type === 'sale_approved' && (
            <div className="card space-y-4">
              <div>
                <label htmlFor="saleTitle" className="block text-sm font-medium text-dark-100 mb-2">
                  Título da Notificação
                </label>
                <input
                  id="saleTitle"
                  type="text"
                  value={saleTitle}
                  onChange={(e) => setSaleTitle(e.target.value)}
                  placeholder="🤑 Venda Aprovada!"
                  className="input"
                />
                <p className="text-xs text-dark-400 mt-2">
                  O corpo será: &quot;Valor: [valor da venda]&quot;
                </p>
              </div>
            </div>
          )}

          {/* Generic Fields */}
          {type === 'generic' && (
            <div className="card space-y-4">
              <div>
                <label htmlFor="genericTitle" className="block text-sm font-medium text-dark-100 mb-2">
                  Título da Notificação
                </label>
                <input
                  id="genericTitle"
                  type="text"
                  value={genericTitle}
                  onChange={(e) => setGenericTitle(e.target.value)}
                  placeholder="Ex: 🔔 Novo Evento!"
                  required
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="genericBody" className="block text-sm font-medium text-dark-100 mb-2">
                  Corpo da Notificação
                </label>
                <textarea
                  id="genericBody"
                  value={genericBody}
                  onChange={(e) => setGenericBody(e.target.value)}
                  placeholder="Ex: Você recebeu uma nova notificação"
                  required
                  rows={3}
                  className="input resize-none"
                />
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="card border-accent/20">
            <h3 className="text-sm font-medium text-dark-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview da Notificação
            </h3>
            <div className="bg-dark-900/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <Image
                    src="/image/notification_logo_1.png"
                    alt="Ícone"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-dark-50">
                    {type === 'disconnected' && '🚨 Atenção! [Nome] desconectou!'}
                    {type === 'sale_approved' && (saleTitle || '🤑 Venda Aprovada!')}
                    {type === 'generic' && (genericTitle || 'Título da notificação')}
                  </p>
                  <p className="text-sm text-dark-300 mt-0.5">
                    {type === 'disconnected' && 'O número [número] precisa de atenção'}
                    {type === 'sale_approved' && 'Valor: R$ XXX,XX'}
                    {type === 'generic' && (genericBody || 'Corpo da notificação')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving || !name || (type === 'generic' && (!genericTitle || !genericBody))}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
