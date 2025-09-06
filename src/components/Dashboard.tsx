import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { fetchClients, fetchAvailableCars, Client as ClientType, Car as CarType } from '@/services/api';

// Registra os componentes necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, Title);

const formatDuration = (totalSeconds: number) => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "0s";
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  const days = Math.floor(totalSeconds / 86400); if (days > 0) return `${days}d`;
  const hours = Math.floor((totalSeconds % 86400) / 3600); if (hours > 0) return `${hours}h`;
  const minutes = Math.floor((totalSeconds % 3600) / 60); return `${minutes}m`;
};

const KANBAN_COLUMNS = [
  { id: "leed_recebido", name: "Novo Lead" },
  { id: "aguardando_interesse", name: "Aguardando Interesse" },
  { id: "aguardando_escolha_carro", name: "Aguardando Escolha" },
  { id: "finalizado", name: "Atendimento Finalizado" },
];

const getClientColumnId = (state: string) => {
  if (!state) return "leed_recebido";
  if (KANBAN_COLUMNS.some(col => col.id === state)) return state;
  return "leed_recebido";
};

const parseCurrency = (value: string | number) => Number(String(value).replace(/[^0-9,]/g, '').replace(',', '.')) || 0;

export function Dashboard() {
  const { data: clients = [], isLoading: isLoadingClients, error: errorClients } = useQuery<ClientType[]>({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });

  const { data: vehicles = [], isLoading: isLoadingVehicles, error: errorVehicles } = useQuery<CarType[]>({
    queryKey: ['vehicles'],
    queryFn: fetchAvailableCars,
  });

  const dashboardData = useMemo(() => {
    if (!clients || !vehicles) return null;

    const totalClients = clients.length;
    const totalSales = clients.filter(c => c.bot_data?.state === 'finalizado').length;
    const totalVehicles = vehicles.length;

    let totalDuration = 0;
    let clientsWithHistory = 0;
    clients.forEach(client => {
      if (client.bot_data?.history && client.bot_data.history.length > 1) {
        try {
          const parseDate = (str: string) => {
            const [date, time] = str.split(', ');
            const [day, month, year] = date.split('/');
            return new Date(`${year}-${month}-${day}T${time}`);
          };
          const start = parseDate(client.bot_data.history[0].timestamp);
          const end = parseDate(client.bot_data.history[1].timestamp);
          const duration = (end.getTime() - start.getTime()) / 1000;
          if (duration > 0) {
            totalDuration += duration;
            clientsWithHistory++;
          }
        } catch (e) { /* Ignora erros de parsing */ }
      }
    });
    const avgResponseTime = clientsWithHistory > 0 ? formatDuration(totalDuration / clientsWithHistory) : 'N/A';

    const statusCount = clients.reduce((acc: { [key: string]: number }, client: ClientType) => {
      const columnId = getClientColumnId(client.bot_data?.state);
      const columnName = KANBAN_COLUMNS.find(col => col.id === columnId)?.name || 'Outros';
      acc[columnName] = (acc[columnName] || 0) + 1;
      return acc;
    }, {});

    const paymentMethodCount = clients.reduce((acc: { [key: string]: number }, client: ClientType) => {
      const method = client.bot_data?.deal_type || client.deal_type || 'Não Informado';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    return {
      stats: [
        { title: 'Total de Clientes', value: totalClients, icon: Feather.Users, color: 'bg-amber-500' },
        { title: 'Veículos em Estoque', value: totalVehicles, icon: Feather.Truck, color: 'bg-amber-500' },
        { title: 'Atendimentos Finalizados', value: totalSales, icon: Feather.DollarSign, color: 'bg-amber-500' },
        { title: 'Tempo Médio de Resposta', value: avgResponseTime, icon: Feather.BarChart2, color: 'bg-amber-500' },
      ],
      doughnutData: {
        labels: Object.keys(statusCount),
        datasets: [{
          data: Object.values(statusCount),
          backgroundColor: ['#f59e0b', '#d97706', '#eab308', '#f97316', '#ef4444'], // amber-500, amber-600, yellow-500, orange-500, red-500
          hoverBackgroundColor: ['#f59e0bCC', '#d97706CC', '#eab308CC', '#f97316CC', '#ef4444CC'], // Tons com leve transparência no hover
          hoverOffset: 8,
          borderWidth: 0,
        }],
      },
      lineData: {
        labels: Object.keys(paymentMethodCount),
        datasets: [{
          label: 'Número de Clientes',
          data: Object.values(paymentMethodCount),
          borderColor: '#f59e0b', // amber-500
          backgroundColor: '#f59e0b66', // amber-500 com transparência
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#f59e0b',
          fill: true,
          tension: 0.4, // Suaviza as linhas
        }],
      }
    };
  }, [clients, vehicles]);

  // Animações
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
  };

  if (isLoadingClients || isLoadingVehicles) {
    return (
      <div className="space-y-6 p-6 relative z-10">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="text-zinc-800">Carregando dashboard...</div>
        </motion.div>
      </div>
    );
  }
  if (errorClients || errorVehicles) {
    return (
      <div className="space-y-6 p-6 relative z-10">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="text-red-500">Erro ao carregar dados: {errorClients?.message || errorVehicles?.message}</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 relative z-10">
      <motion.h1
        className="text-3xl font-bold text-zinc-900"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        Dashboard de Métricas
      </motion.h1>

      {/* Cards de Métricas */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        {dashboardData.stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={fadeInUp}>
              <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm hover:border-amber-400/50 transition-colors">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-zinc-600">{stat.title}</h3>
                  <Icon className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Gráficos */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.div variants={fadeInUp}>
          <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Distribuição de Clientes por Status</h3>
            <div className="h-64">
              <Doughnut
                data={dashboardData.doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#3f3f46' } } },
                }}
              />
            </div>
          </div>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Clientes por Tipo de Pagamento</h3>
            <div className="h-64">
              <Line
                data={dashboardData.lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, color: '#3f3f46' },
                  },
                  scales: {
                    x: { ticks: { color: '#3f3f46' } },
                    y: {
                      ticks: { color: '#3f3f46' },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Dashboard;