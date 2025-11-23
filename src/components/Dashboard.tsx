// src/components/Dashboard.tsx
import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import * as Feather from 'react-feather';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
  fetchClients,
  fetchAvailableCars,
  fetchStoreDetails,
  Client as ClientType,
  Car as CarType,
} from '@/services/api';
import { useAuth } from '@/auth/AuthContext';

/* ===========================
   CONFIG / CONSTANTES
   =========================== */

/** Funil alinhado ao CRM/Kanban */
const FUNIL_ETAPAS: { id: string; label: string }[] = [
  { id: 'novo_lead',        label: 'Novo Lead' },
  { id: 'em_contato',       label: 'Em Contato' },
  { id: 'qualificado',      label: 'Qualificado' },
  { id: 'proposta_enviada', label: 'Proposta Enviada' },
  { id: 'negociacao_final', label: 'Negociação Final' },
  { id: 'vendido',          label: 'Vendido' },
  { id: 'perdido',          label: 'Perdido' },
];

// Auxiliares legados ainda presentes em alguns dados
const AGUARDANDO_IDS = [
  'aguardando_interesse',
  'aguardando_escolha_carro',
  'aguardando_confirmacao_veiculo',
  'aguardando_opcao_pagamento',
];
const DADOS_IDS = ['dados_troca', 'dados_visita', 'dados_financiamento'];

const formatToBRL = (v: number | string) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(typeof v === 'number' ? v : Number(v || 0));

/* ===========================
   PARSERS / HELPERS
   =========================== */

const parseCurrency = (v: any): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const raw = String(v ?? '').trim();
  if (!raw) return 0;

  const brlLike = raw
    .replace(/\s+/g, '')
    .replace(/R\$\s?/gi, '')
    .replace(/\./g, '')
    .replace(/,/, '.');

  let n = Number(brlLike);
  if (Number.isFinite(n)) return n;

  const digits = raw.replace(/\D+/g, '');
  if (!digits) return 0;
  n = digits.length >= 3 ? Number(digits) / 100 : Number(digits);
  return Number.isFinite(n) ? n : 0;
};

const tryEpoch = (v: any): Date | null => {
  if (v == null) return null;
  const s = String(v).trim();
  if (!/^\d{10,13}$/.test(s)) return null;
  const num = Number(s.length === 10 ? Number(s) * 1000 : s);
  const d = new Date(num);
  return isNaN(d.getTime()) ? null : d;
};

const tryISOorNative = (v: any): Date | null => {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d;
};

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const tryYMD_HM = (dateStr: any, timeStr?: any): Date | null => {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  const m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (!m) return null;
  const [_, y, mm, dd] = m;

  const hhmm = timeStr ? String(timeStr).trim() : '00:00';
  const t = hhmm.match(/^(\d{2}):(\d{2})$/) ? hhmm : '00:00';

  const d = new Date(`${y}-${mm}-${dd}T${t}:00`);
  return isNaN(d.getTime()) ? null : d;
};

const tryDMY_HM = (dateStr: any, timeStr?: any): Date | null => {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [_, dd, mm, y] = m;

  const hhmm = timeStr ? String(timeStr).trim() : '00:00';
  const t = hhmm.match(/^(\d{2}):(\d{2})$/) ? hhmm : '00:00';

  const d = new Date(`${y}-${mm}-${dd}T${t}:00`);
  return isNaN(d.getTime()) ? null : d;
};

/** Normaliza estados (novos + legado) para os IDs do funil do CRM */
const normalizaEstadoParaFunil = (raw: any): string => {
  const s = String(raw || '').trim().toLowerCase();

  if (!s || s === 'inicial' || s === 'leed_recebido') return 'novo_lead';

  if (s === 'triagem' || s === 'contato' || s === 'em_contato') return 'em_contato';
  if (s === 'visita' || s === 'visita_agendada') return 'qualificado';
  if (s === 'proposta' || s === 'proposta_enviada') return 'proposta_enviada';
  if (s === 'em_negociacao' || s === 'negociacao' || s === 'reservado')
    return 'negociacao_final';

  const valid = new Set(FUNIL_ETAPAS.map((f) => f.id));
  if (valid.has(s)) return s;

  if (AGUARDANDO_IDS.includes(s)) return 'em_contato';
  if (DADOS_IDS.includes(s)) return 'qualificado';

  return 'novo_lead';
};

/** Data de referência geral (primeiro contato) */
const getClientRefDate = (c: any): Date | null => {
  const bd = c?.bot_data ?? {};
  const direct = [
    c?.created_at,
    c?.first_message_at,
    c?.first_seen,
    c?.timestamp,
    bd?.created_at,
    bd?.first_contact_at,
    bd?.first_seen_at,
    bd?.timestamp,
  ];
  for (const v of direct) {
    const d =
      tryEpoch(v) ||
      tryISOorNative(v) ||
      tryDMY_HM(v) ||
      tryYMD_HM(v);
    if (d) return d;
  }

  const hist = Array.isArray(bd?.history) ? bd.history : [];
  for (const h of hist) {
    const d =
      tryISOorNative(h?.timestamp) ||
      tryDMY_HM(h?.timestamp) ||
      tryYMD_HM(h?.timestamp);
    if (d) return d;
  }
  return null;
};

/** Data de envio do formulário (fallback para ref date) */
const getFormSubmittedAt = (c: any): Date | null => {
  const bd = c?.bot_data ?? {};
  const candidates = [
    c?.form_submitted_at,
    c?.form_created_at,
    c?.submitted_at,
    c?.form?.submitted_at,
    c?.form?.created_at,
    bd?.form_submitted_at,
    bd?.form_created_at,
    bd?.submitted_at,
    bd?.form?.submitted_at,
    bd?.form?.created_at,
    bd?.formulario?.submitted_at,
    bd?.formulario?.created_at,
    bd?.formulario?.enviado_em,
    bd?.answers?.submitted_at,
    bd?.answers?.created_at,
  ];
  for (const v of candidates) {
    const d =
      tryEpoch(v) ||
      tryISOorNative(v) ||
      tryDMY_HM(v) ||
      tryYMD_HM(v);
    if (d) return d;
  }
  return getClientRefDate(c);
};

/** Preço provável do veículo */
const pickVehiclePrice = (client: ClientType): number => {
  const b: any = client?.bot_data ?? {};
  const candidates: any[] = [];

  if (Array.isArray(b?.interested_vehicles)) {
    for (const it of b.interested_vehicles) {
      if (!it) continue;
      candidates.push(
        it.preco,
        it.valor,
        it.price,
        it.preco_tabela,
        it.preco_sugerido,
        it.preco_anunciado
      );
    }
  }

  const iv = b?.interested_vehicle;
  if (iv) {
    candidates.push(
      iv.preco,
      iv.valor,
      iv.price,
      iv.preco_tabela,
      iv.preco_sugerido,
      iv.preco_anunciado
    );
  }

  const vehicle = b?.vehicle;
  if (vehicle) {
    candidates.push(
      vehicle.preco,
      vehicle.valor,
      vehicle.price,
      vehicle.preco_tabela,
      vehicle.preco_sugerido
    );
  }

  candidates.push(
    b?.vehicle_price,
    b?.valor_negociacao,
    b?.valor_negociacao_total,
    b?.budget?.value,
    b?.orcamento?.valor,
    b?.negociacao?.valor
  );

  const parsed = candidates
    .map(parseCurrency)
    .filter((x) => Number.isFinite(x) && x > 0);
  return parsed.length ? Math.max(...parsed) : 0;
};

/** Identificador único provável do veículo, para evitar contagem duplicada */
const getVehicleKey = (client: ClientType): string | null => {
  const b: any = client?.bot_data ?? {};

  const fromObj = (v: any): string | null => {
    if (!v) return null;

    const idCandidate =
      v.id ||
      v.uuid ||
      v.slug ||
      v.codigo ||
      v.code ||
      v.stock_id ||
      v.estoque_id ||
      v.chassi ||
      v.placa;

    if (idCandidate) return String(idCandidate);

    const name = v.nome || v.name || v.titulo || v.title || '';
    const year = v.ano || v.year || '';
    const precoLike = v.preco || v.valor || v.price || '';
    const priceNum = parseCurrency(precoLike);

    if (name || year || priceNum) {
      return `${name}::${year}::${priceNum}`;
    }
    return null;
  };

  if (Array.isArray(b?.interested_vehicles) && b.interested_vehicles.length) {
    const k = fromObj(b.interested_vehicles[0]);
    if (k) return k;
  }

  if (b?.interested_vehicle) {
    const k = fromObj(b.interested_vehicle);
    if (k) return k;
  }

  if (b?.vehicle) {
    const k = fromObj(b.vehicle);
    if (k) return k;
  }

  return null;
};

/** Data da visita (robusto) */
const getVisitAtRobusto = (client: any): Date | null => {
  const rootVD = client?.visit_details ?? {};
  const bd = client?.bot_data ?? {};
  const ag = bd?.agendamento ?? rootVD?.agendamento ?? {};
  const vdCRM = bd?.visit_details ?? {};

  const direct = [
    rootVD?.visit_at,
    rootVD?.datetime,
    rootVD?.dateTime,
    rootVD?.when,
    rootVD?.timestamp,
    vdCRM?.visit_at,
    vdCRM?.datetime,
    vdCRM?.dateTime,
    vdCRM?.when,
    vdCRM?.timestamp,
    bd?.visit_at,
    bd?.visitAt,
    bd?.when,
    bd?.timestamp,
    ag?.visit_at,
    ag?.datetime,
    ag?.dateTime,
    ag?.timestamp,
  ];

  for (const c of direct) {
    const d =
      tryEpoch(c) ||
      tryISOorNative(c) ||
      tryDMY_HM(c) ||
      tryYMD_HM(c);
    if (d) return d;
  }

  const dateCandidates = [
    vdCRM?.day,
    vdCRM?.date,
    vdCRM?.dia,
    vdCRM?.data,
    rootVD?.day,
    rootVD?.date,
    rootVD?.dia,
    rootVD?.data,
    ag?.day,
    ag?.date,
    ag?.dia,
    ag?.data,
    bd?.day,
    bd?.date,
    bd?.dia,
    bd?.data,
  ];

  const timeCandidates = [
    vdCRM?.time,
    vdCRM?.hora,
    rootVD?.time,
    rootVD?.hora,
    ag?.time,
    ag?.hora,
    bd?.time,
    bd?.hora,
  ];

  for (const dc of dateCandidates) {
    if (!dc) continue;
    const tries = timeCandidates.filter(Boolean);
    if (tries.length === 0) tries.push(undefined as any);
    for (const tc of tries) {
      const d1 = tryYMD_HM(dc, tc) || tryDMY_HM(dc, tc);
      if (d1) return d1;
    }
  }

  const epochish = [vdCRM?.day, vdCRM?.datetime, rootVD?.datetime, bd?.visit_at, ag?.date].find(
    (x) => x != null && /^\d{10,13}$/.test(String(x))
  );
  if (epochish) {
    const d = tryEpoch(epochish);
    if (d) return d;
  }
  return null;
};

/* ===========================
   CALENDÁRIO — helpers
   =========================== */

const getMonthMatrix = (anchorDate: Date) => {
  const y = anchorDate.getFullYear();
  const m = anchorDate.getMonth();
  const first = new Date(y, m, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const weeks: Date[][] = [];
  let cur = new Date(start);
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/* ===========================
   TIPOS DE NEGÓCIO
   =========================== */

type RangeMode = 'today' | '7d' | '30d' | 'custom';
type DealType = 'À vista' | 'Financiado' | 'Troca' | 'Visita' | 'Outros';

/** Detecta se há veículo de troca preenchido em campos comuns */
const hasTradeInFlag = (c: any): boolean => {
  const bd = c?.bot_data ?? {};
  const simple = [bd?.tem_troca, bd?.has_trade_in, bd?.troca];
  for (const v of simple) {
    if (v && v !== 'false' && v !== false) return true;
  }

  const trades = [c?.trade_in_car, bd?.trade_in_car].filter(Boolean);
  for (let tr of trades) {
    if (typeof tr === 'string' && tr.trim()) {
      try {
        tr = JSON.parse(tr);
      } catch {
        continue;
      }
    }
    if (typeof tr !== 'object' || tr == null) continue;
    if (
      (Array.isArray(tr.photos) && tr.photos.length) ||
      (Array.isArray(tr.images) && tr.images.length) ||
      (Array.isArray(tr.imagens) && tr.imagens.length) ||
      tr.model ||
      tr.year ||
      tr.value ||
      tr.modelo ||
      tr.ano ||
      tr.valor ||
      tr.descricao ||
      tr.description
    )
      return true;
  }
  return false;
};

/** Decide a categoria única do cliente, alinhado com a lógica do CRM */
const getDealType = (c: any): DealType => {
  const bd = c?.bot_data ?? {};
  const txt = (s: any) => String(s || '').toLowerCase();
  const deal = txt(bd?.deal_type || c?.deal_type);
  const pay = txt(bd?.payment_method || c?.payment_method);
  const visit = bd?.visit_details || {};

  const hasTrade =
    !!bd?.trade_in_car &&
    (Array.isArray(bd.trade_in_car?.imagens) ||
      Array.isArray(bd.trade_in_car?.images) ||
      bd.trade_in_car?.modelo ||
      bd.trade_in_car?.descricao ||
      hasTradeInFlag(c));

  if (hasTrade || deal.includes('troca') || pay.includes('troca')) return 'Troca';
  if (deal.includes('financ') || pay.includes('financ') || pay.includes('parcel'))
    return 'Financiado';
  if (
    deal.includes('vista') ||
    pay.includes('vista') ||
    pay.includes('pix') ||
    pay.includes('dinheiro')
  )
    return 'À vista';
  if (visit?.day || visit?.time) return 'Visita';
  return 'Outros';
};

/* ===========================
   DASHBOARD
   =========================== */

export function Dashboard() {
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { lojaId, isLoading: authLoading } = useAuth();

  // Filtro global
  const [mode, setMode] = useState<RangeMode>('7d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const computeRange = (): { start: Date; end: Date; label: string } => {
    const now = new Date();
    let end = new Date(now);
    end.setHours(23, 59, 59, 999);
    let start = new Date(end);
    let label = '';

    if (mode === 'today') {
      start.setHours(0, 0, 0, 0);
      label = 'Hoje';
    } else if (mode === '7d') {
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      label = 'Últimos 7 dias';
    } else if (mode === '30d') {
      start.setDate(end.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      label = 'Últimos 30 dias';
    } else {
      start = customStart ? new Date(customStart + 'T00:00:00') : new Date(end);
      end = customEnd ? new Date(customEnd + 'T23:59:59.999') : end;
      label = `De ${customStart || '—'} até ${customEnd || 'hoje'}`;
    }
    return { start, end, label };
  };

  const activeRange = computeRange();

  // Estado de calendário / drawer
  const [calMonth, setCalMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState<ClientType | null>(null);

  const { data: storeDetailsData } = useQuery({
    queryKey: ['storeDetails'],
    queryFn: fetchStoreDetails,
  });

  const { data: clientsRaw = [], isLoading: cLoading } = useQuery<ClientType[]>({
    queryKey: ['clients', lojaId],
    queryFn: fetchClients,
    enabled: !!lojaId,
    initialData: [],
    refetchInterval: 10000,
  });

  const { data: vehicles = [], isLoading: vLoading } = useQuery<CarType[]>({
    queryKey: ['vehicles', lojaId],
    queryFn: () => fetchAvailableCars(lojaId!),
    enabled: !!lojaId,
    initialData: [],
  });

  // Clientes dentro do range
  const metricClients = useMemo(() => {
    const { start, end } = activeRange;
    return (clientsRaw || []).filter((c) => {
      const d = getClientRefDate(c);
      if (!d) return false;
      return d >= start && d <= end;
    });
  }, [clientsRaw, activeRange.start.getTime(), activeRange.end.getTime()]);

  // Total de formulários (usando data ref)
  const totalFormularios = useMemo(() => {
    const { start, end } = activeRange;
    let count = 0;
    for (const c of clientsRaw) {
      const d = getClientRefDate(c);
      if (!d) continue;
      if (d >= start && d <= end) count += 1;
    }
    return count;
  }, [clientsRaw, activeRange.start.getTime(), activeRange.end.getTime()]);

  // VISITAS (do início do período para frente)
  const visitsAll = useMemo(() => {
    const { start } = activeRange;
    const map = new Map<string, { date: Date; clients: ClientType[] }>();
    for (const c of clientsRaw) {
      const d = getVisitAtRobusto(c as any);
      if (!d) continue;
      if (d < start) continue;

      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(
        d.getDate()
      )}`;
      if (!map.has(key))
        map.set(key, {
          date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
          clients: [],
        });
      map.get(key)!.clients.push(c);
    }
    return map;
  }, [clientsRaw, activeRange.start.getTime()]);

  const visitsCount = visitsAll.size;

  const visitsFlatSorted = useMemo(() => {
    const out: Array<{ client: ClientType; date: Date }> = [];
    for (const [, bucket] of visitsAll) {
      for (const cl of bucket.clients)
        out.push({ client: cl, date: getVisitAtRobusto(cl as any)! });
    }
    return out.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [visitsAll]);

  // ----- DADOS DERIVADOS -----
  const dashboardData = useMemo(() => {
    const stateOf = (c: any) =>
      String(c?.bot_data?.state || c?.state || '').toLowerCase();

    // Funil
    const funilCounts: Record<string, number> = Object.fromEntries(
      FUNIL_ETAPAS.map(({ id }) => [id, 0])
    );

    for (const c of metricClients) {
      const sNorm = normalizaEstadoParaFunil(stateOf(c));
      funilCounts[sNorm] = (funilCounts[sNorm] || 0) + 1;
    }

    // Tipo de negócio
    const tipoOrdemFixa: DealType[] = [
      'À vista',
      'Financiado',
      'Troca',
      'Visita',
      'Outros',
    ];
    const tipoCountBase: Record<DealType, number> = {
      'À vista': 0,
      'Financiado': 0,
      'Troca': 0,
      'Visita': 0,
      'Outros': 0,
    };
    const tipoCount = metricClients.reduce(
      (acc, c) => {
        const t = getDealType(c);
        acc[t] += 1;
        return acc;
      },
      { ...tipoCountBase }
    );

    // ---- NOVA LÓGICA: valor em negociação por VEÍCULO ÚNICO ----
    const openClients = metricClients.filter((c) => {
      const stNorm = normalizaEstadoParaFunil(stateOf(c));
      // Considera apenas leads que ainda estão em aberto/negociação
      return stNorm !== 'vendido' && stNorm !== 'perdido';
    });

    const seenVehicles = new Set<string>();
    let valorNegociacaoNum = 0;

    for (const c of openClients) {
      const key = getVehicleKey(c);
      if (!key) continue;
      if (seenVehicles.has(key)) continue; // já contamos esse veículo
      seenVehicles.add(key);

      const price = pickVehiclePrice(c);
      if (price > 0) {
        valorNegociacaoNum += price;
      }
    }
    // ---- FIM NOVA LÓGICA ----

    const vendas = funilCounts['vendido'] || 0;

    return {
      cards: [
        { title: 'Total de Formulários', value: totalFormularios },
        {
          title: 'Visitas Marcadas (dias)',
          value: visitsCount,
          route: '../crm#qualificado',
        },
        {
          title: 'Veículos em Estoque',
          value: vehicles.length,
          route: '../catalog',
        },
        {
          title: 'Vendas (Vendido)',
          value: vendas,
          route: '../crm#vendido',
        },
        {
          title: 'Valor em Negociação',
          value: formatToBRL(valorNegociacaoNum),
        }
      ],
      funnelCounts: funilCounts,
      dealTypeCounts: tipoCount,
      valorNegociacao: formatToBRL(valorNegociacaoNum),
      totalClientsInRange: metricClients.length,
      tipoOrdemFixa,
    };
  }, [metricClients, vehicles.length, visitsCount, totalFormularios]);

  /* ---------- Exportação PDF ---------- */
  const exportToPDFFull = useCallback(async () => {
    if (!dashboardRef.current) return;
    const el = dashboardRef.current;

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#020617',
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const ratio = imgWidth / canvas.width;
    const imgFullHeight = canvas.height * ratio;

    if (imgFullHeight <= pageHeight) {
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgFullHeight
      );
    } else {
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d')!;
      const sliceHeightPx = pageHeight / ratio;
      let renderedHeight = 0;

      while (renderedHeight < canvas.height) {
        const sliceHeight = Math.min(
          sliceHeightPx,
          canvas.height - renderedHeight
        );
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(
          canvas,
          0,
          renderedHeight,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
        const sliceImgHeight = sliceHeight * ratio;

        if (renderedHeight === 0) {
          pdf.addImage(
            pageCanvas.toDataURL('image/png'),
            'PNG',
            0,
            0,
            imgWidth,
            sliceImgHeight
          );
        } else {
          pdf.addPage();
          pdf.addImage(
            pageCanvas.toDataURL('image/png'),
            'PNG',
            0,
            0,
            imgWidth,
            sliceImgHeight
          );
        }
        renderedHeight += sliceHeight;
      }
    }

    pdf.save(
      `Dashboard_${storeDetailsData?.nome || 'Zailon'}_${new Date().toLocaleDateString(
        'pt-BR'
      )}.pdf`
    );
  }, [storeDetailsData?.nome]);

  /* ---------- Loading ---------- */
  if (authLoading || cLoading || vLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  /* ===========================
     UI
     =========================== */

  const monthWeeks = getMonthMatrix(calMonth);
  const monthVisitMap = new Map<string, number>();
  for (const [, bucket] of visitsAll) {
    if (
      bucket.date.getMonth() !== calMonth.getMonth() ||
      bucket.date.getFullYear() !== calMonth.getFullYear()
    )
      continue;
    const k = `${bucket.date.getFullYear()}-${pad2(
      bucket.date.getMonth() + 1
    )}-${pad2(bucket.date.getDate())}`;
    monthVisitMap.set(k, bucket.clients.length);
  }

  const openDrawerForDate = (d: Date) => {
    setSelectedDate(d);
    setClientOpen(null);
    setDrawerOpen(true);
  };

  const selectedDateKey =
    selectedDate
      ? `${selectedDate.getFullYear()}-${pad2(
          selectedDate.getMonth() + 1
        )}-${pad2(selectedDate.getDate())}`
      : '';
  const selectedBucket = selectedDateKey
    ? visitsAll.get(selectedDateKey)
    : undefined;

  const rangeBadge =
    mode === 'custom'
      ? `De ${customStart || '—'} até ${customEnd || 'hoje'} • Visitas futuras incluídas`
      : `${activeRange.label} • Visitas futuras incluídas`;

  return (
    <div
      ref={dashboardRef}
      className="min-h-screen bg-slate-950 text-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            {storeDetailsData?.logo_url ? (
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/70 flex items-center justify-center overflow-hidden shadow-lg">
                <img
                  src={storeDetailsData.logo_url}
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/70 flex items-center justify-center shadow-lg text-lg font-bold">
                {storeDetailsData?.nome?.[0] || 'Z'}
              </div>
            )}

            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Visão Geral{' '}
                <span className="text-emerald-400">
                  {storeDetailsData?.nome || 'ZailonSoft'}
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <p className="mt-2 text-[11px] md:text-xs text-slate-400">
                Mostrando:{' '}
                <span className="font-semibold text-slate-100">
                  {rangeBadge}
                </span>
              </p>
            </div>
          </div>

          {/* Filtro / PDF */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900/70 border border-slate-700/70 rounded-xl p-1">
              {[
                { id: 'today', label: 'Hoje' },
                { id: '7d', label: '7 dias' },
                { id: '30d', label: '30 dias' },
                { id: 'custom', label: 'Personalizado' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  className={[
                    'px-2.5 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition',
                    mode === opt.id
                      ? 'bg-emerald-500 text-slate-950 shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800',
                  ].join(' ')}
                  onClick={() => setMode(opt.id as RangeMode)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {mode === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}

            <button
              onClick={exportToPDFFull}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-sm font-semibold shadow-[0_18px_45px_rgba(16,185,129,0.45)] hover:bg-emerald-400 transition whitespace-nowrap"
            >
              <Feather.Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* CARDS PRINCIPAIS */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
          {dashboardData.cards.map((card, i) => (
            <motion.button
              type="button"
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() =>
                (card as any).route && navigate((card as any).route)
              }
              className={[
                'group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80',
                'px-4 py-4 text-left shadow-[0_18px_40px_rgba(15,23,42,0.9)]',
                (card as any).route ? 'cursor-pointer hover:-translate-y-1 transition-transform' : '',
              ].join(' ')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-1">
                  {card.title}
                </p>
                <p className="text-xl sm:text-2xl font-black text-slate-50">
                  {card.value}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* FUNIL DE VENDAS – CARDS */}
        <section className="mb-10">
          <FunnelCards
            funilCounts={dashboardData.funnelCounts}
            total={dashboardData.totalClientsInRange}
          />
        </section>

        {/* TIPO DE NEGÓCIO */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-slate-50">
              Tipo de Negócio
            </h2>
            <span className="text-[11px] text-slate-400">
              Como os clientes deste período estão distribuídos
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {dashboardData.tipoOrdemFixa.map((tipo) => {
              const value = dashboardData.dealTypeCounts[tipo];
              const total = dashboardData.totalClientsInRange || 1;
              const pct = ((value / total) * 100) || 0;

              return (
                <div
                  key={tipo}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.9)]"
                >
                  <p className="text-xs font-medium text-slate-300 mb-1">
                    {tipo}
                  </p>
                  <p className="text-2xl font-bold text-slate-50">
                    {value}
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1">
                    {pct.toFixed(0)}% dos leads
                  </p>
                  <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* VALOR EM NEGOCIAÇÃO */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 via-cyan-500/15 to-amber-400/20 px-6 sm:px-10 py-7 shadow-[0_30px_90px_rgba(6,95,70,0.7)]"
          >
            <div className="absolute -inset-10 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.65),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.4),_transparent_55%)]" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-100">
                  Potencial de faturamento
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-50 mt-1">
                  Valor Total em Negociação
                </h2>
                <p className="text-xs sm:text-sm text-emerald-50/80 mt-2 max-w-xl">
                  O sistema mostra o potencial, mas a sua estratégia realiza a venda. Estamos aqui para garantir que você visualize o sucesso!
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald-100/80 mb-1">
                  Total estimado
                </p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-50">
                  {dashboardData.valorNegociacao}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* VISITAS — Calendário + Próximas */}
        <section className="mb-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* CALENDÁRIO */}
          <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-50">
                Visitas marcadas (calendário)
              </h3>
              <div className="flex items-center gap-2 text-slate-300">
                <button
                  onClick={() =>
                    setCalMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                    )
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-800"
                  aria-label="Mês anterior"
                >
                  <Feather.ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs sm:text-sm font-semibold w-40 text-center">
                  {calMonth.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <button
                  onClick={() =>
                    setCalMonth(
                      (prev) =>
                        new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                    )
                  }
                  className="p-1.5 rounded-lg hover:bg-slate-800"
                  aria-label="Próximo mês"
                >
                  <Feather.ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-7 text-[11px] sm:text-xs font-semibold text-slate-400 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(
                    (d) => (
                      <div key={d} className="text-center py-1">
                        {d}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-rows-6 gap-2">
                  {monthWeeks.map((week, wi) => (
                    <div
                      key={`w-${wi}`}
                      className="grid grid-cols-7 gap-2"
                    >
                      {week.map((d, di) => {
                        const inMonth =
                          d.getMonth() === calMonth.getMonth();
                        const k = `${d.getFullYear()}-${pad2(
                          d.getMonth() + 1
                        )}-${pad2(d.getDate())}`;
                        const count = monthVisitMap.get(k) || 0;
                        const today = isSameDay(d, new Date());

                        return (
                          <button
                            key={`d-${wi}-${di}`}
                            className={[
                              'h-20 sm:h-24 rounded-lg border flex flex-col items-center justify-between p-2 text-xs min-w-[72px] transition',
                              inMonth
                                ? 'bg-slate-900'
                                : 'bg-slate-900/40',
                              count > 0
                                ? 'border-emerald-400/70 ring-1 ring-emerald-500/40'
                                : 'border-slate-700',
                              count > 0
                                ? 'hover:bg-slate-800/80'
                                : 'hover:bg-slate-900/80',
                              today
                                ? 'outline outline-1 outline-emerald-400'
                                : '',
                            ].join(' ')}
                            onClick={() =>
                              count > 0 && openDrawerForDate(d)
                            }
                            disabled={count === 0}
                            title={
                              count > 0
                                ? `Ver ${count} visita(s)`
                                : 'Sem visitas'
                            }
                          >
                            <div className="w-full flex items-center justify-between">
                              <span
                                className={[
                                  'font-semibold',
                                  inMonth
                                    ? 'text-slate-100'
                                    : 'text-slate-500',
                                ].join(' ')}
                              >
                                {d.getDate()}
                              </span>
                              {today && (
                                <span className="text-[10px] text-emerald-400">
                                  hoje
                                </span>
                              )}
                            </div>
                            {count > 0 && (
                              <div className="w-full">
                                <div className="text-[10px] text-emerald-300 mb-1">
                                  Visitas
                                </div>
                                <div className="h-1.5 w-full bg-emerald-900/40 rounded">
                                  <div
                                    className="h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        count * 25
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <div className="mt-1 text-[10px] text-right text-slate-200">
                                  {count}
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3">
              * Clique em um dia com visitas para abrir os detalhes no painel
              lateral.
            </p>
          </div>

          {/* PRÓXIMAS VISITAS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
            <h3 className="text-base sm:text-lg font-semibold text-slate-50 mb-3">
              Próximas visitas
            </h3>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {visitsFlatSorted.length === 0 && (
                <div className="text-sm text-slate-400">
                  Nenhuma visita a partir do período selecionado.
                </div>
              )}
              {visitsFlatSorted.slice(0, 60).map(({ client, date }, idx) => (
                <button
                  key={`${client.chat_id}-${idx}`}
                  className="w-full text-left border border-slate-800 rounded-lg p-3 flex items-center justify-between hover:bg-slate-800/80 cursor-pointer transition"
                  onClick={() => {
                    setSelectedDate(new Date(date));
                    setClientOpen(client);
                    setDrawerOpen(true);
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-50">
                      {client.name || 'Cliente sem nome'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {client.phone || '—'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-emerald-300">
                      {date.toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {pad2(date.getHours())}:{pad2(date.getMinutes())}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-6 text-center text-[11px] text-slate-500">
          Zailon Intelligence • Atualizado agora
        </div>
      </div>

      {/* PAINEL LATERAL */}
      <div
        className={[
          'fixed inset-0 z-[60] pointer-events-none',
          drawerOpen ? 'pointer-events-auto' : '',
        ].join(' ')}
        aria-hidden={!drawerOpen}
      >
        <div
          className={[
            'absolute inset-0 bg-black/60 transition-opacity',
            drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
          ].join(' ')}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={[
            'absolute right-0 top-0 h-full w-full sm:w-[420px]',
            'bg-slate-950 border-l border-slate-800 shadow-2xl',
            'transition-transform',
            drawerOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="sm:hidden mr-1 p-2 rounded-lg hover:bg-slate-900"
                onClick={() => setDrawerOpen(false)}
                aria-label="Voltar para a Dashboard"
              >
                <Feather.ArrowLeft className="text-slate-200" />
              </button>
              <div>
                <div className="text-xs text-slate-400">Visitas em</div>
                <div className="text-lg font-semibold text-slate-50">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                      })
                    : '—'}
                </div>
              </div>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-slate-900"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fechar painel"
            >
              <Feather.X className="text-slate-200" />
            </button>
          </div>

          <div className="p-4 sm:p-5 h-[calc(100%-120px)] overflow-auto pb-28">
            {!selectedBucket || selectedBucket.clients.length === 0 ? (
              <div className="text-sm text-slate-400">
                Nenhum cliente nesta data.
              </div>
            ) : clientOpen ? (
              <ClientOverviewCard
                client={clientOpen}
                onBack={() => setClientOpen(null)}
              />
            ) : (
              <div className="space-y-3">
                {selectedBucket.clients
                  .map((c) => ({ c, d: getVisitAtRobusto(c as any)! }))
                  .sort((a, b) => a.d.getTime() - b.d.getTime())
                  .map(({ c, d }) => (
                    <button
                      key={c.chat_id}
                      className="w-full text-left border border-slate-800 rounded-lg p-3 hover:bg-slate-900/80"
                      onClick={() => setClientOpen(c)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-50">
                          {c.name || 'Cliente sem nome'}
                        </div>
                        <div className="text-xs font-semibold text-emerald-300">
                          {pad2(d.getHours())}:{pad2(d.getMinutes())}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {c.phone || '—'}
                      </div>
                      {!!(c as any)?.bot_data?.deal_type && (
                        <div className="text-[11px] text-slate-500 mt-1">
                          Tipo:{' '}
                          {(c as any).bot_data.deal_type}
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-slate-950 border-t border-slate-800">
            {clientOpen ? (
              <button
                onClick={() => setClientOpen(null)}
                className="w-full py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-900 hover:bg-white"
              >
                Voltar para lista
              </button>
            ) : (
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-900 hover:bg-white"
              >
                Fechar painel
              </button>
            )}
            <div className="text-[10px] text-slate-500 mt-1 text-center">
              Dica: arraste para a direita para fechar
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ===========================
   FUNIL DE VENDAS – CARDS
   =========================== */

function FunnelCards({
  funilCounts,
  total,
}: {
  funilCounts: Record<string, number>;
  total: number;
}) {
  const etapasComValor = FUNIL_ETAPAS.filter(
    (etapa) => (funilCounts[etapa.id] || 0) > 0
  );

  if (etapasComValor.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
        <h2 className="text-lg md:text-xl font-semibold text-slate-50 mb-2">
          Funil de Vendas
        </h2>
        <p className="text-sm text-slate-400">
          Nenhuma etapa com dados para o período selecionado.
        </p>
      </div>
    );
  }

  const max = Math.max(
    ...etapasComValor.map((etapa) => funilCounts[etapa.id] || 0),
    1
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-6 shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-slate-50">
          Funil de Vendas
        </h2>
        <span className="text-[11px] text-slate-400">
          Mostrando apenas etapas com movimento
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {etapasComValor.map((etapa, i) => {
          const value = funilCounts[etapa.id] || 0;
          const pct = total > 0 ? (value / total) * 100 : 0;
          const width = (value / max) * 100;

          return (
            <motion.div
              key={etapa.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-sky-500/10 via-cyan-500/10 to-emerald-400/10 px-4 py-4 shadow-[0_18px_50px_rgba(8,47,73,0.9)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.3),_transparent_60%)] opacity-60 pointer-events-none" />

              <div className="relative flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-semibold text-slate-50">
                  {etapa.label}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/40 border border-cyan-400/40 px-2 py-0.5 text-[10px] text-cyan-100">
                  {pct.toFixed(0)}% dos leads
                </span>
              </div>

              <div className="relative flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-50 leading-none">
                  {value}
                </p>
                <span className="text-[11px] text-slate-200 mt-1">
                  registros
                </span>
              </div>

              <div className="mt-3 h-1.5 w-full bg-slate-900/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 rounded-full"
                  style={{ width: `${Math.min(width, 100)}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ===========================
   Card “gourmetizado” do cliente
   =========================== */

function ClientOverviewCard({
  client,
  onBack,
}: {
  client: any;
  onBack: () => void;
}) {
  const bd = client?.bot_data || {};

  const interested = (() => {
    try {
      const iv = bd?.interested_vehicles;
      const arr = typeof iv === 'string' ? JSON.parse(iv) : iv;
      if (Array.isArray(arr) && arr[0]?.nome) return arr[0];
      return null;
    } catch {
      return null;
    }
  })();

  const whatsappHref = client?.phone
    ? `https://wa.me/${String(client.phone).replace(/\D+/g, '')}`
    : '';

  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="text-[11px] sm:text-xs">
      <div className="text-slate-400 mb-1">{label}</div>
      <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100">
        {children || '—'}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[11px] text-slate-400 hover:text-slate-200 mb-1"
      >
        <Feather.ArrowLeft className="w-3 h-3" />
        Voltar para lista de visitas
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold text-slate-50">
            {client?.name || 'Cliente'}
          </div>
          <div className="text-xs text-slate-400">
            {client?.phone || '—'}
          </div>
        </div>
        <div className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
          {(bd?.state || client?.state || '').replace(/_/g, ' ') || '—'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Field label="Tipo de negócio">
          {bd?.deal_type || client?.deal_type || '—'}
        </Field>
        <Field label="Veículo de interesse">
          {interested?.nome || '—'}
        </Field>
        <Field label="Orçamento">
          {bd?.budget?.value
            ? formatToBRL(parseCurrency(bd?.budget?.value))
            : '—'}
        </Field>
        <Field label="Valor alvo do veículo">
          {formatToBRL(
            parseCurrency(bd?.vehicle_price || interested?.preco)
          )}
        </Field>
        <Field label="Observações">
          {bd?.notes || bd?.observacoes || 'Sem observações.'}
        </Field>
      </div>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shadow-[0_18px_40px_rgba(16,185,129,0.7)]"
        >
          <Feather.MessageCircle className="w-4 h-4" />
          Chamar no WhatsApp
        </a>
      )}
    </div>
  );
}

export default Dashboard;
