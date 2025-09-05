// src/components/Dashboard.tsx (código corrigido)

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Car, DollarSign, BarChart3 } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { fetchClients, fetchAvailableCars, Client as ClientType, Car as CarType } from '@/services/api';

// Registra os componentes necessários do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
                { title: 'Total de Clientes', value: totalClients, icon: Users, color: 'bg-blue-500' },
                { title: 'Veículos em Estoque', value: totalVehicles, icon: Car, color: 'bg-green-500' },
                { title: 'Atendimentos Finalizados', value: totalSales, icon: DollarSign, color: 'bg-purple-500' },
                { title: 'Tempo Médio de Resposta', value: avgResponseTime, icon: BarChart3, color: 'bg-orange-500' },
            ],
            doughnutData: {
                labels: Object.keys(statusCount),
                datasets: [{
                    data: Object.values(statusCount),
                    backgroundColor: ['#00C6FF', '#3CFF28', '#EBEF17', '#F26721', '#C22F9F'],
                    hoverOffset: 4,
                    borderWidth: 0,
                }],
            },
            barData: {
                labels: Object.keys(paymentMethodCount),
                datasets: [{
                    label: 'Número de Clientes',
                    data: Object.values(paymentMethodCount),
                    backgroundColor: ['#00C6FF', '#00A9CC', '#008DAE'],
                }],
            }
        };
    }, [clients, vehicles]);

    if (isLoadingClients || isLoadingVehicles) {
        return <div>Carregando dashboard...</div>;
    }
    if (errorClients || errorVehicles) {
        return <div className="text-destructive">Erro ao carregar dados: {errorClients?.message || errorVehicles?.message}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Dashboard de Métricas</h1>
            
            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardData.stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <Icon className={`h-5 w-5 text-muted-foreground ${stat.color.replace('bg-', 'text-')}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Clientes por Status</CardTitle>
                    </CardHeader>
                    {/* Alterado: Removido o estilo de altura fixa */}
                    <CardContent>
                        <Doughnut 
                            data={dashboardData.doughnutData} 
                            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} 
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Clientes por Tipo de Pagamento</CardTitle>
                    </CardHeader>
                    {/* Alterado: Removido o estilo de altura fixa */}
                    <CardContent>
                        <Bar 
                            data={dashboardData.barData} 
                            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;