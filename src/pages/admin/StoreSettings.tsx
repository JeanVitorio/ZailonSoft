import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  Clock, 
  Users, 
  Save, 
  Plus, 
  Trash2, 
  Calendar,
  Ban
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const weekDays = [
  { id: 0, label: 'Domingo', short: 'Dom' },
  { id: 1, label: 'Segunda', short: 'Seg' },
  { id: 2, label: 'Terça', short: 'Ter' },
  { id: 3, label: 'Quarta', short: 'Qua' },
  { id: 4, label: 'Quinta', short: 'Qui' },
  { id: 5, label: 'Sexta', short: 'Sex' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
];

const hours = Array.from({ length: 12 }, (_, i) => ({
  value: `${(i + 8).toString().padStart(2, '0')}:00`,
  label: `${(i + 8).toString().padStart(2, '0')}:00`
}));

const StoreSettings = () => {
  const { store, updateStore, sellers, addSeller, deleteSeller } = useData();
  const [activeTab, setActiveTab] = useState<'store' | 'sellers' | 'schedule'>('store');
  
  // Store form
  const [storeName, setStoreName] = useState(store.name || '');
  const [storeEmail, setStoreEmail] = useState(store.email || '');
  const [storePhone, setStorePhone] = useState(store.phone || '');
  const [storeWhatsApp, setStoreWhatsApp] = useState(store.whatsapp || '');
  const [storeAddress, setStoreAddress] = useState(store.address || '');
  const [storeDescription, setStoreDescription] = useState(store.description || '');
  
  // Schedule - blocked days and hours
  const [blockedDays, setBlockedDays] = useState<number[]>([0]); // Sunday blocked by default
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  
  // New seller form
  const [newSellerName, setNewSellerName] = useState('');
  const [newSellerPhone, setNewSellerPhone] = useState('');
  const [newSellerEmail, setNewSellerEmail] = useState('');

  const handleSaveStore = () => {
    updateStore({
      name: storeName,
      email: storeEmail,
      phone: storePhone,
      whatsapp: storeWhatsApp,
      address: storeAddress,
      description: storeDescription
    });
    toast({
      title: "Configurações salvas!",
      description: "As informações da loja foram atualizadas.",
    });
  };

  const handleSaveSchedule = () => {
    localStorage.setItem('autoconnect_schedule', JSON.stringify({
      blockedDays,
      openTime,
      closeTime,
      blockedDates
    }));
    toast({
      title: "Horários atualizados!",
      description: "Os horários disponíveis foram salvos.",
    });
  };

  const toggleBlockedDay = (dayId: number) => {
    setBlockedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const addBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates(prev => [...prev, newBlockedDate]);
      setNewBlockedDate('');
    }
  };

  const removeBlockedDate = (date: string) => {
    setBlockedDates(prev => prev.filter(d => d !== date));
  };

  const handleAddSeller = () => {
    if (newSellerName && newSellerPhone) {
      addSeller({
        name: newSellerName,
        phone: newSellerPhone,
        email: newSellerEmail,
        avatar: '',
        role: 'Consultor de Vendas'
      });
      setNewSellerName('');
      setNewSellerPhone('');
      setNewSellerEmail('');
      toast({
        title: "Vendedor adicionado!",
        description: `${newSellerName} foi adicionado à equipe.`,
      });
    }
  };

  const tabs = [
    { id: 'store', label: 'Loja', icon: Store },
    { id: 'schedule', label: 'Horários', icon: Clock },
    { id: 'sellers', label: 'Vendedores', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-white mb-2"
        >
          Configurações
        </motion.h1>
        <p className="text-muted-foreground text-sm md:text-base">Gerencie sua loja e equipe</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Store Tab */}
      {activeTab === 'store' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 md:p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Informações da Loja</h2>
          
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Nome da Loja
                </label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="AutoConnect Premium Cars"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  placeholder="contato@minhaloja.com"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Telefone
                </label>
                <Input
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="(11) 3333-4444"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  WhatsApp
                </label>
                <Input
                  value={storeWhatsApp}
                  onChange={(e) => setStoreWhatsApp(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="h-12"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Endereço
                </label>
                <Input
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  placeholder="Av. Premium, 1000 - São Paulo, SP"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Descrição da Loja
                </label>
                <Textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Descrição da sua loja para o catálogo público..."
                  rows={5}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 pt-6 border-t border-white/5">
            <Button onClick={handleSaveStore}>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </Button>
          </div>
        </motion.div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 md:space-y-6"
        >
          {/* Working Hours */}
          <div className="glass-card rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Horário de Funcionamento
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Abre às
                </label>
                <select
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                >
                  {hours.map(h => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Fecha às
                </label>
                <select
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                >
                  {hours.map(h => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Blocked Days */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-3">
                Dias Fechados (clique para alternar)
              </label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => toggleBlockedDay(day.id)}
                    className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                      blockedDays.includes(day.id)
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    <span className="hidden sm:inline">{day.label}</span>
                    <span className="sm:hidden">{day.short}</span>
                    {blockedDays.includes(day.id) && <Ban className="w-3 h-3 ml-1 inline" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Blocked Dates */}
          <div className="glass-card rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Datas Específicas Bloqueadas
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Input
                type="date"
                value={newBlockedDate}
                onChange={(e) => setNewBlockedDate(e.target.value)}
                className="flex-1 h-12"
              />
              <Button onClick={addBlockedDate} className="w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Bloquear
              </Button>
            </div>
            
            {blockedDates.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {blockedDates.map((date) => (
                  <div
                    key={date}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <span className="text-sm text-red-400">
                      {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    <button
                      onClick={() => removeBlockedDate(date)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma data específica bloqueada. Adicione feriados ou dias de folga.
              </p>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSchedule}>
              <Save className="w-4 h-4" />
              Salvar Horários
            </Button>
          </div>
        </motion.div>
      )}

      {/* Sellers Tab */}
      {activeTab === 'sellers' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 md:space-y-6"
        >
          {/* Add Seller */}
          <div className="glass-card rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Adicionar Vendedor</h2>
            
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <Input
                value={newSellerName}
                onChange={(e) => setNewSellerName(e.target.value)}
                placeholder="Nome do vendedor"
                className="h-12"
              />
              <Input
                value={newSellerPhone}
                onChange={(e) => setNewSellerPhone(e.target.value)}
                placeholder="Telefone/WhatsApp"
                className="h-12"
              />
              <Input
                type="email"
                value={newSellerEmail}
                onChange={(e) => setNewSellerEmail(e.target.value)}
                placeholder="E-mail (opcional)"
                className="h-12"
              />
            </div>
            
            <Button onClick={handleAddSeller} disabled={!newSellerName || !newSellerPhone}>
              <Plus className="w-4 h-4" />
              Adicionar Vendedor
            </Button>
          </div>

          {/* Sellers List */}
          <div className="glass-card rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-6">
              Equipe de Vendas ({sellers.length})
            </h2>
            
            {sellers.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {sellers.map((seller, index) => (
                  <motion.div
                    key={seller.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-400 font-semibold text-base md:text-lg">
                        {seller.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm md:text-base">{seller.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{seller.phone}</p>
                      {seller.email && (
                        <p className="text-xs text-muted-foreground truncate hidden sm:block">{seller.email}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs md:text-sm font-medium text-amber-400">{seller.salesCount} vendas</p>
                      <button
                        onClick={() => deleteSeller(seller.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum vendedor cadastrado</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StoreSettings;
