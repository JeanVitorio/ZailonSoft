import React from 'react';
import { motion } from 'framer-motion';
import { Users, Phone, Mail, Car, DollarSign, Calendar, MoreVertical, MessageCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatPrice, formatDateTime } from '@/lib/formatters';
import { statusLabels, statusColors, priorityLabels } from '@/data/leads';
import { Button } from '@/components/ui/button';

const CRMKanban = () => {
  const { leads, updateLead } = useData();

  const columns = [
    { id: 'new', label: 'Novos', color: 'blue' },
    { id: 'contacted', label: 'Contatados', color: 'amber' },
    { id: 'negotiating', label: 'Em Negociação', color: 'orange' },
    { id: 'proposal', label: 'Proposta Enviada', color: 'purple' },
    { id: 'closed', label: 'Fechados', color: 'emerald' },
  ];

  const getLeadsByStatus = (status: string) => {
    return leads.filter(l => l.status === status);
  };

  const handleStatusChange = (leadId: string, newStatus: string) => {
    updateLead(leadId, { status: newStatus as any });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-white mb-2"
        >
          CRM / Funil de Vendas
        </motion.h1>
        <p className="text-muted-foreground">
          {leads.length} leads no total • {leads.filter(l => l.status === 'closed').length} vendas fechadas
        </p>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column, colIndex) => {
            const columnLeads = getLeadsByStatus(column.id);
            const totalValue = columnLeads.reduce((acc, l) => acc + l.value, 0);

            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIndex * 0.1 }}
                className="kanban-column w-80 flex-shrink-0"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-${column.color}-500`} />
                    <h3 className="font-semibold text-white">{column.label}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-muted-foreground">
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                {/* Total Value */}
                <div className="mb-4 p-3 rounded-xl bg-white/[0.02]">
                  <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                  <p className="text-lg font-bold text-amber-400">{formatPrice(totalValue)}</p>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {columnLeads.map((lead, leadIndex) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: colIndex * 0.1 + leadIndex * 0.05 }}
                      className="glass-card p-4 rounded-xl cursor-pointer group"
                    >
                      {/* Lead Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center">
                            <span className="text-amber-400 text-sm font-semibold">{lead.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.phone}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          lead.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          lead.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {priorityLabels[lead.priority]}
                        </span>
                      </div>

                      {/* Vehicle */}
                      <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-white/[0.02]">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-white truncate">{lead.vehicleName}</p>
                      </div>

                      {/* Value */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-amber-400" />
                          <span className="font-semibold text-amber-400">{formatPrice(lead.value)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                        <a 
                          href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </Button>
                        </a>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="h-9 px-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50"
                        >
                          {columns.map(col => (
                            <option key={col.id} value={col.id}>{col.label}</option>
                          ))}
                          <option value="lost">Perdido</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}

                  {columnLeads.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-sm text-muted-foreground">Nenhum lead nesta etapa</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CRMKanban;
