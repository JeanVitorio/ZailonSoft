import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, Car, DollarSign, Eye, Clock,
  ArrowUp, ArrowDown, Calendar, User, Target, BarChart3,
  MessageCircle, UserPlus, CheckCircle, XCircle, Briefcase,
  Tag
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/formatters';
import { Link } from 'react-router-dom';
import { statusLabels, statusColors } from '@/data/leads';

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
  const { lojaSlug, lojaInfo, user } = useAuth();

  // --- Stats calculations ---
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const reservedVehicles = vehicles.filter(v => v.status === 'reserved').length;
  const soldVehicles = vehicles.filter(v => v.status === 'sold').length;

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const activeLeads = leads.filter(l => !['closed', 'lost'].includes(l.status)).length;
  const closedLeads = leads.filter(l => l.status === 'closed').length;
  const lostLeads = leads.filter(l => l.status === 'lost').length;
  const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

  const pipelineTotal = leads
    .filter(l => l.status === 'negotiating' || l.status === 'proposal')
    .reduce((acc, l) => {
      const val = typeof l.value === 'number' && !isNaN(l.value) ? l.value : 0;
      return acc + val;
    }, 0);

  const closedTotal = leads
    .filter(l => l.status === 'closed')
    .reduce((acc, l) => {
      const val = typeof l.value === 'number' && !isNaN(l.value) ? l.value : 0;
      return acc + val;
    }, 0);

  const totalStockValue = vehicles
    .filter(v => v.status === 'available')
    .reduce((acc, v) => acc + (v.price * v.stock), 0);

  const avgTicket = closedLeads > 0 ? Math.round(closedTotal / closedLeads) : 0;

  // Leads by source
  const leadsBySource = leads.reduce((acc, l) => {
    const src = l.source || 'catalog';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Leads by deal type
  const leadsByDealType = leads.reduce((acc, l) => {
    const dt = l.dealType || 'não informado';
    acc[dt] = (acc[dt] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Leads by priority
  const highPriorityLeads = leads.filter(l => l.priority === 'high' && !['closed', 'lost'].includes(l.status)).length;

  // Recent leads
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  // Scheduled visits
  const scheduledVisits = leads
    .filter(l => l.followUpDate || l.appointmentAt)
    .map(l => ({ ...l, visitDate: l.appointmentAt || l.followUpDate! }))
    .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime())
    .slice(0, 5);

  // Leads this month
  const now = new Date();
  const thisMonthLeads = leads.filter(l => {
    const d = new Date(l.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Leads last 7 days
  const last7Days = leads.filter(l => {
    const d = new Date(l.createdAt);
    return (now.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const sourceLabels: Record<string, string> = {
    catalog: 'Catálogo', whatsapp: 'WhatsApp', instagram: 'Instagram', referral: 'Indicação'
  };

  const welcomeName = lojaInfo?.nome || user?.email?.split('@')[0] || 'Lojista';
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const kpis = [
    { icon: Car, label: 'Veículos Disponíveis', value: availableVehicles, subtitle: `${totalVehicles} total · ${reservedVehicles} reservados · ${soldVehicles} vendidos`, color: 'amber' },
    { icon: Users, label: 'Leads Ativos', value: activeLeads, subtitle: `${newLeads} novos · ${totalLeads} total`, color: 'blue' },
    { icon: DollarSign, label: 'Pipeline em Negociação', value: pipelineTotal, isPrice: true, subtitle: `${leads.filter(l => l.status === 'negotiating' || l.status === 'proposal').length} leads em negociação`, color: 'emerald' },
    { icon: TrendingUp, label: 'Taxa de Conversão', value: conversionRate, isSuffix: '%', subtitle: `${closedLeads} fechados de ${totalLeads}`, color: 'purple' },
    { icon: CheckCircle, label: 'Faturamento (Fechados)', value: closedTotal, isPrice: true, subtitle: `Ticket médio: ${formatPrice(avgTicket)}`, color: 'emerald' },
    { icon: Briefcase, label: 'Valor do Estoque', value: totalStockValue, isPrice: true, subtitle: `${availableVehicles} veículos disponíveis`, color: 'amber' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome */}
      <div>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            {greeting}, <span className="text-gradient">{welcomeName}</span>! 👋
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Aqui está o resumo da sua loja · {last7Days} novo{last7Days !== 1 ? 's' : ''} lead{last7Days !== 1 ? 's' : ''} nos últimos 7 dias
          </p>
        </motion.div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {kpis.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="kpi-card">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stat.color === 'amber' ? 'bg-cyan-500/10' : stat.color === 'blue' ? 'bg-blue-500/10' : stat.color === 'emerald' ? 'bg-emerald-500/10' : 'bg-purple-500/10'
              }`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'amber' ? 'text-cyan-400' : stat.color === 'blue' ? 'text-blue-400' : stat.color === 'emerald' ? 'text-emerald-400' : 'text-purple-400'
                }`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-lg md:text-2xl font-bold text-white">
              {stat.isPrice ? formatPrice(stat.value as number) : stat.isSuffix ? <><AnimatedCounter value={stat.value as number} />{stat.isSuffix}</> : <AnimatedCounter value={stat.value as number} />}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Leads */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-white">Leads Recentes</h2>
            <Link to={`/${lojaSlug}/crm`} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Ver todos →</Link>
          </div>
          <div className="space-y-2">
            {recentLeads.length > 0 ? recentLeads.map((lead, index) => (
              <motion.div key={lead.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400 font-semibold text-sm">{lead.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-sm">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.vehicleName} · {lead.phone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[lead.status]}`}>
                      {statusLabels[lead.status]}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum lead cadastrado ainda</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Funnel Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-2xl p-4 md:p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" /> Funil de Vendas
            </h2>
            <div className="space-y-3">
              {Object.entries(statusLabels).map(([status, label]) => {
                const count = leads.filter(l => l.status === status).length;
                const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-medium text-white">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: 0.6, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          status === 'new' ? 'bg-blue-500' : status === 'contacted' ? 'bg-cyan-500' : status === 'negotiating' ? 'bg-blue-500' : status === 'proposal' ? 'bg-purple-500' : status === 'closed' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Lead Sources */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card rounded-2xl p-4 md:p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Origem dos Leads
            </h2>
            {Object.keys(leadsBySource).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(leadsBySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <span className="text-sm text-white">{sourceLabels[source] || source}</span>
                    <span className="text-sm font-medium text-cyan-400">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">Sem dados</p>
            )}
          </motion.div>

          {/* Scheduled Visits / Agenda */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card rounded-2xl p-4 md:p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Agenda de Visitas
            </h2>
            {scheduledVisits.length > 0 ? (
              <div className="space-y-2">
                {scheduledVisits.map((lead) => (
                  <div key={lead.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-sm font-medium text-white truncate">{lead.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(lead.visitDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{lead.vehicleName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma visita agendada</p>
            )}
          </motion.div>

          {/* Priority Alerts */}
          {highPriorityLeads > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card rounded-2xl p-4 border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{highPriorityLeads} lead{highPriorityLeads !== 1 ? 's' : ''} alta prioridade</p>
                  <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Row - Deal Types & Monthly Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-card rounded-2xl p-4 md:p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan-400" /> Tipos de Negociação
          </h2>
          {Object.keys(leadsByDealType).length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(leadsByDealType).map(([type, count]) => (
                <div key={type} className="p-3 rounded-xl bg-white/[0.02] text-center">
                  <p className="text-lg font-bold text-white">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{type}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Sem dados</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-card rounded-2xl p-4 md:p-6">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-cyan-400" /> Resumo do Mês
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/[0.02] text-center">
              <p className="text-2xl font-bold text-cyan-400"><AnimatedCounter value={thisMonthLeads} /></p>
              <p className="text-xs text-muted-foreground">Novos leads</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] text-center">
              <p className="text-2xl font-bold text-emerald-400"><AnimatedCounter value={closedLeads} /></p>
              <p className="text-xs text-muted-foreground">Vendas fechadas</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] text-center">
              <p className="text-2xl font-bold text-red-400"><AnimatedCounter value={lostLeads} /></p>
              <p className="text-xs text-muted-foreground">Leads perdidos</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] text-center">
              <p className="text-2xl font-bold text-blue-400"><AnimatedCounter value={conversionRate} suffix="%" /></p>
              <p className="text-xs text-muted-foreground">Conversão</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
