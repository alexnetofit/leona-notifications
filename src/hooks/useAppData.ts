import useSWR, { mutate } from 'swr';
import type { Endpoint, PushSubscription } from '@/types';

interface EndpointsResponse {
  endpoints: Endpoint[];
  user: {
    id: string;
    email: string;
  };
}

interface SubscriptionsResponse {
  subscriptions: PushSubscription[];
  user: {
    id: string;
    email: string;
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Erro ao carregar dados');
    throw error;
  }
  return res.json();
};

export function useEndpoints() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<EndpointsResponse>(
    '/api/data/endpoints',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Não refaz a mesma requisição em 5s
    }
  );

  return {
    endpoints: data?.endpoints || [],
    user: data?.user,
    isLoading,
    isError: !!error,
    error,
    mutate: revalidate,
  };
}

export function useSubscriptions() {
  const { data, error, isLoading, mutate: revalidate } = useSWR<SubscriptionsResponse>(
    '/api/data/subscriptions',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    subscriptions: data?.subscriptions || [],
    user: data?.user,
    isLoading,
    isError: !!error,
    error,
    mutate: revalidate,
  };
}

// Prefetch functions - call these to preload data
export function prefetchEndpoints() {
  mutate('/api/data/endpoints');
}

export function prefetchSubscriptions() {
  mutate('/api/data/subscriptions');
}

// Revalidate all data
export function revalidateAll() {
  mutate('/api/data/endpoints');
  mutate('/api/data/subscriptions');
}
