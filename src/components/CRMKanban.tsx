import React, { useState, useMemo, useEffect, useRef, useContext, useReducer } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Componentes UI ---
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// --- ÍCONES ---
import { 
    Search, Trash2, FileText, Edit, Save, XCircle, X, Upload, AlertTriangle, ChevronLeft, ChevronRight, Loader2, Download,
    User, Car as CarIcon, RefreshCw, Landmark, Calendar, File as FileIcon, MessageSquare, StickyNote 
} from 'lucide-react';

// --- Componentes Drag-and-Drop ---
import { DndContext, closestCenter, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sistema de Notificações (Toast) ---
const ToastContext = React.createContext(null);
function toastReducer(state, action) {
    switch (action.type) {
        case 'ADD_TOAST': return [...state, action.payload];
        case 'REMOVE_TOAST': return state.filter(t => t.id !== action.id);
        default: return state;
    }
}
const Toaster = ({ toasts, dispatch }) => {
    const variantClasses = { default: 'bg-background text-foreground border', destructive: 'bg-destructive text-destructive-foreground border-destructive' };
    return (
        <div className="fixed bottom-0 right-0 p-6 space-y-2 z-[100]">
            {toasts.map(toast => (
                <div key={toast.id} className={`p-4 rounded-md shadow-lg flex items-start gap-4 w-80 md:w-96 ${variantClasses[toast.variant || 'default']}`}>
                    <div className="flex-grow">
                        {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
                        {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
                    </div>
                    <button onClick={() => dispatch({ type: 'REMOVE_TOAST', id: toast.id })} className="p-1 rounded-full hover:bg-white/10"><X className="h-4 w-4" /></button>
                </div>
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
    if (!dispatch) { throw new Error('useToast must be used within a ToastProvider'); }
    return {
        toast: ({ title, description, variant = 'default', duration = 5000 }) => {
            const id = Date.now();
            dispatch({ type: 'ADD_TOAST', payload: { id, title, description, variant } });
            setTimeout(() => { dispatch({ type: 'REMOVE_TOAST', id }); }, duration);
        },
    };
};

// --- Funções da API e Tipos ---
import {
    fetchClients,
    fetchAvailableCars,
    updateClientStatus,
    updateClientDetails,
    deleteClient,
    uploadClientFile,
    deleteClientFile
} from '@/services/api';
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

const parseCurrency = (value) => {
    if (typeof value === 'number') return value;
    if (!value || typeof value !== 'string') return 0;
    const cleaned = String(value).replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

const toBRL = (value) => {
    const number = parseCurrency(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};

const getClientColumnId = (state) => {
    if (!state) return "leed_recebido";
    const columnExists = KANBAN_COLUMNS.some(col => col.id === state);
    return columnExists ? state : "leed_recebido";
};

// --- Componente do Card do Cliente ---
function ClientCard({ client, onDelete, onViewDetails }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: client.chat_id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 0 };
    
    let interestedVehicleName = "Nenhum";
    if (client.bot_data?.interested_vehicles) {
        try {
            const vehicles = typeof client.bot_data.interested_vehicles === 'string' 
                ? JSON.parse(client.bot_data.interested_vehicles) 
                : client.bot_data.interested_vehicles;
            interestedVehicleName = vehicles[0]?.nome || "Nenhum";
        } catch (e) { console.error("Erro ao parsear interested_vehicles:", e); }
    }

    const dealTypeKey = client.bot_data?.deal_type || "Não informado";
    const dealType = KANBAN_COLUMNS.find(c => c.id === dealTypeKey)?.name || dealTypeKey.charAt(0).toUpperCase() + dealTypeKey.slice(1);

    return (
        <Card ref={setNodeRef} style={style} {...attributes} className="touch-none bg-background/80 backdrop-blur-sm shadow-md hover:shadow-lg">
            <CardContent className="p-3">
                <div className="flex justify-between items-start gap-2">
                    <div {...listeners} className="flex-grow cursor-grab active:cursor-grabbing min-w-0 space-y-1">
                        <h4 className="font-semibold text-sm xs:text-base truncate">{client.name || "Cliente sem nome"}</h4>
                        <p className="text-xs xs:text-sm text-muted-foreground truncate">{interestedVehicleName}</p>
                        <p className="text-xs xs:text-sm text-muted-foreground truncate">{dealType}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col xs:flex-row items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onViewDetails}>
                            <FileText className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/80 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(client.chat_id); }}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

const InfoRow = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 border-b py-3 last:border-none">
        <Label className="text-left md:text-right text-muted-foreground text-xs font-semibold">{label}</Label>
        <div className="col-span-2 text-sm">{children}</div>
    </div>
);

const renderFilePreview = (docPath, isEditing, onRemove) => {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(docPath);
    return (
        <div key={docPath} className="relative group">
            <a href={docPath} target="_blank" rel="noopener noreferrer" className="block w-full h-20 rounded overflow-hidden bg-zinc-100">
                {isImage ? (
                    <img src={docPath} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center text-zinc-500 hover:bg-zinc-200">
                        <FileIcon className="h-8 w-8" />
                        <span className="text-xs mt-1 px-1 break-all">{docPath.split('/').pop().split('?')[0].slice(37)}</span>
                    </div>
                )}
            </a>
            {isEditing && (
                <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={onRemove}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};

// --- Componente do Modal de Detalhes do Cliente ---
function ClientDetailDialog({ client, isOpen, onOpenChange, updateMutation }) {
    const { toast } = useToast();
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
    const pdfContentRef = useRef(null);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [activeSection, setActiveSection] = useState('perfil');

    useEffect(() => {
        if (isOpen) {
            setActiveSection('perfil');
            if (allCars.length === 0) {
                setIsLoadingCars(true);
                fetchAvailableCars().then(setAllCars).catch(console.error).finally(() => setIsLoadingCars(false));
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (client) {
            const newFormData = produce(client, draft => {
                if (draft.interested_vehicles && typeof draft.interested_vehicles === 'string') try { draft.interested_vehicles = JSON.parse(draft.interested_vehicles); } catch (e) { draft.interested_vehicles = []; }
                if (draft.trade_in_car && typeof draft.trade_in_car === 'string') try { draft.trade_in_car = JSON.parse(draft.trade_in_car); } catch (e) { draft.trade_in_car = {}; }
                if (draft.financing_details && typeof draft.financing_details === 'string') try { draft.financing_details = JSON.parse(draft.financing_details); } catch (e) { draft.financing_details = {}; }
                if (draft.bot_data?.interested_vehicles && typeof draft.bot_data.interested_vehicles === 'string') try { draft.bot_data.interested_vehicles = JSON.parse(draft.bot_data.interested_vehicles); } catch (e) { draft.bot_data.interested_vehicles = []; }
                if (draft.bot_data?.financing_details?.entry) draft.bot_data.financing_details.entry = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseCurrency(draft.bot_data.financing_details.entry));
                if (draft.bot_data?.trade_in_car?.value) draft.bot_data.trade_in_car.value = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(parseCurrency(draft.bot_data.trade_in_car.value));
            });
            setFormData(newFormData);
        }
        if (!isEditing) {
            setNewDocs([]); setRemovedDocs([]);
            setNewTradeInPhotos([]); setRemovedTradeInPhotos([]);
        }
    }, [client, isEditing, isOpen]);

    useEffect(() => {
        return () => {
            newDocs.forEach(file => URL.revokeObjectURL(file.preview));
            newTradeInPhotos.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [newDocs, newTradeInPhotos]);

    const handleDeepChange = (path, value) => setFormData(produce(draft => {
        let current = draft;
        const keys = path.split('.');
        keys.slice(0, -1).forEach(key => { current = (current[key] = current[key] || {}); });
        current[keys[keys.length - 1]] = value;
    }));

    const handleStatusChange = (value) => setFormData(produce(draft => {
        draft.state = value;
        if (!draft.bot_data) draft.bot_data = {};
        draft.bot_data.state = value;
    }));

    const handleCurrencyChange = (e, path) => {
        const value = e.target.value;
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly === '') { handleDeepChange(path, ''); return; }
        const numberValue = Number(digitsOnly) / 100;
        const formattedValue = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(numberValue);
        handleDeepChange(path, formattedValue);
    };

    const handleYearChange = (e, path) => handleDeepChange(path, e.target.value.replace(/\D/g, '').slice(0, 4));
    const handleFileSelect = (e, type) => {
        const files = Array.from(e.target.files).map(file => ({ file, preview: URL.createObjectURL(file) }));
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
            const payload = produce(formData, draft => {});
            
            const newDocUrls = await Promise.all(
                newDocs.map(f => uploadClientFile({ chatId: client.chat_id, file: f.file, bucketName: 'client-documents', filePathPrefix: 'documents' }))
            );
            const newTradeInUrls = await Promise.all(
                newTradeInPhotos.map(f => uploadClientFile({ chatId: client.chat_id, file: f.file, bucketName: 'trade-in-cars', filePathPrefix: 'trade-in' }))
            );

            await Promise.all([
                ...removedDocs.map(docUrl => deleteClientFile({ fileUrl: docUrl, bucketName: 'client-documents' })),
                ...removedTradeInPhotos.map(photoUrl => deleteClientFile({ fileUrl: photoUrl, bucketName: 'trade-in-cars' }))
            ]);

            const finalPayload = produce(payload, draft => {
                const currentDocs = (draft.documents || []).filter(doc => !removedDocs.includes(doc));
                draft.documents = [...currentDocs, ...newDocUrls];

                if (draft.bot_data) {
                    draft.bot_data.documents = draft.documents; 
                    if (draft.bot_data.trade_in_car) {
                        const currentPhotos = (draft.bot_data.trade_in_car.photos || []).filter(p => !removedTradeInPhotos.includes(p));
                        draft.bot_data.trade_in_car.photos = [...currentPhotos, ...newTradeInUrls];
                    }
                }
                
                if (draft.bot_data?.financing_details?.entry) draft.bot_data.financing_details.entry = parseCurrency(draft.bot_data.financing_details.entry);
                if (draft.bot_data?.trade_in_car?.value) draft.bot_data.trade_in_car.value = parseCurrency(draft.bot_data.trade_in_car.value);
                
                if (draft.interested_vehicles) draft.interested_vehicles = JSON.stringify(draft.interested_vehicles);
                if (draft.trade_in_car) draft.trade_in_car = JSON.stringify(draft.trade_in_car);
                if (draft.financing_details) draft.financing_details = JSON.stringify(draft.financing_details);

                draft.bot_data.history = [...(draft.bot_data?.history || []), { timestamp: new Date().toLocaleString("pt-BR"), updated_data: { changes: "Dados atualizados via CRM" } }];
            });
            
            await updateMutation.mutateAsync({ chatId: client.chat_id, updatedData: finalPayload });
            setIsEditing(false);

        } catch (error) {
            console.error("Falha detalhada ao salvar:", error);
            toast({
                title: "Falha ao Salvar",
                description: error.message || "Ocorreu um erro inesperado. Verifique o console.",
                variant: "destructive"
            });
        }
    };

    const handleDownloadPdf = async () => {
        const content = pdfContentRef.current;
        if (!content) return;

        setIsDownloadingPdf(true);
        toast({ title: "Gerando PDF...", description: "Por favor, aguarde um momento." });

        try {
            const canvas = await html2canvas(content, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfPageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            const scaledImgWidth = pdfWidth;
            const scaledImgHeight = scaledImgWidth / ratio;
            let heightLeft = scaledImgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, scaledImgWidth, scaledImgHeight);
            heightLeft -= pdfPageHeight;

            while (heightLeft > 0) {
                position -= pdfPageHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, scaledImgWidth, scaledImgHeight);
                heightLeft -= pdfPageHeight;
            }
            
            pdf.save(`Relatorio_${formData.name || 'Cliente'}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast({ title: "Erro", description: "Não foi possível gerar o PDF.", variant: "destructive" });
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const addInterestVehicle = (car) => {
        const currentVehicles = formData.bot_data?.interested_vehicles || [];
        handleDeepChange('bot_data.interested_vehicles', [...currentVehicles, car]);
        setVehicleSearch('');
    };
    const removeInterestVehicle = (carId) => {
        const currentVehicles = formData.bot_data?.interested_vehicles || [];
        handleDeepChange('bot_data.interested_vehicles', currentVehicles.filter(v => v.id !== carId));
    };
    
    const dealType = formData.bot_data?.deal_type;
    const hasTradeIn = dealType === 'troca';
    const hasVisit = dealType === 'visita';
    const hasFinancing = (dealType === 'comum' && formData.bot_data?.payment_method === 'financiamento') || 
                         (hasTradeIn && formData.bot_data?.trade_in_car?.difference_payment_method?.type === 'financiamento');

    const navSections = useMemo(() => [
        { id: 'perfil', label: 'Perfil', icon: User, condition: () => true },
        { id: 'interesse', label: 'Interesses', icon: CarIcon, condition: () => true },
        { id: 'troca', label: 'Troca', icon: RefreshCw, condition: () => hasTradeIn },
        { id: 'financiamento', label: 'Financiamento', icon: Landmark, condition: () => hasFinancing },
        { id: 'visita', label: 'Visita', icon: Calendar, condition: () => hasVisit },
        { id: 'documentos', label: 'Documentos', icon: FileIcon, condition: () => true },
        { id: 'anotacoes', label: 'Anotações', icon: StickyNote, condition: () => true },
        { id: 'historico', label: 'Histórico', icon: MessageSquare, condition: () => true },
    ].filter(section => section.condition()), [formData.bot_data]);
    
    if (!client) return null;

    const renderSectionContent = () => {
        const botData = formData.bot_data || {};
        const installmentOptions = [12, 24, 36, 48, 60];
        const visibleDocuments = (formData.documents || []).filter(doc => !removedDocs.includes(doc));
        const tradeInPhotos = (botData.trade_in_car?.photos || []).filter(p => !removedTradeInPhotos.includes(p));
        const vehicleSearchResults = useMemo(() => {
            const interestedVehicleIds = new Set((botData.interested_vehicles || []).map(v => v.id));
            const availableCars = allCars.filter(car => !interestedVehicleIds.has(car.id));
            if (!vehicleSearch) return availableCars;
            return availableCars.filter(car => car.nome.toLowerCase().includes(vehicleSearch.toLowerCase()));
        }, [vehicleSearch, allCars, botData.interested_vehicles]);
        const calculations = useMemo(() => {
            const interestedVehicles = botData.interested_vehicles || [];
            const entryValue = hasFinancing ? parseCurrency(botData.financing_details?.entry) : 0;
            const tradeInValue = hasTradeIn ? parseCurrency(botData.trade_in_car?.value) : 0;
            const financingAmount = (car) => {
                const carPrice = parseCurrency(car.preco);
                return Math.max(0, carPrice - entryValue - tradeInValue);
            };
            const totalCarPrice = interestedVehicles.reduce((sum, car) => sum + parseCurrency(car.preco), 0);
            const tradeDifference = totalCarPrice - tradeInValue;
            return { financingAmount, tradeDifference };
        }, [formData, hasFinancing, hasTradeIn]);

        switch (activeSection) {
            case 'perfil': return (<Card><CardHeader><CardTitle className="text-base">Perfil do Cliente</CardTitle></CardHeader><CardContent className="space-y-1 text-sm"><InfoRow label="Nome">{isEditing ? <Input value={formData.name || ''} onChange={e => handleDeepChange('name', e.target.value)} /> : (formData.name || 'N/A')}</InfoRow><InfoRow label="Telefone">{isEditing ? <Input value={formData.phone || ''} onChange={e => handleDeepChange('phone', e.target.value)} /> : (formData.phone || 'N/A')}</InfoRow><InfoRow label="CPF">{isEditing ? <Input value={formData.cpf || ''} onChange={e => handleDeepChange('cpf', e.target.value)} /> : (formData.cpf || 'N/A')}</InfoRow><InfoRow label="Ocupação">{isEditing ? <Input value={formData.job || ''} onChange={e => handleDeepChange('job', e.target.value)} /> : (formData.job || 'N/A')}</InfoRow><InfoRow label="Status no Funil">{isEditing ? (<Select value={formData.state || ''} onValueChange={handleStatusChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{KANBAN_COLUMNS.map(col => (<SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>))}</SelectContent></Select>) : (KANBAN_COLUMNS.find(c => c.id === formData.state)?.name || 'Não informado')}</InfoRow></CardContent></Card>);
            case 'interesse': return (<Card><CardHeader><CardTitle className="text-base">Veículos de Interesse</CardTitle></CardHeader><CardContent>{isEditing ? (<div className="space-y-2"><div className="flex flex-wrap gap-2 min-h-[24px]">{(botData.interested_vehicles || []).map(v => (<Badge key={v.id} variant="secondary" className="text-base py-1 pr-1">{v.nome}<button onClick={() => removeInterestVehicle(v.id)} className="ml-2 rounded-full hover:bg-destructive/80 p-0.5"><X className="h-3 w-3" /></button></Badge>))}</div><Popover><PopoverTrigger asChild><Input placeholder="Pesquisar e adicionar veículo..." value={vehicleSearch} onChange={e => setVehicleSearch(e.target.value)} /></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0">{isLoadingCars ? (<div className="p-4 text-center text-sm">Carregando...</div>) : vehicleSearchResults.length > 0 ? (<ScrollArea className="h-[200px]">{vehicleSearchResults.map(car => (<div key={car.id} onClick={() => addInterestVehicle(car)} className="p-2 hover:bg-accent cursor-pointer">{car.nome} - {toBRL(car.preco)}</div>))}</ScrollArea>) : (<div className="p-4 text-center text-sm">Nenhum veículo encontrado.</div>)}</PopoverContent></Popover></div>) : (botData.interested_vehicles?.length > 0 ? (<ul className="list-disc pl-5 text-sm text-muted-foreground">{botData.interested_vehicles.map(v => (<li key={v.id}>{v.nome}</li>))}</ul>) : (<p className="text-sm text-muted-foreground">Nenhum</p>))}</CardContent></Card>);
            case 'troca': return (<div className="space-y-6"><Card><CardHeader><CardTitle className="text-base">Carro para Troca</CardTitle></CardHeader><CardContent className="text-sm"><InfoRow label="Modelo">{isEditing ? <Input value={botData.trade_in_car?.model || ''} onChange={e => handleDeepChange('bot_data.trade_in_car.model', e.target.value)} /> : (botData.trade_in_car?.model || 'N/A')}</InfoRow><InfoRow label="Ano">{isEditing ? <Input value={botData.trade_in_car?.year || ''} onChange={e => handleYearChange(e, 'bot_data.trade_in_car.year')} placeholder="AAAA" /> : (botData.trade_in_car?.year || 'N/A')}</InfoRow><InfoRow label="Valor Desejado">{isEditing ? <Input value={botData.trade_in_car?.value || ''} onChange={e => handleCurrencyChange(e, 'bot_data.trade_in_car.value')} placeholder="R$ 0,00" inputMode="numeric"/> : (toBRL(botData.trade_in_car?.value) || 'N/A')}</InfoRow></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Fotos da Troca</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{tradeInPhotos.map(docPath => renderFilePreview(docPath, isEditing, () => removeExistingFile(docPath, 'tradeInPhotos')))}{newTradeInPhotos.map(file => (<div key={file.preview} className="relative group"><img src={file.preview} alt={file.file.name} className="w-full h-20 object-cover rounded border-2 border-dashed border-amber-500"/>{isEditing && (<Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeNewFile(file.preview, 'tradeInPhotos')}><X className="h-4 w-4" /></Button>)}</div>))}</div>{isEditing && (<><input type="file" multiple ref={tradeInInputRef} onChange={e => handleFileSelect(e, 'tradeInPhotos')} className="hidden"/><Button variant="outline" className="w-full mt-4" onClick={() => tradeInInputRef.current.click()}><Upload className="h-4 w-4 mr-2" />Adicionar Fotos</Button></>)}</CardContent></Card></div>);
            case 'financiamento': return (<Card><CardHeader><CardTitle className="text-base">Detalhes de Financiamento</CardTitle></CardHeader><CardContent className="text-sm"><InfoRow label="Valor da Entrada">{isEditing ? <Input value={botData.financing_details?.entry || ''} onChange={e => handleCurrencyChange(e, 'bot_data.financing_details.entry')} placeholder="R$ 0,00" inputMode="numeric"/> : (toBRL(botData.financing_details?.entry) || 'N/A')}</InfoRow><InfoRow label="Parcelas">{isEditing ? (<Select value={String(botData.financing_details?.parcels || '12')} onValueChange={v => handleDeepChange('bot_data.financing_details.parcels', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{installmentOptions.map(opt => (<SelectItem key={opt} value={String(opt)}>{opt}x</SelectItem>))}</SelectContent></Select>) : (`${botData.financing_details?.parcels || 'N/A'}x`)}</InfoRow></CardContent></Card>);
            case 'visita': return (<Card><CardHeader><CardTitle className="text-base">Agendamento de Visita</CardTitle></CardHeader><CardContent className="text-sm"><InfoRow label="Data">{isEditing ? <Input type="date" value={botData.visit_details?.day || ''} onChange={e => handleDeepChange('bot_data.visit_details.day', e.target.value)} /> : (botData.visit_details?.day || 'N/A')}</InfoRow><InfoRow label="Horário">{isEditing ? <Input type="time" value={botData.visit_details?.time || ''} onChange={e => handleDeepChange('bot_data.visit_details.time', e.target.value)} /> : (botData.visit_details?.time || 'N/A')}</InfoRow></CardContent></Card>);
            case 'documentos': return (<Card><CardHeader><CardTitle className="text-base">Documentos</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{visibleDocuments.map(docPath => renderFilePreview(docPath, isEditing, () => removeExistingFile(docPath, 'documents')))}{newDocs.map(file => (<div key={file.preview} className="relative group"><div className="w-full h-20 flex items-center justify-center rounded border-2 border-dashed border-amber-500"><FileIcon className="h-10 w-10 text-amber-500" /></div>{isEditing && (<Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeNewFile(file.preview, 'documents')}><X className="h-4 w-4" /></Button>)}</div>))}</div>{isEditing && (<><input type="file" multiple ref={docInputRef} onChange={e => handleFileSelect(e, 'documents')} className="hidden"/><Button variant="outline" className="w-full mt-4" onClick={() => docInputRef.current.click()}><Upload className="h-4 w-4 mr-2" />Adicionar Documentos</Button></>)}</CardContent></Card>);
            case 'anotacoes': return (<Card><CardHeader><CardTitle className="text-base">Anotações</CardTitle></CardHeader><CardContent>{isEditing ? (<Textarea className="min-h-[200px]" value={botData.notes || ''} onChange={e => handleDeepChange('bot_data.notes', e.target.value)} />) : (<p className="text-sm text-muted-foreground whitespace-pre-wrap">{botData.notes || 'Nenhuma.'}</p>)}</CardContent></Card>);
            case 'historico': return (<Card><CardHeader><CardTitle className="text-base">Histórico</CardTitle></CardHeader><CardContent><ScrollArea className="h-60"><div className="space-y-3 text-xs pr-4">{(botData.history || []).slice().reverse().map((item, index) => (<div key={index} className="border-l-2 pl-3"><p className="font-semibold">{item.updated_data?.changes || Object.values(item.updated_data)[0]}</p><p className="text-muted-foreground">{item.timestamp}</p></div>))}</div></ScrollArea></CardContent></Card>);
            default: return <div>Selecione uma seção</div>;
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[95vw] md:max-w-6xl max-h-[90vh] p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <DialogTitle className="text-lg md:text-xl">{formData.name || "Detalhes do Cliente"}</DialogTitle>
                        <div className="flex items-center gap-2">
                             {!isEditing && (
                                <Button size="sm" variant="outline" onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
                                    {isDownloadingPdf ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando...</> : <><Download className="h-4 w-4 mr-2" /> Baixar PDF</>}
                                </Button>
                            )}
                            {isEditing ? (
                                <>
                                    <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-white"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
                                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} disabled={updateMutation.isPending}><XCircle className="h-4 w-4 mr-2" /> Cancelar</Button>
                                </>
                            ) : (
                                <Button size="sm" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4 mr-2" /> Editar</Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>
                <div className="p-4 border-b block md:hidden">
                    <Select value={activeSection} onValueChange={setActiveSection}>
                        <SelectTrigger><SelectValue placeholder="Navegar para uma seção..." /></SelectTrigger>
                        <SelectContent>
                            {navSections.map(section => (
                                <SelectItem key={section.id} value={section.id}>
                                    <div className="flex items-center gap-2">
                                        <section.icon className="h-4 w-4" />
                                        <span>{section.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-1 flex min-h-0">
                    <aside className="border-r bg-muted/30 hidden md:block w-[250px] flex-shrink-0">
                         <ScrollArea className="h-full py-4">
                             <nav className="px-4 space-y-1">
                                {navSections.map(section => (
                                    <Button key={section.id} variant={activeSection === section.id ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setActiveSection(section.id)}>
                                        <section.icon className="mr-2 h-4 w-4" />
                                        {section.label}
                                    </Button>
                                ))}
                            </nav>
                        </ScrollArea>
                    </aside>
                    <main className="flex-1 min-w-0">
                        <ScrollArea className="h-full">
                            <div ref={pdfContentRef} className="p-6 bg-white space-y-6">
                                {renderSectionContent()}
                            </div>
                        </ScrollArea>
                    </main>
                </div>
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
    const [clientToDelete, setClientToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const boardRef = useRef(null);
    const columnRefs = useRef({});
    
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
    const { data: clients = [], isLoading, error } = useQuery({ queryKey: ['clients'], queryFn: fetchClients, refetchInterval: 10000 });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const updateStatusMutation = useMutation({
        mutationFn: updateClientStatus,
        onSuccess: () => { toast({ title: "Sucesso", description: "Cliente movido." }); queryClient.invalidateQueries({ queryKey: ['clients'] }); },
        onError: (err) => toast({ title: "Erro", description: err.message, variant: 'destructive' }),
    });

    const updateDetailsMutation = useMutation({
        mutationFn: updateClientDetails,
        onSuccess: async (data, variables) => {
            toast({ title: "Sucesso!", description: "Dados do cliente atualizados." });
            await queryClient.invalidateQueries({ queryKey: ['clients'] });
            const updatedClient = (queryClient.getQueryData(['clients']) || []).find(c => c.chat_id === variables.chatId);
            if (updatedClient) setDetailedClient(updatedClient);
        },
        onError: (err) => toast({ title: "Erro ao Salvar", description: err.message, variant: "destructive" }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteClient,
        onSuccess: (chatId) => {
            toast({ title: "Sucesso", description: "Cliente deletado." });
            queryClient.setQueryData(['clients'], (old) => old?.filter((c) => c.chat_id !== chatId));
            if (detailedClient?.chat_id === chatId) setDetailedClient(null);
        },
        onError: (err) => toast({ title: "Erro", description: err.message, variant: 'destructive' }),
    });

    const filteredClients = useMemo(() => clients.filter(c => (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())), [clients, searchTerm]);

    const columns = useMemo(() => {
        const data = Object.fromEntries(KANBAN_COLUMNS.map(col => [col.id, []]));
        filteredClients.forEach(client => {
            const columnId = getClientColumnId(client.bot_data?.state);
            (data[columnId] = data[columnId] || []).push(client);
        });
        return KANBAN_COLUMNS.map(col => ({ ...col, clients: data[col.id] }));
    }, [filteredClients]);
    
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= columns.length) {
            setCurrentPage(newPage);
        }
    };
    function handleDragStart(event) {
        const client = filteredClients.find(c => c.chat_id === event.active.id);
        setActiveClient(client);
    }
    function handleDragEnd(event) {
        const { active, over } = event;
        setActiveClient(null);
        if (!over || active.id === over.id) return;

        const activeClientId = active.id;
        const overId = over.id;

        const overClient = filteredClients.find(c => c.chat_id === overId);
        let destColumnId;
        if (overClient) {
            destColumnId = getClientColumnId(overClient.bot_data?.state);
        } else {
            destColumnId = overId; // Assuming dropped on column
        }

        const sourceColumnId = getClientColumnId(activeClient?.bot_data?.state);

        if (sourceColumnId !== destColumnId) {
            updateStatusMutation.mutate({ chatId: activeClientId, newState: destColumnId });
        }
    }
    const handleDeleteRequest = (chatId) => setClientToDelete(chatId);
    const handleConfirmDelete = () => {
        if (clientToDelete) {
            deleteMutation.mutate(clientToDelete);
        }
        setClientToDelete(null);
    };

    if (isLoading) return <div className="p-6">Carregando CRM...</div>;
    if (error) return <div className="p-6 text-destructive">Erro ao carregar dados: {error.message}</div>;
    
    const visibleColumns = isMobile ? columns.slice(currentPage - 1, currentPage) : columns;

    return (
        <>
            <div className="space-y-6 p-4 md:p-6">
                <h1 className="text-2xl md:text-3xl font-bold">CRM - Funil de Vendas</h1>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input placeholder="Buscar clientes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 focus-visible:ring-amber-500/20"/>
                </div>
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                    <div ref={boardRef} className="w-full overflow-x-auto pb-4 scroll-smooth">
                        <div className="flex gap-4 md:gap-6 items-start">
                            {visibleColumns.map((column) => (
                                <div key={column.id} ref={el => columnRefs.current[column.id] = el} className="flex-shrink-0 w-[calc(100%-2rem)] sm:w-72 box-border">
                                    <SortableContext id={column.id} items={column.clients.map(c => c.chat_id)} strategy={verticalListSortingStrategy}>
                                        <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg h-full">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-sm md:text-base truncate">{column.name}</h3>
                                                <Badge variant="secondary">{column.clients.length}</Badge>
                                            </div>
                                            <div className="h-[calc(100vh-22rem)] overflow-y-scroll pr-2">
                                                <div className="space-y-3">
                                                    {column.clients.length > 0 ? (
                                                        column.clients.map((client) => (
                                                            <ClientCard key={client.chat_id} client={client} onDelete={handleDeleteRequest} onViewDetails={() => setDetailedClient(client)} />
                                                        ))
                                                    ) : ( <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Nenhum lead</div> )}
                                                </div>
                                            </div>
                                        </div>
                                    </SortableContext>
                                </div>
                            ))}
                        </div>
                    </div>
                    <DragOverlay>{activeClient ? <ClientCard client={activeClient} onDelete={() => { }} onViewDetails={() => { }} /> : null}</DragOverlay>
                </DndContext>
                {isMobile && (
                    <div className="flex justify-between items-center mt-4">
                        <Button variant="ghost" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                        <span className="text-sm font-medium">{currentPage} / {columns.length}</span>
                        <Button variant="ghost" disabled={currentPage === columns.length} onClick={() => handlePageChange(currentPage + 1)}>
                            <ChevronRight className="h-6 w-6" />
                        </Button>
                    </div>
                )}
            </div>
            {detailedClient && (<ClientDetailDialog client={detailedClient} isOpen={!!detailedClient} onOpenChange={(isOpen) => !isOpen && setDetailedClient(null)} updateMutation={updateDetailsMutation}/>)}
            <Dialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setClientToDelete(null)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Excluir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
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