import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { fetchLojaByDomain, LojaDetails } from '@/services/api';
import { isLocalHostname, isPlatformHostname, normalizeDomain } from '@/lib/domain';

interface TenantContextType {
  loading: boolean;
  tenant: LojaDetails | null;
  error: string | null;
  isPlatformHost: boolean;
  domain: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const domain = normalizeDomain(window.location.hostname);
  const isPlatformHost = isPlatformHostname(domain);
  const isLocalHost = isLocalHostname(domain);
  const [tenant, setTenant] = useState<LojaDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isLocalHost);

  useEffect(() => {
    if (isLocalHost) {
      setLoading(false);
      return;
    }

    let active = true;
    fetchLojaByDomain(domain)
      .then((loja) => {
        if (active) setTenant(loja);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Não foi possível carregar esta loja.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [domain, isLocalHost]);

  return (
    <TenantContext.Provider value={{ loading, tenant, error, isPlatformHost, domain }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant deve ser usado dentro de TenantProvider');
  return context;
};
