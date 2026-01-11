'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/client';
import { generateEndpointId, generateSecret } from '@/lib/utils';
import type { EndpointType } from '@/types';

export const dynamic = 'force-dynamic';

const endpointTypes: { value: EndpointType; label: string; description: string; icon: string }[] = [
  {
    value: 'disconnected',
    label: 'Desconexão',
    description: 'Alerta quando uma instância desconectar',
    icon: '🔌',
  },
  {
    value: 'sale_approved',
    label: 'Venda Aprovada',
    description: 'Notifica quando uma venda for aprovada',
    icon: '💰',
  },
  {
    value: 'generic',
    label: 'Genérico',
    description: 'Notificação personalizada para qualquer evento',
    icon: '📨',
  },
];

export default function NewEndpointPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState('');
  const [type, setType] = useState<EndpointType>('disconnected');
  const [saleTitle, setSaleTitle] = useState('🤑 Venda Aprovada!');
  const [genericTitle, setGenericTitle] = useState('');
  const [genericBody, setGenericBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const endpointId = generateEndpointId();
      const secret = generateSecret();

      // Determine title based on type
      let titleToSave = null;
      let bodyToSave = null;

      if (type === 'sale_approved') {
        titleToSave = saleTitle || '🤑 Venda Aprovada!';
      } else if (type === 'generic') {
        titleToSave = genericTitle;
        bodyToSave = genericBody;
      }

      const { error: insertError } = await supabase.from('endpoints').insert({
        id: endpointId,
        user_id: user.id,
        name,
        type,
        secret,
        generic_title: titleToSave,
        generic_body: bodyToSave,
      });

      if (insertError) throw insertError;

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Error creating endpoint:', err);
      setError('Erro ao criar endpoint. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-50">Novo Endpoint</h1>
          <p className="text-dark-400 mt-1">
            Configure um novo webhook para receber notificações
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name */}
          <div className="card">
            <label htmlFor="name" className="block text-sm font-medium text-dark-200 mb-2">
              Nome do Endpoint
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
            <p className="text-xs text-dark-500 mt-2">
              Um nome para identificar este endpoint
            </p>
          </div>

          {/* Type Selection */}
          <div className="card">
            <label className="block text-sm font-medium text-dark-200 mb-4">
              Tipo de Notificação
            </label>
            <div className="space-y-3">
              {endpointTypes.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    type === option.value
                      ? 'border-accent bg-accent/5'
                      : 'border-dark-700 hover:border-dark-600'
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
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <span className="block font-medium text-dark-100">{option.label}</span>
                    <span className="block text-sm text-dark-400 mt-0.5">{option.description}</span>
                  </div>
                  {type === option.value && (
                    <svg className="w-5 h-5 text-accent mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Sale Approved Title Field */}
          {type === 'sale_approved' && (
            <div className="card space-y-4">
              <div>
                <label htmlFor="saleTitle" className="block text-sm font-medium text-dark-200 mb-2">
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
                <p className="text-xs text-dark-500 mt-2">
                  O corpo será: &quot;Valor: [valor da venda]&quot;
                </p>
              </div>
            </div>
          )}

          {/* Generic Fields */}
          {type === 'generic' && (
            <div className="card space-y-4">
              <div>
                <label htmlFor="genericTitle" className="block text-sm font-medium text-dark-200 mb-2">
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
                <label htmlFor="genericBody" className="block text-sm font-medium text-dark-200 mb-2">
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
              <p className="text-xs text-dark-500">
                Estes textos serão exibidos sempre que o webhook for acionado.
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="card bg-dark-850">
            <h3 className="text-sm font-medium text-dark-300 mb-3">Preview da Notificação</h3>
            <div className="bg-dark-800 rounded-lg p-4 border border-dark-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔔</span>
                </div>
                <div>
                  <p className="font-medium text-dark-100">
                    {type === 'disconnected' && '🚨 Atenção! [Nome] desconectou!'}
                    {type === 'sale_approved' && (saleTitle || '🤑 Venda Aprovada!')}
                    {type === 'generic' && (genericTitle || 'Título da notificação')}
                  </p>
                  <p className="text-sm text-dark-400 mt-0.5">
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
            <div className="p-4 rounded-lg bg-red-900/20 text-red-400 border border-red-900/50 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || !name || (type === 'generic' && (!genericTitle || !genericBody))}
              className="btn-primary flex-1"
            >
              {loading ? 'Criando...' : 'Criar Endpoint'}
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
