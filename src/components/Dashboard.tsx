import React, { useMemo, useRef, useCallback } from 'react';
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

// === COLUNAS EXATAS DO BANCO (IGUAL AO CRM) ===
const KANBAN_COLUMNS = [
  { id: 'leed_recebido', name: 'Novo Lead' },
  { id: 'aguardando_interesse', name: 'Aguardando Interesse' },
  { id: 'aguardando_escolha_carro', name: 'Aguardando Escolha' },
  { id: 'aguardando_confirmacao_veiculo', name: 'Aguardando Confirmação' },
  { id: 'aguardando_opcao_pagamento', name: 'Aguardando Pagamento' },
  { id: 'dados_troca', name: 'Dados de Troca' },
  { id: 'dados_visita', name: 'Dados de Visita' },
  { id: 'dados_financiamento', name: 'Dados de Financiamento' },
  { id: 'finalizado', name: 'Atendimento Finalizado' },
];

// Grupos (apenas para o gráfico do funil)
const AGUARDANDO_IDS = [
  'aguardando_interesse',
  'aguardando_escolha_carro',
  'aguardando_confirmacao_veiculo',
  'aguardando_opcao_pagamento',
];
const DADOS_IDS = ['dados_troca', 'dados_visita', 'dados_financiamento'];

/** Parser de moeda BRL tolerante */
const parseCurrency = (v: any): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const raw = String(v ?? '').trim();
  if (!raw) return 0;

  // BRL comum: remove R$, espaços e separador de milhar; primeira vírgula vira ponto
  const brlLike = raw
    .replace(/\s+/g, '')
    .replace(/R\$\s?/gi, '')
    .replace(/\./g, '')
    .replace(/,/, '.');

  let n = Number(brlLike);
  if (Number.isFinite(n)) return n;

  // Fallback: extrai apenas dígitos e interpreta como centavos se >= 3 dígitos
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return 0;
  n = digits.length >= 3 ? Number(digits) / 100 : Number(digits);
  return Number.isFinite(n) ? n : 0;
};

/** Pega o melhor preço (maior válido) disponível para o cliente */
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

  // Campos agregados
  candidates.push(
    b?.vehicle_price,
    b?.valor_negociacao,
    b?.valor_negociacao_total,
    b?.budget?.value,
    b?.orcamento?.valor,
    b?.negociacao?.valor
  );

  const parsed = candidates.map(parseCurrency).filter((x) => Number.isFinite(x) && x > 0);
  return parsed.length ? Math.max(...parsed) : 0;
};

const formatToBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(
    Number.isFinite(v) ? v : 0
  );

export function Dashboard() {
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { lojaId, isLoading: authLoading } = useAuth();

  const { data: storeDetailsData } = useQuery({ queryKey: ['storeDetails'], queryFn: fetchStoreDetails });
  const { data: clients = [], isLoading: cLoading } = useQuery<ClientType[]>({
    queryKey: ['clients', lojaId],
    queryFn: fetchClients,
    enabled: !!lojaId,
  });
  const { data: vehicles = [], isLoading: vLoading } = useQuery<CarType[]>({
    queryKey: ['vehicles', lojaId],
    queryFn: () => fetchAvailableCars(lojaId!),
    enabled: !!lojaId,
  });

  // ---- TUDO A PARTIR DAQUI SÃO HOOKS: ORDEM FIXA ----

  const dashboardData = useMemo(() => {
    if (!clients.length) return null;

    // Contagens detalhadas (para cards / grids)
    const funnelCountsRaw = KANBAN_COLUMNS.map(
      (col) => clients.filter((c) => (c.bot_data?.state || c.state) === col.id).length
    );

    // Funil agrupado (gráfico)
    const novoLead = clients.filter((c) => (c.bot_data?.state || c.state) === 'leed_recebido').length;
    const aguardando = clients.filter((c) => AGUARDANDO_IDS.includes(c.bot_data?.state || c.state)).length;
    const dados = clients.filter((c) => DADOS_IDS.includes(c.bot_data?.state || c.state)).length;
    const finalizado = clients.filter((c) => (c.bot_data?.state || c.state) === 'finalizado').length;

    const funnelChartLabels = ['Novo Lead', 'Aguardando', 'Dados', 'Finalizado'];
    const funnelChartValues = [novoLead, aguardando, dados, finalizado];

    // Tipo de negócio
    const tipoOrdemFixa: Array<'À vista' | 'Financiado' | 'Troca'> = ['À vista', 'Financiado', 'Troca'];
    const tipoCountBase = { 'À vista': 0, 'Financiado': 0, Troca: 0 } as Record<(typeof tipoOrdemFixa)[number], number>;
    const tipoCount = clients.reduce((acc, c) => {
      const tipoRaw = c.bot_data?.deal_type;
      if (!tipoRaw) return acc;
      const normalized = String(tipoRaw).toLowerCase();
      if (normalized.includes('vista')) acc['À vista'] += 1;
      else if (normalized.includes('financ')) acc['Financiado'] += 1;
      else if (normalized.includes('troca')) acc['Troca'] += 1;
      return acc;
    }, { ...tipoCountBase });
    const tipoLabels = [...tipoOrdemFixa];
    const tipoValues = tipoLabels.map((k) => tipoCount[k]);

    const totalPropostas = clients.length;
    const emEstoque = vehicles.length;

    // Valor em negociação (somente não finalizados)
    const valorNegociacaoNum = clients
      .filter((c) => (c.bot_data?.state || c.state) !== 'finalizado')
      .reduce((acc, c) => acc + pickVehiclePrice(c), 0);

    const funnelData = {
      labels: funnelChartLabels,
      datasets: [
        {
          data: funnelChartValues,
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
      labels: tipoLabels,
      datasets: [
        {
          data: tipoValues,
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

    const maxFunnel = Math.max(1, ...funnelChartValues);
    const maxTipo = Math.max(1, ...tipoValues);

    return {
      cards: [
        { title: 'Total de Propostas', value: totalPropostas, change: '+22%', route: '../crm' },
        { title: 'Veículos em Estoque', value: emEstoque, change: '+5%', route: '../catalog' },
        { title: 'Vendas Finalizadas', value: finalizado, change: '+18%', route: '../crm#finalizado' },
        { title: 'Valor em Negociação', value: formatToBRL(valorNegociacaoNum), change: '+32%' },
      ],
      funnelData,
      tipoData,
      funnelCountsRaw,
      funnelChartLabels,
      funnelChartValues,
      tipoLabels,
      tipoValues,
      valorNegociacao: formatToBRL(valorNegociacaoNum),
      maxFunnel,
      maxTipo,
    };
  }, [clients, vehicles]);

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

  const funnelOptions = useMemo(() => {
    if (!dashboardData) return baseChartOptions;
    return {
      ...baseChartOptions,
      scales: { ...baseChartOptions.scales, y: { ...baseChartOptions.scales.y, suggestedMax: dashboardData.maxFunnel } },
    };
  }, [baseChartOptions, dashboardData]);

  const tipoOptions = useMemo(() => {
    if (!dashboardData) return baseChartOptions;
    return {
      ...baseChartOptions,
      scales: { ...baseChartOptions.scales, y: { ...baseChartOptions.scales.y, suggestedMax: dashboardData.maxTipo } },
    };
  }, [baseChartOptions, dashboardData]);

  const exportToPDF = useCallback(async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`Dashboard_${storeDetailsData?.nome || 'Zailon'}_${new Date().toLocaleDateString('pt-BR')}.pdf`);
  }, [storeDetailsData?.nome]);

  // ---- SÓ AGORA OS RETURNS CONDICIONAIS ----

  if (authLoading || cLoading || vLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Feather.AlertCircle className="w-20 h-20 text-red-500 mb-4" />
        <p className="text-2xl font-semibold text-gray-700">Sem dados</p>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {storeDetailsData?.logo_url ? (
              <img src={storeDetailsData.logo_url} alt="Logo" className="w-14 h-14 rounded-full object-contain bg-white shadow" />
            ) : (
              <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {storeDetailsData?.nome?.[0] || 'Z'}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard <span className="text-emerald-600">{storeDetailsData?.nome || 'Zailon'}</span>
              </h1>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <button
            onClick={exportToPDF}
            className="px-5 py-3 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 transition flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <Feather.Download className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardData.cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow border border-gray-100 p-5 cursor-pointer hover:shadow-lg transition"
              onClick={() => card.route && navigate(card.route)}
            >
              <div className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-t-2xl mb-3"></div>
              <p className="text-xs font-medium text-gray-500 uppercase">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              <span className="text-xs text-emerald-600 font-medium">{card.change}</span>
            </motion.div>
          ))}
        </div>

        {/* GRÁFICOS */}
        <div className="space-y-10">
          {/* FUNIL AGRUPADO */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Funil de Vendas</h2>
            <div className="h-64 sm:h-80">
              <Line data={dashboardData.funnelData} options={funnelOptions} />
            </div>
          </motion.div>

          {/* TIPO DE NEGÓCIO */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Tipo de Negócio</h2>
            <div className="h-64 sm:h-80">
              <Line data={dashboardData.tipoData} options={tipoOptions} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-center">
              {dashboardData.tipoLabels.map((label, i) => (
                <div key={i} className="text-xs">
                  <div className="font-bold text-gray-900 text-lg">{dashboardData.tipoValues[i]}</div>
                  <div className="text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* VALOR EM NEGOCIAÇÃO */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-10">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl p-8 text-center shadow-2xl">
            <p className="text-2xl font-bold text-zinc-800 opacity-90">Valor Total em Negociação</p>
            <p className="text-5xl sm:text-7xl font-black text-zinc-900 mt-4">{dashboardData.valorNegociacao}</p>
          </div>
        </motion.div>

        <div className="mt-12 text-center text-xs text-gray-500">
          <p>Zailon Intelligence • Atualizado agora</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
