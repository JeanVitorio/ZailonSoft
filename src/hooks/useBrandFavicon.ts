import { useEffect } from 'react';

type FaviconBrand = 'jvs' | 'Falcon';

const TITLES: Record<FaviconBrand, string> = {
  jvs: 'Falcon — A plataforma que vende veículos por você',
  Falcon: 'Falcon — Sistema para lojas de veículos',
};

const HREFS: Record<FaviconBrand, string> = {
  jvs: '/jvs-favicon.png',
  Falcon: '/Falcon-favicon.png',
};

/**
 * Atualiza dinamicamente o favicon e o título da aba conforme a marca da página atual.
 */
export function useBrandFavicon(brand: FaviconBrand, customTitle?: string) {
  useEffect(() => {
    const link =
      (document.getElementById('dynamic-favicon') as HTMLLinkElement) ||
      (() => {
        const l = document.createElement('link');
        l.id = 'dynamic-favicon';
        l.rel = 'icon';
        document.head.appendChild(l);
        return l;
      })();
    link.href = HREFS[brand];
    link.type = 'image/png';

    const previous = document.title;
    document.title = customTitle || TITLES[brand];
    return () => {
      document.title = previous;
    };
  }, [brand, customTitle]);
}
