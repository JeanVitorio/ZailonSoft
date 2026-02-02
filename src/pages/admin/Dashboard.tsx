import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign, 
  Eye, 
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatPrice } from '@/lib/formatters';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { vehicles, leads } = useData();

  const stats = [
    {
      icon: Car,
      label: 'Veículos em Estoque',
      value: vehicles.filter(v => v.status === 'available').length,
      total: vehicles.length,
      change: '+2 este mês',
      positive: true,
      color: 'amber'
    },
    {
      icon: Users,
      label: 'Leads Ativos',
      value: leads.filter(l => l.status !== 'closed' && l.status !== 'lost').length,
      total: leads.length,
      change: '+5 esta semana',
      positive: true,
      color: 'blue'
    },
    {
      icon: DollarSign,
      label: 'Pipeline Total',
      value: formatPrice(leads.filter(l => l.status !== 'lost').reduce((acc, l) => acc + l.value, 0)),
      change: '+12% vs mês anterior',
      positive: true,
      color: 'emerald'
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Conversão',
      value: `${Math.round((leads.filter(l => l.status === 'closed').length / leads.length) * 100)}%`,
      change: '+3% vs mês anterior',
      positive: true,
      color: 'purple'
    }
  ];

  const recentLeads = leads.slice(0, 5);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-amber-500',
    negotiating: 'bg-orange-500',
    proposal: 'bg-purple-500',
    closed: 'bg-emerald-500',
    lost: 'bg-red-500'
  };

  const statusLabels: Record<string, string> = {
    new: 'Novo',
    contacted: 'Contatado',
    negotiating: 'Negociando',
    proposal: 'Proposta',
    closed: 'Fechado',
    lost: 'Perdido'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-white mb-2"
        >
          Dashboard
        </motion.h1>
        <p className="text-muted-foreground">Visão geral da sua loja</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="kpi-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                stat.color === 'amber' ? 'bg-amber-500/10' :
                stat.color === 'blue' ? 'bg-blue-500/10' :
                stat.color === 'emerald' ? 'bg-emerald-500/10' :
                'bg-purple-500/10'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'amber' ? 'text-amber-400' :
                  stat.color === 'blue' ? 'text-blue-400' :
                  stat.color === 'emerald' ? 'text-emerald-400' :
                  'text-purple-400'
                }`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.positive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stat.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            {stat.total && (
              <p className="text-xs text-muted-foreground mt-1">de {stat.total} total</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Leads Recentes</h2>
            <Link to="/sistema/crm" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
              Ver todos →
            </Link>
          </div>

          <div className="space-y-4">
            {recentLeads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center">
                  <span className="text-amber-400 font-semibold">{lead.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{lead.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{lead.vehicleName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-400">{formatPrice(lead.value)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${statusColors[lead.status]}`} />
                    <span className="text-xs text-muted-foreground">{statusLabels[lead.status]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Status do Funil</h2>
          
          <div className="space-y-4">
            {Object.entries(statusLabels).map(([status, label], index) => {
              const count = leads.filter(l => l.status === status).length;
              const percentage = Math.round((count / leads.length) * 100) || 0;
              
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className={`h-full rounded-full ${statusColors[status]}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {vehicles.reduce((acc, v) => acc + v.views, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Visualizações totais</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
