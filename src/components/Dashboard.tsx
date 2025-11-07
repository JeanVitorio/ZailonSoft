// src/components/Dashboard.tsx
import React, { useMemo, useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

/* ===========================
   CONFIG / CONSTANTES
   =========================== */
const AGUARDANDO_IDS = [
  'aguardando_interesse',
  'aguardando_escolha_carro',
  'aguardando_confirmacao_veiculo',
  'aguardando_opcao_pagamento',
];
const DADOS_IDS = ['dados_troca', 'dados_visita', 'dados_financiamento'];

const formatToBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(
    Number.isFinite(v) ? v : 0
  );

/* ===========================
   PARSERS / HELPERS
   =========================== */
const parseCurrency = (v: any): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const raw = String(v ?? '').trim();
  if (!raw) return 0;
  const brlLike = raw.replace(/\s+/g, '').replace(/R\$\s?/gi, '').replace(/\./g, '').replace(/,/, '.');
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

/** Data de referência geral (primeiro contato) */
const getClientRefDate = (c: any): Date | null => {
  const bd = c?.bot_data ?? {};
  const direct = [
    c?.created_at, c?.first_message_at, c?.first_seen, c?.timestamp,
    bd?.created_at, bd?.first_contact_at, bd?.first_seen_at, bd?.timestamp,
  ];
  for (const v of direct) {
    const d = tryEpoch(v) || tryISOorNative(v) || tryDMY_HM(v) || tryYMD_HM(v);
    if (d) return d;
  }
  const hist = Array.isArray(bd?.history) ? bd.history : [];
  for (const h of hist) {
    const d = tryISOorNative(h?.timestamp) || tryDMY_HM(h?.timestamp) || tryYMD_HM(h?.timestamp);
    if (d) return d;
  }
  return null;
};

/** Data de envio do formulário (mais assertiva) */
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
    const d = tryEpoch(v) || tryISOorNative(v) || tryDMY_HM(v) || tryYMD_HM(v);
    if (d) return d;
  }

  // fallback: se não achar, usa a ref geral (não ideal, mas melhor que contar zero)
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
        it.preco, it.valor, it.price, it.preco_tabela, it.preco_sugerido, it.preco_anunciado
      );
    }
  }
  const iv = b?.interested_vehicle;
  if (iv) candidates.push(iv.preco, iv.valor, iv.price, iv.preco_tabela, iv.preco_sugerido, iv.preco_anunciado);
  const vehicle = b?.vehicle;
  if (vehicle) candidates.push(vehicle.preco, vehicle.valor, vehicle.price, vehicle.preco_tabela, vehicle.preco_sugerido);

  candidates.push(
    b?.vehicle_price, b?.valor_negociacao, b?.valor_negociacao_total,
    b?.budget?.value, b?.orcamento?.valor, b?.negociacao?.valor
  );

  const parsed = candidates.map(parseCurrency).filter((x) => Number.isFinite(x) && x > 0);
  return parsed.length ? Math.max(...parsed) : 0;
};

/** Data da visita (robusto) */
const getVisitAtRobusto = (client: any): Date | null => {
  const rootVD = client?.visit_details ?? {};
  const bd = client?.bot_data ?? {};
  const ag = bd?.agendamento ?? rootVD?.agendamento ?? {};
  const vdCRM = bd?.visit_details ?? {};

  const direct = [
    rootVD?.visit_at, rootVD?.datetime, rootVD?.dateTime, rootVD?.when, rootVD?.timestamp,
    vdCRM?.visit_at, vdCRM?.datetime, vdCRM?.dateTime, vdCRM?.when, vdCRM?.timestamp,
    bd?.visit_at, bd?.visitAt, bd?.when, bd?.timestamp,
    ag?.visit_at, ag?.datetime, ag?.dateTime, ag?.timestamp,
  ];
  for (const c of direct) {
    const d = tryEpoch(c) || tryISOorNative(c) || tryDMY_HM(c) || tryYMD_HM(c);
    if (d) return d;
  }

  const dateCandidates = [
    vdCRM?.day, vdCRM?.date, vdCRM?.dia, vdCRM?.data,
    rootVD?.day, rootVD?.date, rootVD?.dia, rootVD?.data,
    ag?.day, ag?.date, ag?.dia, ag?.data,
    bd?.day, bd?.date, bd?.dia, bd?.data,
  ];
  const timeCandidates = [vdCRM?.time, vdCRM?.hora, rootVD?.time, rootVD?.hora, ag?.time, ag?.hora, bd?.time, bd?.hora];
  for (const dc of dateCandidates) {
    if (!dc) continue;
    const tries = timeCandidates.filter(Boolean);
    if (tries.length === 0) tries.push(undefined as any);
    for (const tc of tries) {
      const d1 = tryYMD_HM(dc, tc) || tryDMY_HM(dc, tc);
      if (d1) return d1;
    }
  }

  const epochish = [vdCRM?.day, vdCRM?.datetime, rootVD?.datetime, bd?.visit_at, ag?.date]
    .find((x) => x != null && /^\d{10,13}$/.test(String(x)));
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
   DASHBOARD
   =========================== */
type RangeMode = 'today' | '7d' | '30d' | 'custom';

export function Dashboard() {
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { lojaId, isLoading: authLoading } = useAuth();

  // -------- Filtro global (termina em HOJE)
  const [mode, setMode] = useState<RangeMode>('7d'); // padrão: últimos 7 dias
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>(''); // agora usado

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
    } else { // custom
      start = customStart ? new Date(customStart + 'T00:00:00') : new Date(end);
      end = customEnd ? new Date(customEnd + 'T23:59:59.999') : end;
      label = `De ${customStart || '—'} até ${customEnd || 'hoje'}`;
    }
    return { start, end, label };
  };
  const activeRange = computeRange();

  // Calendário
  const [calMonth, setCalMonth] = useState<Date>(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState<ClientType | null>(null);

  const { data: storeDetailsData } = useQuery({ queryKey: ['storeDetails'], queryFn: fetchStoreDetails });

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

  // --- Clientes para MÉTRICAS (passado + hoje)
  const metricClients = useMemo(() => {
    const { start, end } = activeRange;
    return (clientsRaw || []).filter((c) => {
      const d = getClientRefDate(c);
      if (!d) return false;
      return d >= start && d <= end;
    });
  }, [clientsRaw, activeRange.start.getTime(), activeRange.end.getTime()]);

  // --- Total de FORMULÁRIOS dentro do período (usa data real de envio)
  const totalFormularios = useMemo(() => {
    const { start, end } = activeRange;
    let count = 0;
    for (const c of clientsRaw) {
      const d = getClientRefDate(c); // Use getClientRefDate for all types
      if (!d) continue;
      if (d >= start && d <= end) count += 1;
    }
    return count;
  }, [clientsRaw, activeRange.start.getTime(), activeRange.end.getTime()]);

  // --- VISITAS: do início do período para FRENTE (inclui futuro)
  const visitsAll = useMemo(() => {
    const { start } = activeRange;
    const map = new Map<string, { date: Date; clients: ClientType[] }>();
    for (const c of clientsRaw) {
      const d = getVisitAtRobusto(c as any);
      if (!d) continue;
      if (d < start) continue;
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      if (!map.has(key)) map.set(key, { date: new Date(d.getFullYear(), d.getMonth(), d.getDate()), clients: [] });
      map.get(key)!.clients.push(c);
    }
    return map;
  }, [clientsRaw, activeRange.start.getTime()]);

  const visitsCount = visitsAll.size;
  const visitsFlatSorted = useMemo(() => {
    const out: Array<{ client: ClientType; date: Date }> = [];
    for (const [, bucket] of visitsAll) {
      for (const cl of bucket.clients) out.push({ client: cl, date: getVisitAtRobusto(cl as any)! });
    }
    return out.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [visitsAll]);

  /* ---------- DADOS DERIVADOS ---------- */
  const dashboardData = useMemo(() => {
    const novoLead = metricClients.filter((c) => (c.bot_data?.state || c.state) === 'leed_recebido').length;
    const aguardando = metricClients.filter((c) => AGUARDANDO_IDS.includes(c.bot_data?.state || c.state)).length;
    const dados = metricClients.filter((c) => DADOS_IDS.includes(c.bot_data?.state || c.state)).length;
    const finalizado = metricClients.filter((c) => (c.bot_data?.state || c.state) === 'finalizado').length;

    const tipoOrdemFixa: Array<'À vista' | 'Financiado' | 'Troca'> = ['À vista', 'Financiado', 'Troca'];
    const tipoCountBase = { 'À vista': 0, 'Financiado': 0, Troca: 0 } as Record<(typeof tipoOrdemFixa)[number], number>;
    const tipoCount = metricClients.reduce((acc, c) => {
      const tipoRaw = c.bot_data?.deal_type;
      if (!tipoRaw) return acc;
      const normalized = String(tipoRaw).toLowerCase();
      if (normalized.includes('vista')) acc['À vista'] += 1;
      else if (normalized.includes('financ')) acc['Financiado'] += 1;
      else if (normalized.includes('troca')) acc['Troca'] += 1;
      return acc;
    }, { ...tipoCountBase });

    const valorNegociacaoNum = metricClients
      .filter((c) => (c.bot_data?.state || c.state) !== 'finalizado')
      .reduce((acc, c) => acc + pickVehiclePrice(c), 0);

    const funnelData = {
      labels: ['Novo Lead', 'Aguardando', 'Dados', 'Finalizado'],
      datasets: [
        {
          data: [novoLead, aguardando, dados, finalizado],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(251, 158, 11, 0.08)',
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          spanGaps: true,
        },
      ],
    };

    const tipoData = {
      labels: tipoOrdemFixa,
      datasets: [
        {
          data: tipoOrdemFixa.map((k) => tipoCount[k]),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          spanGaps: true,
        },
      ],
    };

    const maxFunnel = Math.max(1, novoLead, aguardando, dados, finalizado);
    const maxTipo = Math.max(1, ...tipoOrdemFixa.map((k) => tipoCount[k]));

    return {
      cards: [
        { title: 'Total de Formulários', value: totalFormularios },
        { title: 'Visitas Marcadas (dias)', value: visitsCount, route: '../crm#dados_visita' },
        { title: 'Veículos em Estoque', value: vehicles.length, route: '../catalog' },
        { title: 'Atendimentos Finalizados', value: finalizado, route: '../crm#finalizado' },
        { title: 'Valor em Negociação', value: formatToBRL(valorNegociacaoNum) },
      ],
      funnelData,
      tipoData,
      maxFunnel,
      maxTipo,
      valorNegociacao: formatToBRL(valorNegociacaoNum),
    };
  }, [metricClients, vehicles.length, visitsCount, totalFormularios]);

  const baseChartOptions = useMemo(
    () =>
      ({
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 300 },
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1f2937', intersect: false } },
        elements: { line: { borderJoinStyle: 'round' }, point: { hitRadius: 8 } },
        scales: {
          x: { grid: { display: false }, ticks: { display: false } },
          y: { beginAtZero: true, grid: { display: false }, ticks: { display: false } },
        },
      }) as const,
    []
  );
  const funnelOptions = useMemo(() => ({
    ...baseChartOptions,
    scales: { ...baseChartOptions.scales, y: { ...baseChartOptions.scales.y, suggestedMax: dashboardData.maxFunnel } },
  }), [baseChartOptions, dashboardData.maxFunnel]);
  const tipoOptions = useMemo(() => ({
    ...baseChartOptions,
    scales: { ...baseChartOptions.scales, y: { ...baseChartOptions.scales.y, suggestedMax: dashboardData.maxTipo } },
  }), [baseChartOptions, dashboardData.maxTipo]);

  /* ---------- Exportação PDF ---------- */
  const exportToPDFFull = useCallback(async () => {
    if (!dashboardRef.current) return;
    const el = dashboardRef.current;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
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
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgFullHeight);
    } else {
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d')!;
      const sliceHeightPx = pageHeight / ratio;
      let renderedHeight = 0;
      while (renderedHeight < canvas.height) {
        const sliceHeight = Math.min(sliceHeightPx, canvas.height - renderedHeight);
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
        pageCtx.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        const sliceImgHeight = sliceHeight * ratio;
        if (renderedHeight === 0) {
          pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, sliceImgHeight);
        } else {
          pdf.addPage();
          pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, sliceImgHeight);
        }
        renderedHeight += sliceHeight;
      }
    }
    pdf.save(`Dashboard_${storeDetailsData?.nome || 'Zailon'}_${new Date().toLocaleDateString('pt-BR')}.pdf`);
  }, [storeDetailsData?.nome]);

  /* ---------- Loading ---------- */
  if (authLoading || cLoading || vLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
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
    if (bucket.date.getMonth() !== calMonth.getMonth() || bucket.date.getFullYear() !== calMonth.getFullYear())
      continue;
    const k = `${bucket.date.getFullYear()}-${pad2(bucket.date.getMonth() + 1)}-${pad2(bucket.date.getDate())}`;
    monthVisitMap.set(k, bucket.clients.length);
  }

  const openDrawerForDate = (d: Date) => {
    setSelectedDate(d);
    setClientOpen(null);
    setDrawerOpen(true);
  };

  const selectedDateKey =
    selectedDate ? `${selectedDate.getFullYear()}-${pad2(selectedDate.getMonth() + 1)}-${pad2(selectedDate.getDate())}` : '';
  const selectedBucket = selectedDateKey ? visitsAll.get(selectedDateKey) : undefined;

  const rangeBadge =
    mode === 'custom'
      ? `De ${customStart || '—'} até ${customEnd || 'hoje'} • Visitas futuras incluídas`
      : `${activeRange.label} • Visitas futuras incluídas`;

  return (
    <div ref={dashboardRef} className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            {storeDetailsData?.logo_url ? (
              <img
                src={storeDetailsData.logo_url}
                alt="Logo"
                className="w-12 h-12 rounded-full object-contain bg-white shadow"
              />
            ) : (
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {storeDetailsData?.nome?.[0] || 'Z'}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Dashboard <span className="text-emerald-600">{storeDetailsData?.nome || 'Zailon'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="mt-1 text-[11px] sm:text-xs text-gray-500">
                Mostrando: <span className="font-semibold text-gray-700">{rangeBadge}</span>
              </div>
            </div>
          </div>

          {/* Filtro compacto */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-1 bg-white border rounded-xl p-1">
              <button
                className={`px-2 py-1.5 text-xs sm:text-sm rounded-lg ${mode==='today'?'bg-emerald-600 text-white':'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setMode('today')}
              >
                Hoje
              </button>
              <button
                className={`px-2 py-1.5 text-xs sm:text-sm rounded-lg ${mode==='7d'?'bg-emerald-600 text-white':'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setMode('7d')}
              >
                7 dias
              </button>
              <button
                className={`px-2 py-1.5 text-xs sm:text-sm rounded-lg ${mode==='30d'?'bg-emerald-600 text-white':'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setMode('30d')}
              >
                30 dias
              </button>
              <button
                className={`px-2 py-1.5 text-xs sm:text-sm rounded-lg ${mode==='custom'?'bg-emerald-600 text-white':'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setMode('custom')}
              >
                Personalizado
              </button>
            </div>

            {mode === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2 py-1.5 rounded border text-sm w-[128px]"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2 py-1.5 rounded border text-sm w-[128px]"
                  placeholder="(opcional)"
                />
              </div>
            )}

            <button
              onClick={exportToPDFFull}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-medium whitespace-nowrap"
            >
              <Feather.Download className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-8">
          {dashboardData.cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl shadow border border-gray-100 p-4 cursor-pointer hover:shadow-lg transition"
              onClick={() => (card as any).route && navigate((card as any).route)}
            >
              <div className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-t-2xl mb-3"></div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">{card.title}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {/* GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">Funil de Vendas</h2>
            <div className="h-56 sm:h-72">
              <Line data={dashboardData.funnelData} options={funnelOptions} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">Tipo de Negócio</h2>
            <div className="h-56 sm:h-72">
              <Line data={dashboardData.tipoData} options={tipoOptions} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              {dashboardData.tipoData.labels.map((label: any, i: number) => (
                <div key={i} className="text-xs">
                  <div className="font-bold text-gray-900 text-lg">
                    {(dashboardData.tipoData.datasets[0] as any).data[i]}
                  </div>
                  <div className="text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* VALOR EM NEGOCIAÇÃO */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-6">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
            <p className="text-xl sm:text-2xl font-bold text-zinc-800 opacity-90">Valor Total em Negociação</p>
            <p className="text-4xl sm:text-6xl font-black text-zinc-900 mt-3">{dashboardData.valorNegociacao}</p>
          </div>
        </motion.div>

        {/* VISITAS — Calendário + Próximas */}
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* CALENDÁRIO */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold">Visitas marcadas (calendário)</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="p-2 rounded hover:bg-gray-100"
                  aria-label="Mês anterior"
                >
                  <Feather.ChevronLeft />
                </button>
                <div className="text-sm font-semibold text-gray-700 w-40 text-center">
                  {calMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </div>
                <button
                  onClick={() => setCalMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="p-2 rounded hover:bg-gray-100"
                  aria-label="Próximo mês"
                >
                  <Feather.ChevronRight />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-7 text-[11px] sm:text-xs font-semibold text-gray-500 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                    <div key={d} className="text-center py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-rows-6 gap-2">
                  {getMonthMatrix(calMonth).map((week, wi) => (
                    <div key={`w-${wi}`} className="grid grid-cols-7 gap-2">
                      {week.map((d, di) => {
                        const inMonth = d.getMonth() === calMonth.getMonth();
                        const k = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
                        const count = monthVisitMap.get(k) || 0;
                        const today = isSameDay(d, new Date());

                        return (
                          <button
                            key={`d-${wi}-${di}`}
                            className={[
                              'h-20 sm:h-24 rounded-lg border flex flex-col items-center justify-between p-2 text-xs min-w-[72px]',
                              inMonth ? 'bg-white' : 'bg-gray-50',
                              count > 0 ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-200',
                              'hover:shadow-sm transition',
                              today ? 'outline outline-1 outline-emerald-400' : '',
                            ].join(' ')}
                            onClick={() => count > 0 && openDrawerForDate(d)}
                            disabled={count === 0}
                            title={count > 0 ? `Ver ${count} visita(s)` : 'Sem visitas'}
                          >
                            <div className="w-full flex items-center justify-between">
                              <span className={['font-semibold', inMonth ? 'text-gray-800' : 'text-gray-400'].join(' ')}>
                                {d.getDate()}
                              </span>
                              {today && <span className="text-[10px] text-emerald-600">hoje</span>}
                            </div>
                            {count > 0 && (
                              <div className="w-full">
                                <div className="text-[10px] text-amber-700 mb-1">Visitas</div>
                                <div className="h-1.5 w-full bg-amber-200 rounded">
                                  <div
                                    className="h-1.5 bg-amber-500 rounded"
                                    style={{ width: `${Math.min(100, count * 25)}%` }}
                                  />
                                </div>
                                <div className="mt-1 text-[10px] text-right text-gray-600">{count}</div>
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

            <p className="text-[11px] text-gray-500 mt-3">
              * Toque em um dia com visitas para abrir a lista no painel.
            </p>
          </div>

          {/* PRÓXIMAS VISITAS */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-3">Próximas visitas</h3>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {visitsFlatSorted.length === 0 && (
                <div className="text-sm text-gray-500">Nenhuma visita a partir do período selecionado.</div>
              )}
              {visitsFlatSorted.slice(0, 60).map(({ client, date }, idx) => (
                <div
                  key={`${client.chat_id}-${idx}`}
                  className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => { setSelectedDate(new Date(date)); setClientOpen(client); setDrawerOpen(true); }}
                >
                  <div>
                    <div className="text-sm font-semibold">{client.name || 'Cliente sem nome'}</div>
                    <div className="text-xs text-gray-500">{client.phone || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-amber-700">
                      {date.toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-600">
                      {pad2(date.getHours())}:{pad2(date.getMinutes())}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-[11px] text-gray-500">
          <p>Zailon Intelligence • Atualizado agora</p>
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
            'absolute inset-0 bg-black/30 transition-opacity',
            drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
          ].join(' ')}
          onClick={() => setDrawerOpen(false)}
        />

        <aside
          className={[
            'absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl border-l transition-transform',
            drawerOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 sm:p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="sm:hidden mr-1 p-2 rounded hover:bg-gray-100"
                onClick={() => setDrawerOpen(false)}
                aria-label="Voltar para a Dashboard"
              >
                <Feather.ArrowLeft />
              </button>
              <div>
                <div className="text-sm text-gray-500">Visitas em</div>
                <div className="text-lg font-bold">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
                    : '—'}
                </div>
              </div>
            </div>
            <button
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => setDrawerOpen(false)}
              aria-label="Fechar painel"
            >
              <Feather.X />
            </button>
          </div>

          <div className="p-4 sm:p-5 h-[calc(100%-120px)] overflow-auto pb-28">
            {!selectedBucket || selectedBucket.clients.length === 0 ? (
              <div className="text-sm text-gray-500">Nenhum cliente nesta data.</div>
            ) : clientOpen ? (
              <ClientOverviewCard client={clientOpen} onBack={() => setClientOpen(null)} />
            ) : (
              <div className="space-y-3">
                {selectedBucket.clients
                  .map((c) => ({ c, d: getVisitAtRobusto(c as any)! }))
                  .sort((a, b) => a.d.getTime() - b.d.getTime())
                  .map(({ c, d }) => (
                    <button
                      key={c.chat_id}
                      className="w-full text-left border rounded-lg p-3 hover:bg-gray-50"
                      onClick={() => setClientOpen(c)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{c.name || 'Cliente sem nome'}</div>
                        <div className="text-xs font-semibold text-amber-700">
                          {pad2(d.getHours())}:{pad2(d.getMinutes())}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{c.phone || '—'}</div>
                      {!!(c as any)?.bot_data?.deal_type && (
                        <div className="text-[11px] text-gray-500 mt-1">
                          Tipo: {(c as any).bot_data.deal_type}
                        </div>
                      )}
                      {!!(c as any)?.bot_data?.interested_vehicles && (
                        <div className="text-[11px] text-gray-500 mt-1">
                          Interesse:{' '}
                          {(() => {
                            const iv = (c as any).bot_data.interested_vehicles;
                            try {
                              const arr = typeof iv === 'string' ? JSON.parse(iv) : iv;
                              if (Array.isArray(arr) && arr[0]?.nome) return arr[0].nome;
                            } catch {}
                            return '—';
                          })()}
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t">
            {clientOpen ? (
              <button
                onClick={() => setClientOpen(null)}
                className="w-full py-3 rounded-xl text-[13px] font-semibold bg-gray-900 text-white hover:bg-black"
              >
                Voltar para lista
              </button>
            ) : (
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 rounded-xl text-[13px] font-semibold bg-gray-900 text-white hover:bg-black"
              >
                Fechar painel
              </button>
            )}
            <div className="text-[10px] text-gray-400 mt-1 text-center">
              Dica: arraste para a direita para fechar
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ===========================
   Card “gourmetizado” do cliente
   =========================== */
function ClientOverviewCard({ client, onBack }: { client: any; onBack: () => void }) {
  const bd = client?.bot_data || {};
  const interested = (() => {
    try {
      const iv = bd?.interested_vehicles;
      const arr = typeof iv === 'string' ? JSON.parse(iv) : iv;
      if (Array.isArray(arr) && arr[0]?.nome) return arr[0];
      return null;
    } catch { return null; }
  })();

  const whatsappHref = client?.phone
    ? `https://wa.me/${String(client.phone).replace(/\D+/g, '')}`
    : '';

  const Field = ({ label, children }: any) => (
    <div className="text-[11px] sm:text-xs">
      <div className="text-gray-500 mb-1">{label}</div>
      <div className="bg-gray-50 border rounded-lg px-3 py-2 text-gray-800">{children || '—'}</div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold">{client?.name || 'Cliente'}</div>
          <div className="text-xs text-gray-600">{client?.phone || '—'}</div>
        </div>
        <div className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {(bd?.state || client?.state || '').replace(/_/g, ' ') || '—'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Field label="Tipo de negócio">{bd?.deal_type || '—'}</Field>
        <Field label="Veículo de interesse">{interested?.nome || '—'}</Field>
        <Field label="Orçamento">{bd?.budget?.value ? formatToBRL(parseCurrency(bd?.budget?.value)) : '—'}</Field>
        <Field label="Valor alvo do veículo">
          {formatToBRL(parseCurrency(bd?.vehicle_price || interested?.preco))}
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
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Feather.MessageCircle className="w-4 h-4" />
          Chamar no WhatsApp
        </a>
      )}
    </div>
  );
}

export default Dashboard;