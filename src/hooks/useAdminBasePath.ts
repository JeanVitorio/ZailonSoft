import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';

export const useAdminBasePath = () => {
  const { lojaSlug } = useAuth();
  const { isPlatformHost } = useTenant();

  return isPlatformHost ? `/${lojaSlug}` : '/admin';
};
