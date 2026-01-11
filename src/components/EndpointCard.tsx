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

  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-dark-100">{endpoint.name}</h3>
          <span className="text-sm text-dark-400">{formatEndpointType(endpoint.type)}</span>
        </div>
        <CopyButton text={webhookUrl} />
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-dark-500 uppercase tracking-wide">URL do Webhook</label>
          <div className="mt-1 p-3 bg-dark-900 rounded-lg border border-dark-700">
            <code className="text-sm text-accent break-all">{webhookUrl}</code>
          </div>
          {endpoint.type === 'sale_approved' && (
            <p className="text-xs text-dark-500 mt-2">
              Substitua <code className="text-accent">{'{valor}'}</code> pelo valor da venda (ex: R$197,00)
            </p>
          )}
        </div>

        {/* Show custom title for sale_approved */}
        {endpoint.type === 'sale_approved' && endpoint.generic_title && (
          <div className="pt-3 border-t border-dark-700">
            <div>
              <label className="text-xs text-dark-500 uppercase tracking-wide">Título da Notificação</label>
              <p className="mt-1 text-sm text-dark-200">{endpoint.generic_title}</p>
            </div>
          </div>
        )}

        {/* Show custom title and body for generic */}
        {endpoint.type === 'generic' && endpoint.generic_title && (
          <div className="pt-3 border-t border-dark-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-dark-500 uppercase tracking-wide">Título</label>
                <p className="mt-1 text-sm text-dark-200">{endpoint.generic_title}</p>
              </div>
              <div>
                <label className="text-xs text-dark-500 uppercase tracking-wide">Corpo</label>
                <p className="mt-1 text-sm text-dark-200">{endpoint.generic_body}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-dark-700 flex items-center justify-between">
        <span className="text-xs text-dark-500">
          Criado em {new Date(endpoint.created_at).toLocaleDateString('pt-BR')}
        </span>
        <span className="text-xs text-dark-600 font-mono">ID: {endpoint.id}</span>
      </div>
    </div>
  );
}
