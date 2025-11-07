import { lazy } from 'react';

type Picker<T = any> = (m: any) => T | undefined;

// Tenta em ordem: default, Component, Index, Page, NomeDoArquivo comum
const defaultPickers: Picker[] = [
  (m) => m.default,
  (m) => m.Component,
  (m) => m.Index,
  (m) => m.Page,
];

/**
 * Uso:
 *   const MinhaPagina = lazySafe(() => import('@/components/MinhaPagina'), m => m.MinhaPagina);
 * ou simplesmente:
 *   const MinhaPagina = lazySafe(() => import('@/components/MinhaPagina'));
 * (que tenta default/Component/Index/Page automaticamente)
 */
export function lazySafe<T extends React.ComponentType<any>>(
  loader: () => Promise<any>,
  pick: Picker<T> = (m) => defaultPickers.map((p) => p(m)).find(Boolean)
) {
  return lazy(async () => {
    const mod = await loader();
    const Comp = pick(mod);
    if (!Comp) {
      console.error('[lazySafe] Módulo sem export de componente válido:', mod);
      // Evita crash duro — renderiza placeholder vazio
      const Fallback = () => null;
      return { default: Fallback };
    }
    return { default: Comp as T };
  });
}
