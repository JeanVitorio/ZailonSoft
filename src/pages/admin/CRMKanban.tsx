import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Phone, Mail, Car, DollarSign, Calendar, MessageCircle, FileText, X, Download, ChevronDown } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatPrice, formatDateTime } from '@/lib/formatters';
import { statusLabels, statusColors, priorityLabels, Lead } from '@/data/leads';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const CRMKanban = () => {
  const { leads, updateLead, vehicles } = useData();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editNotes, setEditNotes] = useState('');

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
    updateLead(leadId, { status: newStatus as Lead['status'] });
    toast({
      title: "Status atualizado",
      description: `Lead movido para "${statusLabels[newStatus as Lead['status']]}"`,
    });
  };

  // Get vehicle value for lead
  const getLeadValue = (lead: Lead): number => {
    // First try the lead's own value
    if (lead.value && typeof lead.value === 'number' && !isNaN(lead.value) && lead.value > 0) {
      return lead.value;
    }
    // Then try to find the vehicle and get its price
    if (lead.vehicleId) {
      const vehicle = vehicles.find(v => v.id === lead.vehicleId);
      if (vehicle && vehicle.price) {
        return vehicle.price;
      }
    }
    return 0;
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
  };

  const handleSaveNotes = () => {
    if (selectedLead) {
      updateLead(selectedLead.id, { notes: editNotes });
      toast({
        title: "Notas salvas",
        description: "As observações foram atualizadas.",
      });
    }
  };

  const handleDownloadPDF = (lead: Lead) => {
    // Simple PDF generation using browser print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const vehicleValue = getLeadValue(lead);
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório - ${lead.name}</title>
            <style>
              body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
              h1 { color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }
              .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
              .label { font-weight: 600; color: #666; }
              .value { font-size: 16px; margin-top: 4px; }
              .header { display: flex; justify-content: space-between; align-items: center; }
              .logo { font-size: 24px; font-weight: bold; color: #f59e0b; }
              .price { font-size: 24px; color: #f59e0b; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">AutoConnect Premium</div>
              <div>${new Date().toLocaleDateString('pt-BR')}</div>
            </div>
            <h1>Relatório do Lead</h1>
            <div class="section">
              <div class="label">Nome do Cliente</div>
              <div class="value">${lead.name}</div>
            </div>
            <div class="section">
              <div class="label">Contato</div>
              <div class="value">📞 ${lead.phone}</div>
              <div class="value">✉️ ${lead.email || 'Não informado'}</div>
            </div>
            <div class="section">
              <div class="label">Veículo de Interesse</div>
              <div class="value">${lead.vehicleName}</div>
              <div class="price">${formatPrice(vehicleValue)}</div>
            </div>
            <div class="section">
              <div class="label">Status</div>
              <div class="value">${statusLabels[lead.status]}</div>
            </div>
            <div class="section">
              <div class="label">Prioridade</div>
              <div class="value">${priorityLabels[lead.priority]}</div>
            </div>
            ${lead.followUpDate ? `
            <div class="section">
              <div class="label">Data de Follow-up</div>
              <div class="value">${new Date(lead.followUpDate).toLocaleDateString('pt-BR')}</div>
            </div>
            ` : ''}
            <div class="section">
              <div class="label">Observações</div>
              <div class="value">${lead.notes || 'Nenhuma observação'}</div>
            </div>
            <div class="section">
              <div class="label">Data do Cadastro</div>
              <div class="value">${new Date(lead.createdAt).toLocaleDateString('pt-BR', { dateStyle: 'full' })}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
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
        <p className="text-muted-foreground text-sm md:text-base">
          {leads.length} leads no total • {leads.filter(l => l.status === 'closed').length} vendas fechadas
        </p>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 md:gap-4 min-w-max">
          {columns.map((column, colIndex) => {
            const columnLeads = getLeadsByStatus(column.id);
            const totalValue = columnLeads.reduce((acc, l) => acc + getLeadValue(l), 0);

            return (
              <motion.div
                key={column.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIndex * 0.1 }}
                className="kanban-column w-72 md:w-80 flex-shrink-0"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-${column.color}-500`} />
                    <h3 className="font-semibold text-white text-sm md:text-base">{column.label}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-muted-foreground">
                      {columnLeads.length}
                    </span>
                  </div>
                </div>

                {/* Total Value */}
                <div className="mb-3 md:mb-4 p-3 rounded-xl bg-white/[0.02]">
                  <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                  <p className={`text-base md:text-lg font-bold ${totalValue > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>
                    {formatPrice(totalValue)}
                  </p>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {columnLeads.map((lead, leadIndex) => {
                    const leadValue = getLeadValue(lead);
                    const isHighValue = leadValue >= 500000;
                    
                    return (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: colIndex * 0.1 + leadIndex * 0.05 }}
                        onClick={() => openLeadDetail(lead)}
                        className={`glass-card p-3 md:p-4 rounded-xl cursor-pointer group ${
                          isHighValue ? 'border-amber-500/30' : ''
                        }`}
                      >
                        {/* Lead Header */}
                        <div className="flex items-start justify-between mb-2 md:mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-amber-400 text-sm font-semibold">{lead.name.charAt(0)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white text-sm truncate">{lead.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{lead.phone}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                            lead.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            lead.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {priorityLabels[lead.priority]}
                          </span>
                        </div>

                        {/* Vehicle */}
                        <div className="flex items-center gap-2 mb-2 md:mb-3 p-2 rounded-lg bg-white/[0.02]">
                          <Car className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-white truncate">{lead.vehicleName}</p>
                        </div>

                        {/* Value */}
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-amber-400" />
                            <span className={`font-semibold text-sm ${isHighValue ? 'text-amber-400' : 'text-white'}`}>
                              {formatPrice(leadValue)}
                            </span>
                            {isHighValue && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-medium">
                                Alto
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 md:pt-3 border-t border-white/5">
                          <a 
                            href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="sm" className="w-full text-xs h-8">
                              <MessageCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </Button>
                          </a>
                          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className="w-full h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                            >
                              {columns.map(col => (
                                <option key={col.id} value={col.id}>{col.label}</option>
                              ))}
                              <option value="lost">Perdido</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

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

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg glass-card rounded-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Detalhes do Lead</h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Client Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center">
                    <span className="text-amber-400 text-xl font-semibold">{selectedLead.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedLead.name}</h2>
                    <p className="text-muted-foreground">{selectedLead.phone}</p>
                    {selectedLead.email && (
                      <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
                    )}
                  </div>
                </div>

                {/* Vehicle & Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-1">
                      <Car className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Veículo</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{selectedLead.vehicleName}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      <span className="text-xs text-muted-foreground">Valor</span>
                    </div>
                    <p className="text-sm font-medium text-amber-400">{formatPrice(getLeadValue(selectedLead))}</p>
                  </div>
                </div>

                {/* Status & Priority */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[selectedLead.status]}`}>
                    {statusLabels[selectedLead.status]}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    selectedLead.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    selectedLead.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    Prioridade {priorityLabels[selectedLead.priority]}
                  </span>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-muted-foreground mb-1">Cadastrado em</p>
                    <p className="text-sm text-white">{new Date(selectedLead.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {selectedLead.followUpDate && (
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-xs text-muted-foreground mb-1">Follow-up</p>
                      <p className="text-sm text-white">{new Date(selectedLead.followUpDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Observações</label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Adicione observações sobre este lead..."
                    rows={4}
                    className="resize-none"
                  />
                  <Button variant="outline" size="sm" onClick={handleSaveNotes} className="mt-2">
                    Salvar Notas
                  </Button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-wrap gap-2 p-4 border-t border-white/5">
                <a 
                  href={`https://wa.me/55${selectedLead.phone.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[120px]"
                >
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </a>
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadPDF(selectedLead)}
                  className="flex-1 min-w-[120px]"
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </Button>
                <Button 
                  onClick={() => setSelectedLead(null)} 
                  className="flex-1 min-w-[120px]"
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRMKanban;
