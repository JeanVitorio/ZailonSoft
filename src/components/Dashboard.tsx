import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { fetchClients, fetchAvailableCars, Client as ClientType, Car as CarType } from '@/services/api';

// Registra os componentes necessários do Chart.js (trocamos Line por Bar)
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Funções utilitárias
const KANBAN_COLUMNS = [
    { id: "leed_recebido", name: "Novo Lead" },
    { id: "aguardando_interesse", name: "Aguardando Interesse" },
    { id: "aguardando_escolha_carro", name: "Aguardando Escolha" },
    { id: "finalizado", name: "Atendimento Finalizado" },
];

const getClientColumnId = (state: string) => {
    if (!state) return "leed_recebido";
    return KANBAN_COLUMNS.some(col => col.id === state) ? state : "leed_recebido";
};

const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value || typeof value !== 'string') return 0;
    return Number(String(value).replace(/[^0-9,.]/g, '').replace('.', '').replace(',', '.')) || 0;
};

const formatToBRL = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

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

        const totalProposals = clients.length;
        const totalSales = clients.filter(c => c.bot_data?.state === 'finalizado').length;
        const totalVehicles = vehicles.length;

        // [MÉTRICA ATUALIZADA] Calcula o valor total dos veículos de interesse dos leads que ainda não finalizaram
        const totalValueInNegotiation = clients
            .filter(c => c.bot_data?.state !== 'finalizado')
            .reduce((total, client) => {
                const interestedVehicles = client.bot_data?.interested_vehicles;
                if (Array.isArray(interestedVehicles) && interestedVehicles.length > 0) {
                    const vehiclePrice = parseCurrency(interestedVehicles[0].preco);
                    return total + vehiclePrice;
                }
                return total;
            }, 0);

        const statusCount = clients.reduce((acc: { [key: string]: number }, client: ClientType) => {
            const columnId = getClientColumnId(client.bot_data?.state);
            const columnName = KANBAN_COLUMNS.find(col => col.id === columnId)?.name || 'Outros';
            acc[columnName] = (acc[columnName] || 0) + 1;
            return acc;
        }, {});

        const dealTypeCount = clients.reduce((acc: { [key: string]: number }, client: ClientType) => {
            const type = client.bot_data?.deal_type || 'Não Definido';
            const typeName = type.charAt(0).toUpperCase() + type.slice(1); // Ex: 'troca' -> 'Troca'
            acc[typeName] = (acc[typeName] || 0) + 1;
            return acc;
        }, {});

        return {
            stats: [
                { title: 'Total de Propostas', value: totalProposals, icon: Feather.FileText },
                { title: 'Veículos em Estoque', value: totalVehicles, icon: Feather.Truck },
                { title: 'Vendas Finalizadas', value: totalSales, icon: Feather.DollarSign },
                { title: 'Valor em Negociação', value: formatToBRL(totalValueInNegotiation), icon: Feather.BarChart2 },
            ],
            doughnutData: {
                labels: Object.keys(statusCount),
                datasets: [{
                    data: Object.values(statusCount),
                    backgroundColor: ['#f59e0b', '#d97706', '#eab308', '#f97316'],
                    hoverBackgroundColor: ['#f59e0bCC', '#d97706CC', '#eab308CC', '#f97316CC'],
                    hoverOffset: 8,
                    borderWidth: 0,
                }],
            },
            barData: {
                labels: Object.keys(dealTypeCount),
                datasets: [{
                    label: 'Número de Propostas',
                    data: Object.values(dealTypeCount),
                    backgroundColor: '#f59e0b66',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                }],
            }
        };
    }, [clients, vehicles]);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
    };

    if (isLoadingClients || isLoadingVehicles) {
        return <div className="p-6">Carregando dashboard...</div>;
    }
    if (errorClients || errorVehicles) {
        return <div className="p-6 text-red-500">Erro ao carregar dados: {errorClients?.message || errorVehicles?.message}</div>;
    }

    if (!dashboardData) return null; // Adicionado para segurança

    return (
        <div className="space-y-8 p-4 md:p-6 relative z-10">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                <h1 className="text-3xl font-bold text-zinc-900">Central de Propostas</h1>
                <p className="text-zinc-600 mt-1">Acompanhe o desempenho das propostas recebidas pelo formulário.</p>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                initial="hidden"
                animate="visible"
            >
                {dashboardData.stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={stat.title} variants={fadeInUp}>
                            <div className="bg-white/70 p-6 rounded-lg border border-zinc-200 shadow-sm hover:border-amber-400/50 transition-colors">
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

            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={fadeInUp}>
                    <div className="bg-white/70 p-6 rounded-lg border border-zinc-200 shadow-sm h-full">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Propostas por Status no Funil</h3>
                        <div className="h-72 relative">
                            <Doughnut
                                data={dashboardData.doughnutData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'right', labels: { color: '#3f3f46' } } },
                                    cutout: '60%',
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
                <motion.div variants={fadeInUp}>
                    <div className="bg-white/70 p-6 rounded-lg border border-zinc-200 shadow-sm h-full">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Propostas por Tipo de Negócio</h3>
                        <div className="h-72 relative">
                            <Bar
                                data={dashboardData.barData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        x: { ticks: { color: '#3f3f46' } },
                                        y: {
                                            ticks: { color: '#3f3f46', stepSize: 1 },
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