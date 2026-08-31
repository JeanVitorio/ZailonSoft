const DEFAULT_PLATFORM_DOMAIN = 'jvstech.com';

export const normalizeDomain = (value: string | null | undefined): string => {
  if (!value) return '';

  return value
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .split(/[/?#]/, 1)[0]
    .replace(/:\d+$/, '')
    .replace(/\.+$/, '')
    .replace(/^www\./, '');
};

export const getPlatformDomain = (): string =>
  normalizeDomain(import.meta.env.VITE_PLATFORM_DOMAIN) || DEFAULT_PLATFORM_DOMAIN;

export const isLocalHostname = (hostname: string): boolean => {
  const host = normalizeDomain(hostname);
  return host === 'localhost' || host === '127.0.0.1';
};

export const isPlatformHostname = (
  hostname: string,
  platformDomain = getPlatformDomain(),
): boolean => {
  const host = normalizeDomain(hostname);
  const platform = normalizeDomain(platformDomain) || DEFAULT_PLATFORM_DOMAIN;

  return (
    isLocalHostname(host) ||
    host === platform ||
    host.endsWith(`.${platform}`)
  );
};

export const isValidDomain = (value: string | null | undefined): boolean => {
  const domain = normalizeDomain(value);
  if (!domain || domain.length > 253 || domain !== value?.trim().toLowerCase()) return false;

  return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain);
};
