import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign, 
  Eye, 
  Clock,
  ArrowUp,
  ArrowDown,
  Calendar,
  User
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatPrice } from '@/lib/formatters';
import { Link } from 'react-router-dom';

// Animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <>{prefix}{displayValue.toLocaleString('pt-BR')}{suffix}</>;
};

const Dashboard = () => {
  const { vehicles, leads } = useData();

  // Calculate pipeline total safely - sum of lead values in negotiating status
  const pipelineTotal = leads
    .filter(l => l.status === 'negotiating' || l.status === 'proposal')
    .reduce((acc, l) => {
      const val = typeof l.value === 'number' && !isNaN(l.value) ? l.value : 0;
      return acc + val;
    }, 0);

  // Calculate conversion rate safely
  const closedLeads = leads.filter(l => l.status === 'closed').length;
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

  const recentLeads = leads.slice(0, 5);

  // Get leads with appointments (visits scheduled)
  const scheduledVisits = leads
    .filter(l => l.followUpDate)
    .sort((a, b) => new Date(a.followUpDate!).getTime() - new Date(b.followUpDate!).getTime())
    .slice(0, 5);

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
      value: pipelineTotal,
      isPrice: true,
      change: '+12% vs mês anterior',
      positive: true,
      color: 'emerald'
    },
    {
      icon: TrendingUp,
      label: 'Taxa de Conversão',
      value: conversionRate,
      isSuffix: '%',
      change: '+3% vs mês anterior',
      positive: true,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-white mb-2"
        >
          Dashboard
        </motion.h1>
        <p className="text-muted-foreground text-sm md:text-base">Visão geral da sua loja</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="kpi-card"
          >
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                stat.color === 'amber' ? 'bg-amber-500/10' :
                stat.color === 'blue' ? 'bg-blue-500/10' :
                stat.color === 'emerald' ? 'bg-emerald-500/10' :
                'bg-purple-500/10'
              }`}>
                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${
                  stat.color === 'amber' ? 'text-amber-400' :
                  stat.color === 'blue' ? 'text-blue-400' :
                  stat.color === 'emerald' ? 'text-emerald-400' :
                  'text-purple-400'
                }`} />
              </div>
              <div className={`hidden md:flex items-center gap-1 text-xs font-medium ${
                stat.positive ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stat.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span className="hidden lg:inline">{stat.change}</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-lg md:text-2xl font-bold text-white">
              {stat.isPrice ? (
                formatPrice(stat.value as number)
              ) : stat.isSuffix ? (
                <><AnimatedCounter value={stat.value as number} />{stat.isSuffix}</>
              ) : (
                <AnimatedCounter value={stat.value as number} />
              )}
            </p>
            {stat.total && (
              <p className="text-xs text-muted-foreground mt-1">de {stat.total} total</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Leads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card rounded-2xl p-4 md:p-6"
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-lg font-semibold text-white">Leads Recentes</h2>
            <Link to="/sistema/crm" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
              Ver todos →
            </Link>
          </div>

          <div className="space-y-3 md:space-y-4">
            {recentLeads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-semibold text-sm md:text-base">{lead.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-sm md:text-base">{lead.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{lead.vehicleName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs md:text-sm font-medium text-amber-400">{formatPrice(lead.value)}</p>
                  <div className="flex items-center gap-1 md:gap-2 mt-1 justify-end">
                    <span className={`w-2 h-2 rounded-full ${statusColors[lead.status]}`} />
                    <span className="text-xs text-muted-foreground hidden sm:inline">{statusLabels[lead.status]}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sidebar - Funnel Status & Agenda */}
        <div className="space-y-4 md:space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-4 md:p-6"
          >
            <h2 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-6">Status do Funil</h2>
            
            <div className="space-y-3 md:space-y-4">
              {Object.entries(statusLabels).map(([status, label], index) => {
                const count = leads.filter(l => l.status === status).length;
                const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                        <span className="text-xs md:text-sm text-muted-foreground">{label}</span>
                      </div>
                      <span className="text-xs md:text-sm font-medium text-white">{count}</span>
                    </div>
                    <div className="h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
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

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xl md:text-2xl font-bold text-white">
                    <AnimatedCounter value={vehicles.reduce((acc, v) => acc + v.views, 0)} />
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">Visualizações totais</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Scheduled Visits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-2xl p-4 md:p-6"
          >
            <h2 className="text-base md:text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Próximas Visitas
            </h2>
            
            {scheduledVisits.length > 0 ? (
              <div className="space-y-3">
                {scheduledVisits.map((lead) => (
                  <div key={lead.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-white">{lead.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(lead.followUpDate!).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{lead.vehicleName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma visita agendada
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
