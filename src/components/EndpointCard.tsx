'use client';

import { Endpoint } from '@/types';
import { formatEndpointType } from '@/lib/utils';
import CopyButton from './CopyButton';

interface EndpointCardProps {
  endpoint: Endpoint;
  appUrl: string;
}

export default function EndpointCard({ endpoint, appUrl }: EndpointCardProps) {
  // Build webhook URL based on type
  let webhookUrl = `${appUrl}/api/webhook/${endpoint.id}?token=${endpoint.secret}`;
  
  // Add &valor={valor} for sale_approved type
  if (endpoint.type === 'sale_approved') {
    webhookUrl += '&valor={valor}';
  }

  // Get icon and color based on endpoint type
  const getTypeStyles = () => {
    switch (endpoint.type) {
      case 'disconnect':
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
        <CopyButton text={webhookUrl} />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-dark-400 uppercase tracking-wide font-medium">URL do Webhook</label>
          <div className="mt-1.5 p-3 bg-dark-900/50 rounded-lg border border-white/5">
            <code className="text-sm text-accent-light break-all">{webhookUrl}</code>
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

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-dark-400">
          Criado em {new Date(endpoint.created_at).toLocaleDateString('pt-BR')}
        </span>
        <span className="text-xs text-dark-500 font-mono bg-dark-900/50 px-2 py-1 rounded">
          {endpoint.id.slice(0, 8)}...
        </span>
      </div>
    </div>
  );
}
