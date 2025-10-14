import { useQuery } from '@tanstack/react-query';

interface StripeConfig {
  publishableKey: string;
  mode: 'test' | 'live';
  currency: string;
  enabled: boolean;
}

async function fetchIntegrations() {
  const token = localStorage.getItem('token');
  if (!token) {
    return [];
  }

  const response = await fetch('/api/admin/integrations', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des intégrations');
  }

  return response.json();
}

export function useStripeIntegration() {
  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: fetchIntegrations,
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
    retry: 1,
  });

  const stripe = integrations?.find((i: any) => i.type === 'stripe');
  const isEnabled = stripe?.enabled && stripe?.status === 'connected';

  const config: StripeConfig | null = isEnabled ? {
    publishableKey: '', // Sera fournie par une API dédiée si nécessaire
    mode: 'test', // Par défaut
    currency: 'eur',
    enabled: true
  } : null;

  return {
    isEnabled: Boolean(isEnabled),
    config,
    loading: isLoading
  };
}
