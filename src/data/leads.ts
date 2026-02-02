export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  vehicleId: string;
  vehicleName: string;
  status: 'new' | 'contacted' | 'negotiating' | 'proposal' | 'closed' | 'lost';
  priority: 'low' | 'medium' | 'high';
  value: number;
  notes: string;
  source: 'catalog' | 'whatsapp' | 'instagram' | 'referral';
  createdAt: string;
  updatedAt: string;
  followUpDate?: string;
}

export const leads: Lead[] = [
  {
    id: "lead-1",
    name: "Ricardo Menezes",
    email: "ricardo.menezes@email.com",
    phone: "(11) 99876-5432",
    cpf: "123.456.789-00",
    vehicleId: "1",
    vehicleName: "Porsche 911 Turbo S",
    status: "negotiating",
    priority: "high",
    value: 1890000,
    notes: "Cliente muito interessado, tem experiência com Porsche. Quer test drive.",
    source: "catalog",
    createdAt: "2024-01-28T10:30:00",
    updatedAt: "2024-01-29T14:20:00",
    followUpDate: "2024-02-01"
  },
  {
    id: "lead-2",
    name: "Fernanda Costa",
    email: "fernanda.costa@empresa.com",
    phone: "(21) 98765-4321",
    vehicleId: "2",
    vehicleName: "Ferrari F8 Tributo",
    status: "proposal",
    priority: "high",
    value: 3200000,
    notes: "Empresária, segunda Ferrari. Interessada em financiamento especial.",
    source: "instagram",
    createdAt: "2024-01-25T15:45:00",
    updatedAt: "2024-01-30T09:00:00",
    followUpDate: "2024-02-02"
  },
  {
    id: "lead-3",
    name: "Carlos Eduardo Silva",
    email: "carlos.silva@gmail.com",
    phone: "(31) 97654-3210",
    vehicleId: "5",
    vehicleName: "BMW M4 Competition",
    status: "contacted",
    priority: "medium",
    value: 890000,
    notes: "Primeiro contato via WhatsApp. Pediu fotos adicionais.",
    source: "whatsapp",
    createdAt: "2024-01-29T11:00:00",
    updatedAt: "2024-01-29T11:30:00"
  },
  {
    id: "lead-4",
    name: "Ana Paula Rodrigues",
    email: "ana.rodrigues@hotmail.com",
    phone: "(41) 96543-2109",
    vehicleId: "6",
    vehicleName: "Audi RS e-tron GT",
    status: "new",
    priority: "medium",
    value: 1250000,
    notes: "Interessada em veículos elétricos premium.",
    source: "catalog",
    createdAt: "2024-01-30T08:15:00",
    updatedAt: "2024-01-30T08:15:00"
  },
  {
    id: "lead-5",
    name: "Marcelo Andrade",
    email: "marcelo@andrade.com.br",
    phone: "(51) 95432-1098",
    vehicleId: "3",
    vehicleName: "Lamborghini Huracán EVO",
    status: "closed",
    priority: "high",
    value: 2750000,
    notes: "Venda concluída! Entrega agendada para próxima semana.",
    source: "referral",
    createdAt: "2024-01-20T14:30:00",
    updatedAt: "2024-01-28T16:00:00"
  },
  {
    id: "lead-6",
    name: "Juliana Ferreira",
    email: "juliana.f@outlook.com",
    phone: "(61) 94321-0987",
    vehicleId: "4",
    vehicleName: "Mercedes-AMG GT Black Series",
    status: "lost",
    priority: "low",
    value: 2400000,
    notes: "Desistiu por questões de prazo de entrega.",
    source: "catalog",
    createdAt: "2024-01-15T09:00:00",
    updatedAt: "2024-01-25T11:00:00"
  }
];

export const statusLabels: Record<Lead['status'], string> = {
  new: 'Novo',
  contacted: 'Contatado',
  negotiating: 'Em Negociação',
  proposal: 'Proposta Enviada',
  closed: 'Fechado',
  lost: 'Perdido'
};

export const statusColors: Record<Lead['status'], string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  negotiating: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  proposal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  closed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export const priorityLabels: Record<Lead['priority'], string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta'
};
