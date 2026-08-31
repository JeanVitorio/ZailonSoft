export const hasTenantAccess = (
  tenantId: string | null | undefined,
  sessionLojaId: string | null | undefined,
): boolean => Boolean(tenantId && sessionLojaId && tenantId === sessionLojaId);
