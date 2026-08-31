import { describe, expect, it } from 'vitest';
import { hasTenantAccess } from '@/lib/tenantAccess';

describe('isolamento cross-tenant', () => {
  it('permite acesso quando a loja da sessão corresponde ao tenant', () => {
    expect(hasTenantAccess('loja-1', 'loja-1')).toBe(true);
  });

  it('nega acesso para loja diferente ou identificadores ausentes', () => {
    expect(hasTenantAccess('loja-1', 'loja-2')).toBe(false);
    expect(hasTenantAccess('loja-1', null)).toBe(false);
    expect(hasTenantAccess(null, 'loja-1')).toBe(false);
  });
});
