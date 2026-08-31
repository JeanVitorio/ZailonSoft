import { describe, expect, it } from 'vitest';
import { isLocalHostname, isPlatformHostname, isValidDomain, normalizeDomain } from '@/lib/domain';

describe('domínios de tenant', () => {
  it.each([
    [' HTTPS://WWW.Loja.Exemplo.com.br:443/catalogo ', 'loja.exemplo.com.br'],
    ['loja.exemplo.com.br.', 'loja.exemplo.com.br'],
    ['http://www.exemplo.com/path?q=1', 'exemplo.com'],
  ])('normaliza %s', (input, expected) => {
    expect(normalizeDomain(input)).toBe(expected);
  });

  it('classifica hosts locais, domínio e subdomínios da plataforma', () => {
    expect(isLocalHostname('localhost:8080')).toBe(true);
    expect(isLocalHostname('jvstech.com')).toBe(false);
    expect(isPlatformHostname('localhost', 'jvstech.com')).toBe(true);
    expect(isPlatformHostname('127.0.0.1:8080', 'jvstech.com')).toBe(true);
    expect(isPlatformHostname('www.jvstech.com', 'jvstech.com')).toBe(true);
    expect(isPlatformHostname('app.jvstech.com', 'jvstech.com')).toBe(true);
    expect(isPlatformHostname('lojajvstech.com', 'jvstech.com')).toBe(false);
  });

  it('valida apenas domínios normalizados com formato público', () => {
    expect(isValidDomain('loja.exemplo.com.br')).toBe(true);
    expect(isValidDomain('https://loja.exemplo.com.br')).toBe(false);
    expect(isValidDomain('localhost')).toBe(false);
    expect(isValidDomain('-loja.com')).toBe(false);
  });
});
