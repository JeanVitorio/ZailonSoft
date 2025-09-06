import React, { useState, useMemo, useEffect, useRef, useContext, useReducer } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchClients, fetchAvailableCars, updateClientStatus, updateClientDetails, deleteClient, uploadClientFile, deleteClientFile } from '@/services/api';
import { Client, Car } from '@/services/api';

// --- Constantes e Utilitários ---
const KANBAN_COLUMNS = [
  { id: "leed_recebido", name: "Novo Lead" },
  { id: "aguardando_interesse", name: "Aguardando Interesse" },
  { id: "aguardando_escolha_carro", name: "Aguardando Escolha" },
  { id: "aguardando_confirmacao_veiculo", name: "Aguardando Confirmação" },
  { id: "aguardando_opcao_pagamento", name: "Aguardando Pagamento" },
  { id: "dados_troca", name: "Dados de Troca" },
  { id: "dados_visita", name: "Dados de Visita" },
  { id: "dados_financiamento", name: "Dados de Financiamento" },
  { id: "finalizado", name: "Atendimento Finalizado" },
];

const dealTypeMap = {
  comum: "Venda",
  troca: "Troca",
  visita: "Visita",
  financiamento: "Financiamento",
  a_vista: "À Vista",
  financiamento_com_troca: "Financiamento e Troca"
};

const toBRL = (value) => {
  const num = parseFloat(String(value || '0').replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const parseCurrency = (value) => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  return parseFloat(value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
};

const getClientColumnId = (state) => {
  if (!state) return "leed_recebido";
  if (state.startsWith("troca_")) return "dados_troca";
  if (state.startsWith("visita_")) return "dados_visita";
  if (state.startsWith("financiamento_") || state.startsWith("a_vista_")) return "dados_financiamento";
  return KANBAN_COLUMNS.some(col => col.id === state) ? state : "leed_recebido";
};

// --- Toast Provider ---
const ToastContext = React.createContext(null);

function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST': return [...state, action.payload];
    case 'REMOVE_TOAST': return state.filter(t => t.id !== action.id);
    default: return state;
  }
}

const Toaster = ({ toasts, dispatch }) => {
  return (
    <div className="fixed bottom-0 right-0 p-6 space-y-2 z-[100]">
      {toasts.map(toast => (
        <motion.div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg flex items-start gap-4 w-80 md:w-96 ${toast.variant === 'destructive' ? 'bg-red-500 text-white border-red-600' : 'bg-white/70 text-zinc-900 border-zinc-200'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex-grow">
            {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
            {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
          </div>
          <motion.button
            onClick={() => dispatch({ type: 'REMOVE_TOAST', id: toast.id })}
            className="p-1 rounded-full hover:bg-zinc-100/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Feather.X className="h-4 w-4" />
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
};

const ToastProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, []);
  return (
    <ToastContext.Provider value={dispatch}>
      {children}
      <Toaster toasts={state} dispatch={dispatch} />
    </ToastContext.Provider>
  );
};

const useToast = () => {
  const dispatch = useContext(ToastContext);
  if (!dispatch) throw new Error('useToast must be used within a ToastProvider');
  return {
    toast: ({ title, description, variant = 'default', duration = 5000 }) => {
      const id = Date.now();
      dispatch({ type: 'ADD_TOAST', payload: { id, title, description, variant } });
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), duration);
    },
  };
};

// --- Animações ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
};

// --- Componente do Card do Cliente ---
function ClientCard({ client, onDelete, onViewDetails }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: client.chat_id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 0 };
  const interestedVehicle = client.bot_data?.interested_vehicles?.[0]?.nome || "Nenhum";
  const dealTypeKey = client.bot_data?.deal_type || client.deal_type;
  const dealType = dealTypeMap[dealTypeKey] || "Não informado";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="touch-none bg-white/70 rounded-lg border border-zinc-200 shadow-sm hover:border-amber-400/50 transition-all w-full max-w-[calc(100%-1rem)] mx-auto sm:max-w-full box-border"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <div className="p-1.5 xs:p-2 space-y-2 relative">
        <div {...listeners} className="cursor-grab active:cursor-grabbing pr-8 xs:pr-10">
          <h4 className="font-semibold text-[0.65rem] xs:text-xs text-zinc-900 truncate">{client.name || "Cliente sem nome"}</h4>
          <p className="text-[0.65rem] xs:text-xs text-zinc-600 truncate">{interestedVehicle}</p>
          <p className="text-[0.65rem] xs:text-xs text-zinc-600 truncate">{dealType}</p>
        </div>
        <div className="absolute top-1 right-1 flex flex-col xs:flex-row items-center gap-0.5 xs:gap-1">
          <motion.button
            className="h-6 w-6 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50"
            onClick={onViewDetails}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Feather.FileText className="h-3 w-3" />
          </motion.button>
          <motion.button
            className="h-6 w-6 flex items-center justify-center rounded-full border border-zinc-200 text-red-500 hover:bg-red-500/10 hover:border-red-500/50"
            onClick={(e) => { e.stopPropagation(); onDelete(client.chat_id); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Feather.Trash2 className="h-3 w-3" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

const InfoRow = ({ label, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 border-b py-2 last:border-none">
    <Label className="text-left md:text-right text-zinc-600 text-xs">{label}</Label>
    <div className="col-span-2">{children}</div>
  </div>
);

// --- Componente do Modal de Detalhes do Cliente ---
function ClientDetailDialog({ client, isOpen, onOpenChange, updateMutation }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [allCars, setAllCars] = useState([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [newDocs, setNewDocs] = useState([]);
  const [removedDocs, setRemovedDocs] = useState([]);
  const [newTradeInPhotos, setNewTradeInPhotos] = useState([]);
  const [removedTradeInPhotos, setRemovedTradeInPhotos] = useState([]);
  const docInputRef = useRef(null);
  const tradeInInputRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && allCars.length === 0) {
      setIsLoadingCars(true);
      fetchAvailableCars()
        .then(setAllCars)
        .catch(err => {
          console.error(err);
          toast({ title: "Erro", description: "Não foi possível carregar o estoque de veículos.", variant: "destructive" });
        })
        .finally(() => setIsLoadingCars(false));
    }
  }, [isOpen, allCars.length, toast]);

  useEffect(() => {
    if (!isEditing && client) {
      setFormData(JSON.parse(JSON.stringify(client)));
      setNewDocs([]);
      setRemovedDocs([]);
      setNewTradeInPhotos([]);
      setRemovedTradeInPhotos([]);
    }
  }, [client, isEditing, isOpen]);

  useEffect(() => {
    return () => {
      newDocs.forEach(file => URL.revokeObjectURL(file.preview));
      newTradeInPhotos.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [newDocs, newTradeInPhotos]);

  const handleDeepChange = (path, value) => {
    setFormData(
      produce(draft => {
        const keys = path.split('.');
        let current = draft;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = current[keys[i]] || {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      })
    );
  };

  const handleDealTypeChange = (value) => {
    setFormData(
      produce(draft => {
        draft.deal_type = value;
        if (!draft.bot_data) draft.bot_data = {};
        draft.bot_data.deal_type = value;
      })
    );
  };

  const handleCurrencyChange = (e, path) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly === '') {
      handleDeepChange(path, '');
      return;
    }
    const numberValue = Number(digitsOnly) / 100;
    const formattedValue = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(numberValue);
    handleDeepChange(path, formattedValue);
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files).map(file => ({ file: file, preview: URL.createObjectURL(file) }));
    if (type === 'documents') setNewDocs(prev => [...prev, ...files]);
    if (type === 'tradeInPhotos') setNewTradeInPhotos(prev => [...prev, ...files]);
  };

  const removeNewFile = (previewUrl, type) => {
    URL.revokeObjectURL(previewUrl);
    if (type === 'documents') setNewDocs(prev => prev.filter(f => f.preview !== previewUrl));
    if (type === 'tradeInPhotos') setNewTradeInPhotos(prev => prev.filter(f => f.preview !== previewUrl));
  };

  const removeExistingFile = (filePath, type) => {
    if (type === 'documents') setRemovedDocs(prev => [...new Set([...prev, filePath])]);
    if (type === 'tradeInPhotos') setRemovedTradeInPhotos(prev => [...new Set([...prev, filePath])]);
  };

  const handleSave = async () => {
    try {
      const payload = JSON.parse(JSON.stringify(formData));
      const newDocUrls = [];
      const newTradeInUrls = [];
      for (const fileObj of newDocs) {
        const url = await uploadClientFile({
          chatId: client.chat_id,
          file: fileObj.file,
          bucketName: 'client-documents',
          filePathPrefix: 'documents'
        });
        newDocUrls.push(url);
      }
      for (const fileObj of newTradeInPhotos) {
        const url = await uploadClientFile({
          chatId: client.chat_id,
          file: fileObj.file,
          bucketName: 'trade-in-cars',
          filePathPrefix: 'trade-in'
        });
        newTradeInUrls.push(url);
      }
      for (const docPath of removedDocs) {
        await deleteClientFile({
          filePath: docPath.split('/client-documents/')[1],
          bucketName: 'client-documents'
        });
      }
      for (const docPath of removedTradeInPhotos) {
        await deleteClientFile({
          filePath: docPath.split('/trade-in-cars/')[1],
          bucketName: 'trade-in-cars'
        });
      }
      payload.documents = [...(client.documents || []).filter(doc => !removedDocs.includes(doc)), ...newDocUrls];
      if (payload.bot_data?.trade_in_car) {
        payload.bot_data.trade_in_car.photos = [...(client.bot_data?.trade_in_car?.photos || []).filter(doc => !removedTradeInPhotos.includes(doc)), ...newTradeInUrls];
      }
      if (payload.bot_data?.financing_details?.entry) {
        payload.bot_data.financing_details.entry = parseCurrency(payload.bot_data.financing_details.entry);
      }
      if (payload.bot_data?.trade_in_car?.value) {
        payload.bot_data.trade_in_car.value = parseCurrency(payload.bot_data.trade_in_car.value);
      }
      payload.bot_data.history = [
        ...(payload.bot_data?.history || []),
        { timestamp: new Date().toLocaleString("pt-BR"), updated_data: { changes: "Dados atualizados via CRM" } }
      ];
      const updatedClient = await updateMutation.mutateAsync({ chatId: client.chat_id, updatedData: payload });
      setFormData(updatedClient);
      toast({ title: "Sucesso!", description: "Cliente e documentos atualizados." });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    } catch (error) {
      toast({ title: "Erro ao Salvar", description: `Um erro ocorreu. ${error.message}`, variant: "destructive" });
    }
  };

  const interestedVehicleIds = useMemo(() => new Set((formData.bot_data?.interested_vehicles || []).map(v => v.id)), [formData.bot_data?.interested_vehicles]);
  const vehicleSearchResults = useMemo(() => {
    const availableCars = allCars.filter(car => !interestedVehicleIds.has(car.id));
    if (!vehicleSearch) return availableCars;
    return availableCars.filter(car => car.nome.toLowerCase().includes(vehicleSearch.toLowerCase()));
  }, [vehicleSearch, allCars, interestedVehicleIds]);

  const addInterestVehicle = (car) => {
    const currentVehicles = formData.bot_data?.interested_vehicles || [];
    handleDeepChange('bot_data.interested_vehicles', [...currentVehicles, car]);
    setVehicleSearch('');
  };

  const removeInterestVehicle = (carId) => {
    const currentVehicles = formData.bot_data?.interested_vehicles || [];
    handleDeepChange('bot_data.interested_vehicles', currentVehicles.filter(v => v.id !== carId));
  };

  const calculations = useMemo(() => {
    const botData = formData.bot_data || {};
    const interestedVehicles = botData.interested_vehicles || [];
    const tradeInValue = parseCurrency(botData.trade_in_car?.value);
    const financingAmount = (car) => {
      const carPrice = parseCurrency(car.preco);
      const entryValue = parseCurrency(botData.financing_details?.entry);
      return Math.max(0, carPrice - entryValue - tradeInValue);
    };
    const totalCarPrice = interestedVehicles.reduce((sum, car) => sum + parseCurrency(car.preco), 0);
    const tradeDifference = totalCarPrice - tradeInValue;
    return { financingAmount, tradeDifference };
  }, [formData]);

  if (!client || !formData.chat_id) return null;

  const botData = formData.bot_data || {};
  const dealType = botData.deal_type || formData.deal_type || client.deal_type;
  const installmentOptions = [12, 24, 36, 48, 60];
  const visibleDocuments = (formData.documents || []).filter(doc => !removedDocs.includes(doc));
  const tradeInPhotos = (botData.trade_in_car?.photos || []).filter(p => !removedTradeInPhotos.includes(p));
  const showFinancingCard = dealType === 'financiamento';
  const showTradeInCard = dealType === 'troca' || (dealType === 'financiamento' && (botData.trade_in_car?.model || isEditing));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] md:max-w-4xl max-h-[95vh] p-0 flex flex-col bg-white/70 border-zinc-200">
        <DialogHeader className="px-4 pt-4 md:px-6 md:pt-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg md:text-xl text-zinc-900">{formData.name || "Detalhes do Cliente"}</DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <motion.button
                    className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all"
                    onClick={handleSave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Feather.Save className="h-4 w-4 mr-2 inline" /> Salvar
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
                    onClick={() => setIsEditing(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Feather.X className="h-4 w-4 mr-2 inline" /> Cancelar
                  </motion.button>
                </>
              ) : (
                <motion.button
                  className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
                  onClick={() => setIsEditing(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Feather.Edit className="h-4 w-4 mr-2 inline" /> Editar
                </motion.button>
              )}
            </div>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
              <div className="md:col-span-3 space-y-6">
                <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="text-base font-semibold text-zinc-900 mb-2">Perfil do Cliente</h3>
                  <div className="space-y-1 text-sm">
                    <InfoRow label="Nome">
                      {isEditing ? (
                        <Input
                          value={formData.name || ''}
                          onChange={e => handleDeepChange('name', e.target.value)}
                          className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                        />
                      ) : (
                        formData.name || 'N/A'
                      )}
                    </InfoRow>
                    <InfoRow label="Telefone">
                      {isEditing ? (
                        <Input
                          value={formData.phone || ''}
                          onChange={e => handleDeepChange('phone', e.target.value)}
                          className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                        />
                      ) : (
                        formData.phone || 'N/A'
                      )}
                    </InfoRow>
                    <InfoRow label="CPF">
                      {isEditing ? (
                        <Input
                          value={formData.cpf || ''}
                          onChange={e => handleDeepChange('cpf', e.target.value)}
                          className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                        />
                      ) : (
                        formData.cpf || 'N/A'
                      )}
                    </InfoRow>
                    <InfoRow label="Ocupação">
                      {isEditing ? (
                        <Input
                          value={formData.job || ''}
                          onChange={e => handleDeepChange('job', e.target.value)}
                          className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                        />
                      ) : (
                        formData.job || 'N/A'
                      )}
                    </InfoRow>
                    <InfoRow label="Negociação">
                      {isEditing ? (
                        <Select value={dealType || ''} onValueChange={handleDealTypeChange}>
                          <SelectTrigger className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-zinc-200">
                            {Object.entries(dealTypeMap).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        dealTypeMap[dealType] || 'Não informado'
                      )}
                    </InfoRow>
                    <InfoRow label="Estado do Lead">
                      {isEditing ? (
                        <Select value={botData.state || 'leed_recebido'} onValueChange={v => handleDeepChange('bot_data.state', v)}>
                          <SelectTrigger className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-zinc-200">
                            {KANBAN_COLUMNS.map(col => (
                              <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        KANBAN_COLUMNS.find(c => c.id === botData.state)?.name || botData.state
                      )}
                    </InfoRow>
                    <InfoRow label="ID do Chat">
                      <span className="text-zinc-900">{formData.chat_id}</span>
                    </InfoRow>
                  </div>
                </div>
                <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="text-base font-semibold text-zinc-900 mb-2">Veículos de Interesse</h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 min-h-[24px]">
                        {(botData.interested_vehicles || []).map(v => (
                          <motion.div
                            key={v.id}
                            className="flex items-center bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            {v.nome}
                            <motion.button
                              onClick={() => removeInterestVehicle(v.id)}
                              className="ml-2 rounded-full hover:bg-red-500/20 p-0.5"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Feather.X className="h-3 w-3 text-red-500" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Input
                            placeholder="Pesquisar e adicionar veículo..."
                            value={vehicleSearch}
                            onChange={e => setVehicleSearch(e.target.value)}
                            className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white border-zinc-200">
                          {isLoadingCars ? (
                            <div className="p-4 text-center text-sm text-zinc-600">Carregando...</div>
                          ) : vehicleSearchResults.length > 0 ? (
                            <ScrollArea className="h-[200px]">
                              {vehicleSearchResults.map(car => (
                                <motion.div
                                  key={car.id}
                                  onClick={() => addInterestVehicle(car)}
                                  className="p-2 hover:bg-amber-50 cursor-pointer text-zinc-900"
                                  whileHover={{ backgroundColor: '#fef3c7' }}
                                >
                                  {car.nome} - {toBRL(car.preco)}
                                </motion.div>
                              ))}
                            </ScrollArea>
                          ) : (
                            <div className="p-4 text-center text-sm text-zinc-600">Nenhum veículo encontrado.</div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  ) : (
                    (botData.interested_vehicles?.length || 0) > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-zinc-600">
                        {botData.interested_vehicles.map(v => (
                          <li key={v.id}>{v.nome}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-zinc-600">Nenhum</p>
                    )
                  )}
                </div>
                {showFinancingCard && (
                  <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-base font-semibold text-zinc-900 mb-2">Detalhes de Financiamento</h3>
                    <div className="text-sm">
                      <InfoRow label="Valor da Entrada">
                        {isEditing ? (
                          <Input
                            value={botData.financing_details?.entry || ''}
                            onChange={e => handleCurrencyChange(e, 'bot_data.financing_details.entry')}
                            placeholder="0,00"
                            inputMode="numeric"
                            className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                          />
                        ) : (
                          toBRL(botData.financing_details?.entry) || 'N/A'
                        )}
                      </InfoRow>
                      <InfoRow label="Parcelas">
                        {isEditing ? (
                          <Select
                            value={String(botData.financing_details?.parcels || '12')}
                            onValueChange={v => handleDeepChange('bot_data.financing_details.parcels', v)}
                          >
                            <SelectTrigger className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-zinc-200">
                              {installmentOptions.map(opt => (
                                <SelectItem key={opt} value={String(opt)}>{opt}x</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          `${botData.financing_details?.parcels || 'N/A'}x`
                        )}
                      </InfoRow>
                      {(botData.interested_vehicles || []).map(car => (
                        <div key={car.id} className="mt-2 p-2 bg-zinc-100 rounded text-sm text-center text-zinc-900">
                          Valor a financiar ({car.nome}): <strong>{toBRL(calculations.financingAmount(car))}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {showTradeInCard && (
                  <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-base font-semibold text-zinc-900 mb-2">Carro para Troca</h3>
                    <div className="text-sm">
                      <InfoRow label="Modelo">
                        {isEditing ? (
                          <Input
                            value={botData.trade_in_car?.model || ''}
                            onChange={e => handleDeepChange('bot_data.trade_in_car.model', e.target.value)}
                            className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                          />
                        ) : (
                          botData.trade_in_car?.model || 'N/A'
                        )}
                      </InfoRow>
                      <InfoRow label="Ano">
                        {isEditing ? (
                          <Input
                            value={botData.trade_in_car?.year || ''}
                            onChange={e => handleDeepChange('bot_data.trade_in_car.year', e.target.value)}
                            className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                          />
                        ) : (
                          botData.trade_in_car?.year || 'N/A'
                        )}
                      </InfoRow>
                      <InfoRow label="Valor Desejado">
                        {isEditing ? (
                          <Input
                            value={botData.trade_in_car?.value || ''}
                            onChange={e => handleCurrencyChange(e, 'bot_data.trade_in_car.value')}
                            placeholder="0,00"
                            inputMode="numeric"
                            className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                          />
                        ) : (
                          toBRL(botData.trade_in_car?.value) || 'N/A'
                        )}
                      </InfoRow>
                      {calculations.tradeDifference > 0 ? (
                        <div className="border-t mt-4 pt-4 space-y-2">
                          <div className="p-2 bg-zinc-100 rounded text-sm text-center text-zinc-900">
                            Diferença a pagar: <strong>{toBRL(calculations.tradeDifference)}</strong>
                          </div>
                          <InfoRow label="Pagar diferença">
                            {isEditing ? (
                              <Select
                                value={botData.trade_in_car?.difference_payment_method?.type || ''}
                                onValueChange={v => handleDeepChange('bot_data.trade_in_car.difference_payment_method.type', v)}
                              >
                                <SelectTrigger className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-zinc-200">
                                  <SelectItem value="a_vista">À Vista</SelectItem>
                                  <SelectItem value="financiamento">Financiamento</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              botData.trade_in_car?.difference_payment_method?.type === 'financiamento' ? 'Financiamento' : 'À Vista'
                            )}
                          </InfoRow>
                          {botData.trade_in_car?.difference_payment_method?.type === 'financiamento' && (
                            <InfoRow label="Parcelas (Diferença)">
                              {isEditing ? (
                                <Select
                                  value={String(botData.trade_in_car?.difference_payment_method?.parcels || '12')}
                                  onValueChange={v => handleDeepChange('bot_data.trade_in_car.difference_payment_method.parcels', v)}
                                >
                                  <SelectTrigger className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-zinc-200">
                                    {installmentOptions.map(opt => (
                                      <SelectItem key={opt} value={String(opt)}>{opt}x</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                `${botData.trade_in_car?.difference_payment_method?.parcels || 'N/A'}x`
                              )}
                            </InfoRow>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 p-2 bg-zinc-100 rounded text-sm text-center text-zinc-900">
                          O valor da troca cobre o do veículo.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="text-base font-semibold text-zinc-900 mb-2">Histórico</h3>
                  <ScrollArea className="h-40">
                    <div className="space-y-3 text-xs">
                      {(botData.history || []).slice().reverse().map((item, index) => (
                        <div key={index} className="border-l-2 border-amber-500 pl-3">
                          <p className="font-semibold text-zinc-900">{Object.values(item.updated_data)[0]}</p>
                          <p className="text-zinc-600">{item.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                {(tradeInPhotos.length > 0 || newTradeInPhotos.length > 0 || isEditing) && (
                  <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
                    <h3 className="text-base font-semibold text-zinc-900 mb-2">Fotos da Troca</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {tradeInPhotos.map(docPath => (
                        <div key={docPath} className="relative group">
                          <img src={docPath} alt="Foto da Troca" className="w-full h-20 object-cover rounded" />
                          {isEditing && (
                            <motion.button
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
                              onClick={() => removeExistingFile(docPath, 'tradeInPhotos')}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Feather.X className="h-4 w-4" />
                            </motion.button>
                          )}
                        </div>
                      ))}
                      {newTradeInPhotos.map(file => (
                        <div key={file.preview} className="relative group">
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-20 object-cover rounded border-2 border-dashed border-amber-500"
                          />
                          {isEditing && (
                            <motion.button
                              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                              onClick={() => removeNewFile(file.preview, 'tradeInPhotos')}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Feather.X className="h-4 w-4" />
                            </motion.button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          multiple
                          ref={tradeInInputRef}
                          onChange={e => handleFileSelect(e, 'tradeInPhotos')}
                          className="hidden"
                        />
                        <motion.button
                          className="w-full mt-4 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
                          onClick={() => tradeInInputRef.current.click()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Feather.Upload className="h-4 w-4 mr-2 inline" /> Adicionar Fotos
                        </motion.button>
                      </>
                    )}
                  </div>
                )}
                <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="text-base font-semibold text-zinc-900 mb-2">Documentos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {visibleDocuments.map(docPath => (
                      <div key={docPath} className="relative group">
                        <img
                          src={docPath}
                          alt="Documento"
                          className="w-full h-20 object-cover rounded"
                        />
                        {isEditing && (
                          <motion.button
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"
                            onClick={() => removeExistingFile(docPath, 'documents')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Feather.X className="h-4 w-4" />
                          </motion.button>
                        )}
                      </div>
                    ))}
                    {newDocs.map(file => (
                      <div key={file.preview} className="relative group">
                        <div className="w-full h-20 flex items-center justify-center rounded border-2 border-dashed border-amber-500">
                          <Feather.FileText className="h-10 w-10 text-amber-500" />
                        </div>
                        {isEditing && (
                          <motion.button
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                            onClick={() => removeNewFile(file.preview, 'documents')}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Feather.X className="h-4 w-4" />
                          </motion.button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        multiple
                        ref={docInputRef}
                        onChange={e => handleFileSelect(e, 'documents')}
                        className="hidden"
                      />
                      <motion.button
                        className="w-full mt-4 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
                        onClick={() => docInputRef.current.click()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Feather.Upload className="h-4 w-4 mr-2 inline" /> Adicionar Documentos
                      </motion.button>
                    </>
                  )}
                </div>
                <div className="bg-white/70 p-4 rounded-lg border border-zinc-200 shadow-sm">
                  <h3 className="text-base font-semibold text-zinc-900 mb-2">Anotações</h3>
                  {isEditing ? (
                    <Textarea
                      value={botData.notes || ''}
                      onChange={e => handleDeepChange('bot_data.notes', e.target.value)}
                      className="min-h-[150px] border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  ) : (
                    <p className="text-sm text-zinc-600 whitespace-pre-wrap">
                      {botData.notes || 'Nenhuma.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// --- Componente Principal do CRM ---
function CRMKanbanContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeClient, setActiveClient] = useState(null);
  const [detailedClient, setDetailedClient] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedItemRect, setDraggedItemRect] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const boardRef = useRef(null);
  const COLUMNS_PER_PAGE = isMobile ? 1 : 4;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    refetchInterval: 10000
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateStatusMutation = useMutation({
    mutationFn: updateClientStatus,
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Cliente movido." });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err) => toast({ title: "Erro", description: err.message, variant: 'destructive' }),
  });

  const updateDetailsMutation = useMutation({
    mutationFn: updateClientDetails,
    onError: (err) => toast({ title: "Erro ao Salvar", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: ({ chatId }) => {
      toast({ title: "Sucesso", description: "Cliente deletado." });
      queryClient.setQueryData(['clients'], (old) => old?.filter((c) => c.chat_id !== chatId));
      if (detailedClient?.chat_id === chatId) setDetailedClient(null);
    },
    onError: (err) => toast({ title: "Erro", description: err.message, variant: 'destructive' }),
  });

  const filteredClients = useMemo(() =>
    clients.filter(c => (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())),
    [clients, searchTerm]
  );

  const columns = useMemo(() => {
    const data = Object.fromEntries(KANBAN_COLUMNS.map(col => [col.id, []]));
    filteredClients.forEach(client => {
      const columnId = getClientColumnId(client.bot_data?.state);
      if (data[columnId]) {
        data[columnId].push(client);
      } else {
        data[KANBAN_COLUMNS[0].id].push(client);
      }
    });
    return KANBAN_COLUMNS.map(col => ({ ...col, clients: data[col.id] }));
  }, [filteredClients]);

  useEffect(() => {
    if (boardRef.current?.firstChild) {
      const column = boardRef.current.firstChild;
      const columnWidth = column.offsetWidth;
      const gap = parseFloat(window.getComputedStyle(boardRef.current).gap || '16');
      const offset = (columnWidth + gap) * (currentPage - 1);
      boardRef.current.style.transform = `translateX(-${offset}px)`;
    }
  }, [currentPage, columns, isMobile]);

  function handleDragStart(event) {
    setActiveClient(clients.find(c => c.chat_id === event.active.id));
    if (event.active.rect.current.initial) {
      setDraggedItemRect(event.active.rect.current.initial);
    }
  }

  function handleDragEnd(event) {
    setActiveClient(null);
    setDraggedItemRect(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const overIsColumn = KANBAN_COLUMNS.some(col => col.id === over.id);
      if (overIsColumn) {
        const client = clients.find(c => c.chat_id === event.active.id);
        const currentStatus = getClientColumnId(client?.bot_data?.state);
        if (currentStatus !== over.id) {
          updateStatusMutation.mutate({ chatId: active.id, newState: over.id });
        }
      }
    }
  }

  const handleDeleteRequest = (chatId) => {
    setClientToDelete(chatId);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete);
      setClientToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <motion.div className="p-6 relative z-10" initial="hidden" animate="visible" variants={fadeInUp}>
        <div className="text-zinc-800">Carregando CRM...</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div className="p-6 relative z-10" initial="hidden" animate="visible" variants={fadeInUp}>
        <div className="text-red-500">Erro ao carregar dados: {error.message}</div>
      </motion.div>
    );
  }

  const totalPages = Math.ceil(columns.length / COLUMNS_PER_PAGE);
  const visibleColumns = columns.slice(
    (currentPage - 1) * COLUMNS_PER_PAGE,
    currentPage * COLUMNS_PER_PAGE
  );

  return (
    <div className="space-y-6 p-4 md:p-6 relative z-10">
      <motion.h1
        className="text-2xl md:text-3xl font-bold text-zinc-900"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        CRM - Funil de Vendas
      </motion.h1>
      <motion.div
        className="relative max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <Feather.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
        <Input
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
        />
      </motion.div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <motion.div
          ref={boardRef}
          className="flex gap-4 md:gap-6 items-start transition-transform duration-300 ease-in-out"
          style={{ width: isMobile ? `${columns.length * 100}%` : 'auto' }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {columns.length > 0 ? (
            columns.map((column) => (
              <motion.div
                key={column.id}
                className={`flex-shrink-0 min-w-0 ${isMobile ? 'w-full max-w-[calc(100vw-2.5rem)]' : 'w-72'} overflow-x-visible box-border`}
                variants={fadeInUp}
              >
                <SortableContext
                  id={column.id}
                  items={column.clients.map(c => c.chat_id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-4 p-4 bg-zinc-100 rounded-lg h-full">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm md:text-base text-zinc-900 truncate max-w-[80%]">{column.name}</h3>
                      <motion.div
                        className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {column.clients.length}
                      </motion.div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-22rem)]">
                      <div className="flex-1 space-y-3">
                        {column.clients.length > 0 ? (
                          column.clients.map((client) => (
                            <ClientCard
                              key={client.chat_id}
                              client={client}
                              onDelete={handleDeleteRequest}
                              onViewDetails={() => setDetailedClient(client)}
                            />
                          ))
                        ) : (
                          <div className="h-full flex items-center justify-center text-sm text-zinc-600">
                            Nenhum lead
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </SortableContext>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="w-full text-center text-zinc-600"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              Nenhuma coluna disponível
            </motion.div>
          )}
        </motion.div>
        <DragOverlay>
          {activeClient && draggedItemRect ? (
            <div style={{ width: isMobile ? 'calc(100vw - 3.5rem)' : draggedItemRect.width, height: draggedItemRect.height }}>
              <ClientCard client={activeClient} onDelete={() => {}} onViewDetails={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {columns.length > 0 && (
        <motion.div
          className="flex flex-col items-center gap-2 mt-4 z-10"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="text-sm text-zinc-600">
            {isMobile ? (
              `Coluna: ${visibleColumns[0]?.name || 'N/A'} (${currentPage} de ${totalPages})`
            ) : (
              `Página ${currentPage} de ${totalPages}`
            )}
          </div>
          <div className="flex justify-center items-center gap-2">
            <motion.button
              className="h-8 w-8 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Feather.ChevronLeft className="h-4 w-4" />
            </motion.button>
            {isMobile ? (
              <Select
                value={String(currentPage)}
                onValueChange={(value) => setCurrentPage(Number(value))}
              >
                <SelectTrigger className="w-40 h-8 text-sm border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20">
                  <SelectValue placeholder="Selecionar coluna" />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-200">
                  {columns.map((col, index) => (
                    <SelectItem key={col.id} value={String(index + 1)}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <motion.button
                  key={page}
                  className={`h-8 w-8 rounded-lg ${currentPage === page ? 'bg-amber-500 text-white' : 'border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50'} transition-all`}
                  onClick={() => setCurrentPage(page)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page}
                </motion.button>
              ))
            )}
            <motion.button
              className="h-8 w-8 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Feather.ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
      {detailedClient && (
        <ClientDetailDialog
          client={detailedClient}
          isOpen={!!detailedClient}
          onOpenChange={(isOpen) => !isOpen && setDetailedClient(null)}
          updateMutation={updateDetailsMutation}
        />
      )}
      <Dialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white/70 border-zinc-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900">
              <Feather.AlertTriangle className="text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-zinc-600">
              Você tem certeza que deseja excluir este cliente? Esta ação é irreversível e todos os dados serão perdidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <motion.button
              className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
              onClick={() => setClientToDelete(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
              onClick={handleConfirmDelete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sim, Excluir Cliente
            </motion.button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function CRMKanban() {
  return (
    <ToastProvider>
      <CRMKanbanContent />
    </ToastProvider>
  );
}

export default CRMKanban;