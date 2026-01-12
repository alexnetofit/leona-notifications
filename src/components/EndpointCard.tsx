'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Endpoint } from '@/types';
import { formatEndpointType } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import CopyButton from './CopyButton';

interface EndpointCardProps {
  endpoint: Endpoint;
  appUrl: string;
}

export default function EndpointCard({ endpoint, appUrl }: EndpointCardProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Build webhook URL based on type
  let webhookUrl = `${appUrl}/api/webhook/${endpoint.id}?token=${endpoint.secret}`;
  
  // Add &valor={valor} for sale_approved type
  if (endpoint.type === 'sale_approved') {
    webhookUrl += '&valor={valor}';
  }

  // Build test URL (with example value for sale_approved)
  const testUrl = endpoint.type === 'sale_approved'
    ? `${appUrl}/api/webhook/${endpoint.id}?token=${endpoint.secret}&valor=R$197,00`
    : `${appUrl}/api/webhook/${endpoint.id}?token=${endpoint.secret}`;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(testUrl);
      const data = await response.json();

      setTestResult({
        success: data.success,
        message: data.success 
          ? 'Notificação enviada!' 
          : data.error || 'Falha ao enviar notificação',
      });

      // Clear message after 3 seconds
      setTimeout(() => setTestResult(null), 3000);
    } catch (error) {
      console.error('Test error:', error);
      setTestResult({
        success: false,
        message: 'Erro ao testar',
      });
      setTimeout(() => setTestResult(null), 3000);
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('endpoints')
        .delete()
        .eq('id', endpoint.id);

      if (error) throw error;
      
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      setTestResult({
        success: false,
        message: 'Erro ao excluir',
      });
      setTimeout(() => setTestResult(null), 3000);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Get icon and color based on endpoint type
  const getTypeStyles = () => {
    switch (endpoint.type) {
      case 'disconnected':
        return {
          iconBg: 'from-red-500/20 to-red-600/20',
          iconColor: 'text-red-400',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
          ),
        };
      case 'sale_approved':
        return {
          iconBg: 'from-green-500/20 to-emerald-600/20',
          iconColor: 'text-green-400',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      default:
        return {
          iconBg: 'from-accent/20 to-accent-bright/20',
          iconColor: 'text-accent-light',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="card card-hover glow-border group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeStyles.iconBg} flex items-center justify-center ${typeStyles.iconColor} group-hover:shadow-glow transition-shadow`}>
            {typeStyles.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-50">{endpoint.name}</h3>
            <span className="text-sm text-dark-400">{formatEndpointType(endpoint.type)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <Link
            href={`/endpoints/${endpoint.id}/edit`}
            className="p-2 rounded-lg text-dark-400 hover:text-accent-light hover:bg-accent/10 transition-all cursor-pointer"
            title="Editar"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Excluir"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 relative z-20">
          <p className="text-sm text-red-300 mb-3">
            Tem certeza que deseja excluir esta notificação?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              disabled={deleting}
              className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
            >
              {deleting ? 'Excluindo...' : 'Sim, excluir'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-dark-700/50 text-dark-300 hover:bg-dark-700 text-sm font-medium transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-dark-400 uppercase tracking-wide font-medium">URL</label>
            <CopyButton text={webhookUrl} />
          </div>
          <div className="mt-1.5 p-3 bg-dark-900/50 rounded-lg border border-white/5 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <code className="text-sm text-accent-light whitespace-nowrap inline-block min-w-max">{webhookUrl}</code>
          </div>
          {endpoint.type === 'sale_approved' && (
            <p className="text-xs text-dark-400 mt-2">
              Substitua <code className="text-accent-light px-1 py-0.5 bg-accent/10 rounded">{'{valor}'}</code> pelo valor da venda (ex: R$197,00)
            </p>
          )}
        </div>

        {/* Show custom title for sale_approved */}
        {endpoint.type === 'sale_approved' && endpoint.generic_title && (
          <div className="pt-3 border-t border-white/5">
            <div>
              <label className="text-xs text-dark-400 uppercase tracking-wide font-medium">Título da Notificação</label>
              <p className="mt-1 text-sm text-dark-100">{endpoint.generic_title}</p>
            </div>
          </div>
        )}

        {/* Show custom title and body for generic */}
        {endpoint.type === 'generic' && endpoint.generic_title && (
          <div className="pt-3 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-dark-400 uppercase tracking-wide font-medium">Título</label>
                <p className="mt-1 text-sm text-dark-100">{endpoint.generic_title}</p>
              </div>
              <div>
                <label className="text-xs text-dark-400 uppercase tracking-wide font-medium">Corpo</label>
                <p className="mt-1 text-sm text-dark-100">{endpoint.generic_body}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Button */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
          >
            {testing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Testando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Testar Notificação
              </>
            )}
          </button>
          
          {testResult && (
            <div className={`flex items-center gap-1.5 text-xs font-medium ${
              testResult.success ? 'text-green-400' : 'text-red-400'
            }`}>
              {testResult.success ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <span className="text-xs text-dark-400">
          Criado em {new Date(endpoint.created_at).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
}
