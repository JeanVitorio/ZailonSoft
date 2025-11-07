// src/pages/CRMKanban.tsx
// Kanban com melhor contraste no header das colunas, Dialog premium e PDF “alto padrão”.

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useContext,
  useReducer,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produce } from 'immer';

// --- UI (shadcn/ui) ---
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertTriangle,
  X,
  Edit,
  Save,
  Upload,
  Download,
  Settings,
  Layers,
  Trash2,
  Search,
  FileText,
  XCircle,
  Loader2,
  ChevronRight,
  CalendarDays,
  Phone,
  User2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

// --- Drag-and-Drop ---
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- PDF ---
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- API (já existentes no seu projeto) ---
import {
  fetchClients,
  fetchAvailableCars,
  updateClientStatus,
  updateClientDetails,
  deleteClient,
  uploadClientFile,
  deleteClientFile,
} from '@/services/api';

// -------------------- Toast simples --------------------
const ToastContext = React.createContext<any>(null);
function toastReducer(state: any[], action: any) {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload];
    case 'REMOVE_TOAST':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}
const Toaster = ({ toasts, dispatch }: { toasts: any[]; dispatch: any }) => {
  const variantClasses: Record<string, string> = {
    default: 'bg-background text-foreground border',
    destructive: 'bg-destructive text-destructive-foreground border-destructive',
  };
  return (
    <div className="fixed bottom-0 right-0 p-6 space-y-2 z-[100]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg flex items-start gap-4 w-80 md:w-96 ${variantClasses[toast.variant || 'default']}`}
        >
          <div className="flex-grow">
            {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dispatch({ type: 'REMOVE_TOAST', id: toast.id })}
            className="p-1 rounded-full hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
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
    toast: ({
      title,
      description,
      variant = 'default',
      duration = 5000,
    }: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive';
      duration?: number;
    }) => {
      const id = Date.now();
      dispatch({ type: 'ADD_TOAST', payload: { id, title, description, variant } });
      setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), duration);
    },
  };
};

// -------------------- Constantes / Utils --------------------
const LOJA_ID_ATUAL = 'loja_a64e29e9-c121-4f9a-8c9f-3d4411b43343';

const INITIAL_KANBAN_COLUMNS = [
  { id: 'leed_recebido', name: 'Novo Lead', isDefault: true, order: 1 },
  { id: 'aguardando_interesse', name: 'Aguardando Interesse', isDefault: false, order: 2 },
  { id: 'aguardando_escolha_carro', name: 'Aguardando Escolha', isDefault: false, order: 3 },
  { id: 'aguardando_confirmacao_veiculo', name: 'Aguardando Confirmação', isDefault: false, order: 4 },
  { id: 'aguardando_opcao_pagamento', name: 'Aguardando Pagamento', isDefault: false, order: 5 },
  { id: 'dados_troca', name: 'Dados de Troca', isDefault: false, order: 6 },
  { id: 'dados_visita', name: 'Dados de Visita', isDefault: false, order: 7 },
  { id: 'dados_financiamento', name: 'Dados de Financiamento', isDefault: false, order: 8 },
  { id: 'finalizado', name: 'Atendimento Finalizado', isDefault: false, order: 9 },
];
const LOCAL_STORAGE_KEY_PREFIX = 'kanban_columns_';

// BRL helpers
const parseCurrency = (value: any) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/R\$\s?/gi, '').replace(/\./g, '').replace(',', '.');
  const num = Number(cleaned);
  if (Number.isFinite(num)) return num;
  const digits = String(value).replace(/\D+/g, '');
  return digits ? Number(digits) / 100 : 0;
};
const toBRL = (value: any) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseCurrency(value),
  );

const getClientColumnId = (state: string, kanbanColumns: any[]) => {
  if (!state) return 'leed_recebido';
  const has = kanbanColumns.some((c) => c.id === state);
  return has ? state : 'leed_recebido';
};

// -------------------- Subcomponentes auxiliares --------------------
const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 border-b py-3 last:border-none">
    <Label className="text-left md:text-right text-muted-foreground text-xs font-semibold">
      {label}
    </Label>
    <div className="col-span-2 text-sm">{children}</div>
  </div>
);

const renderFilePreview = (docPath: string, isEditing: boolean, onRemove: () => void) => {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(docPath);
  return (
    <div key={docPath} className="relative group">
      <a
        href={docPath}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full h-32 rounded overflow-hidden bg-zinc-100 flex items-center justify-center"
      >
        {isImage ? (
          <img src={docPath} alt="Preview" className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-content-center text-center text-zinc-500 hover:bg-zinc-200 p-2">
            <FileText className="h-8 w-8" />
            <span className="text-xs mt-1 px-1 break-all">
              {docPath.split('/').pop()?.split('?')[0].slice(0, 24)}
            </span>
          </div>
        )}
      </a>
      {isEditing && (
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// -------------------- Card Sortable --------------------
function ClientCard({
  client,
  onDelete,
  onViewDetails,
}: {
  client: any;
  onDelete: (chatId: string) => void;
  onViewDetails: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: client.chat_id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
    touchAction: 'none',
  };

  let interestedVehicleName = 'Nenhum';
  if (client.bot_data?.interested_vehicles) {
    try {
      const vehicles =
        typeof client.bot_data.interested_vehicles === 'string'
          ? JSON.parse(client.bot_data.interested_vehicles)
          : client.bot_data.interested_vehicles;
      interestedVehicleName =
        Array.isArray(vehicles) && vehicles.length > 0 ? vehicles[0]?.nome || 'Nenhum' : 'Nenhum';
    } catch {
      /* noop */
    }
  }

  const dealTypeKey = client.bot_data?.deal_type || 'Não informado';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="touch-none bg-background/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow"
    >
      <CardContent className="p-3">
        <div className="flex justify-between items-start gap-2">
          <div
            {...listeners}
            className="flex-grow cursor-grab active:cursor-grabbing min-w-0 space-y-1"
            title="Arraste para mover"
          >
            <h4 className="font-semibold text-sm xs:text-base truncate leading-tight">
              {client.name || 'Cliente sem nome'}
            </h4>

            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] py-0.5 px-1.5 rounded">
                {interestedVehicleName}
              </Badge>
              <span className="text-[11px] text-muted-foreground truncate">
                {dealTypeKey}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col xs:flex-row items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onViewDetails}>
              <FileText className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive/80 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(client.chat_id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------- Coluna com área Droppable (HEADER com contraste alto) --------------------
function KanbanColumn({
  column,
  children,
  onEditClick,
  isImmutable,
  onRef,
}: {
  column: any;
  children: React.ReactNode;
  onEditClick: () => void;
  isImmutable: boolean;
  onRef: (el: HTMLDivElement | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column' },
  });

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        onRef(el);
      }}
      className="flex-shrink-0 w-[280px] sm:w-72 box-border relative h-[calc(100vh-18rem)] md:h-[calc(100vh-12rem)]"
    >
      <div
        id={column.id}
        className={`flex flex-col gap-4 p-4 rounded-lg h-full transition-colors ${
          isOver ? 'bg-amber-50 border border-amber-200' : 'bg-muted/50'
        } shadow-sm hover:shadow-md`}
      >
        {/* Header com gradiente escuro e texto claro */}
        <div className="sticky top-0 z-10 -m-1 -mt-1 mb-1 p-3 rounded-md text-white shadow-sm
                        bg-[linear-gradient(135deg,#0F172A_0%,#1F2937_40%,#92400E_100%)]
                        border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <h3 className="font-semibold text-sm md:text-base truncate">{column.name}</h3>
            {!isImmutable && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/10"
                onClick={onEditClick}
                title="Renomear coluna"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
          <span className="text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded-full">
            {column.clients.length}
          </span>
        </div>

        <div
          className="flex-1 overflow-y-scroll scrollbar-width-auto touch-pan-y pr-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="space-y-3">
            {children}
            {column.clients.length === 0 && (
              <div className="h-full min-h-[120px] flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-xl p-6">
                <Layers className="h-5 w-5 opacity-50" />
                <span>Sem leads por aqui ainda</span>
                <span className="text-xs">Arraste cartões para esta etapa</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Helpers de PDF (premium) --------------------
async function exportNodePaginatedToPDF(
  node: HTMLElement,
  filename: string,
  {
    scale = 2,
    marginMM = 8,
  }: { scale?: number; marginMM?: number } = {}
) {
  const canvas = await html2canvas(node, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
    scrollX: 0,
    scrollY: 0,
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth() - marginMM * 2;
  const pageHeight = pdf.internal.pageSize.getHeight() - marginMM * 2;

  const imgWidthMM = pageWidth;
  const imgHeightMM = (canvas.height * imgWidthMM) / canvas.width;

  const pxPerMM = canvas.width / imgWidthMM;
  const pageHeightInPx = pageHeight * pxPerMM;

  let renderedHeight = 0;

  const pageCanvas = document.createElement('canvas');
  const pageCtx = pageCanvas.getContext('2d')!;
  pageCanvas.width = canvas.width;
  pageCanvas.height = Math.min(pageHeightInPx, canvas.height);

  // Header e footer premium em cada página (faixa fina + numeração)
  const paintHeaderFooter = (pageIndex: number) => {
    // Header
    pdf.setFillColor(31, 41, 55); // slate-800
    pdf.rect(marginMM, marginMM - 4, pageWidth, 2, 'F');
    pdf.setTextColor(146, 64, 14); // amber-700
    pdf.setFontSize(9);
    pdf.text('CRM – Relatório de Cliente', marginMM, marginMM - 5.5);
    // Footer
    pdf.setDrawColor(229, 231, 235);
    pdf.line(marginMM, pdf.internal.pageSize.getHeight() - marginMM + 3, pdf.internal.pageSize.getWidth() - marginMM, pdf.internal.pageSize.getHeight() - marginMM + 3);
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(8);
    pdf.text(`Página ${pageIndex + 1}`, pdf.internal.pageSize.getWidth() - marginMM - 20, pdf.internal.pageSize.getHeight() - marginMM + 6);
  };

  let pageIndex = 0;

  while (renderedHeight < canvas.height) {
    const sliceHeight = Math.min(pageHeightInPx, canvas.height - renderedHeight);
    if (pageCanvas.height !== sliceHeight) {
      pageCanvas.height = sliceHeight;
    }

    pageCtx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageCtx.drawImage(
      canvas,
      0,
      renderedHeight,
      pageCanvas.width,
      sliceHeight,
      0,
      0,
      pageCanvas.width,
      sliceHeight
    );

    const imgData = pageCanvas.toDataURL('image/jpeg', 0.96);
    if (renderedHeight > 0) pdf.addPage();

    paintHeaderFooter(pageIndex);
    pdf.addImage(imgData, 'JPEG', marginMM, marginMM, pageWidth, (sliceHeight / pxPerMM));
    pageIndex++;
    renderedHeight += sliceHeight;
  }

  pdf.save(filename);
}

// -------------------- Modal Detalhes do Cliente (versão premium) --------------------
function ClientDetailDialog({
  client,
  isOpen,
  onOpenChange,
  updateMutation,
  customColumns,
}: {
  client: any;
  isOpen: boolean;
  onOpenChange: (o: boolean) => void;
  updateMutation: any;
  customColumns: any[];
}) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [allCars, setAllCars] = useState<any[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [newDocs, setNewDocs] = useState<any[]>([]);
  const [removedDocs, setRemovedDocs] = useState<string[]>([]);
  const [newTradeInPhotos, setNewTradeInPhotos] = useState<any[]>([]);
  const [removedTradeInPhotos, setRemovedTradeInPhotos] = useState<string[]>([]);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const tradeInInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInfoRef = useRef<HTMLDivElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [activeSection, setActiveSection] = useState('perfil');

  const [statusOpen, setStatusOpen] = useState(false);
  const [parcelsOpen, setParcelsOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const KANBAN_COLUMNS_MODAL = customColumns;

  const getClientCorrectedState = (client: any, columns: any[]) => {
    const currentState = client.state || client.bot_data?.state;
    const exists = columns.some((c) => c.id === currentState);
    return exists ? currentState : 'leed_recebido';
  };

  useEffect(() => {
    if (isOpen) {
      setActiveSection('perfil');
      if (allCars.length === 0) {
        setIsLoadingCars(true);
        fetchAvailableCars()
          .then(setAllCars)
          .catch(console.error)
          .finally(() => setIsLoadingCars(false));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (client) {
      const correctedState = getClientCorrectedState(client, KANBAN_COLUMNS_MODAL);
      const newFormData = produce(client, (draft: any) => {
        draft.state = correctedState;
        draft.bot_data = draft.bot_data || {};
        draft.bot_data.state = correctedState;

        if (draft.interested_vehicles && typeof draft.interested_vehicles === 'string')
          try {
            draft.interested_vehicles = JSON.parse(draft.interested_vehicles);
          } catch {
            draft.interested_vehicles = [];
          }
        if (draft.trade_in_car && typeof draft.trade_in_car === 'string')
          try {
            draft.trade_in_car = JSON.parse(draft.trade_in_car);
          } catch {
            draft.trade_in_car = {};
          }
        if (draft.financing_details && typeof draft.financing_details === 'string')
          try {
            draft.financing_details = JSON.parse(draft.financing_details);
          } catch {
            draft.financing_details = {};
          }
        if (draft.bot_data?.interested_vehicles && typeof draft.bot_data.interested_vehicles === 'string')
          try {
            draft.bot_data.interested_vehicles = JSON.parse(draft.bot_data.interested_vehicles);
          } catch {
            draft.bot_data.interested_vehicles = [];
          }

        if (draft.bot_data?.financing_details?.entry)
          draft.bot_data.financing_details.entry = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
          }).format(parseCurrency(draft.bot_data.financing_details.entry));
        if (draft.bot_data?.trade_in_car?.value)
          draft.bot_data.trade_in_car.value = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
          }).format(parseCurrency(draft.bot_data.trade_in_car.value));
      });
      setFormData(newFormData);
    }
    if (!isEditing) {
      setNewDocs([]);
      setRemovedDocs([]);
      setNewTradeInPhotos([]);
      setRemovedTradeInPhotos([]);
    }
  }, [client, isEditing, isOpen, KANBAN_COLUMNS_MODAL]);

  useEffect(() => {
    return () => {
      newDocs.forEach((f) => URL.revokeObjectURL(f.preview));
      newTradeInPhotos.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, [newDocs, newTradeInPhotos]);

  const dealType = formData?.bot_data?.deal_type;
  const paymentMethod = formData?.bot_data?.payment_method;
  const hasTradeIn = dealType === 'troca';
  const hasVisit = dealType === 'visita';
  const hasFinancing =
    dealType === 'financiamento' ||
    (hasTradeIn && paymentMethod === 'financiamento');

  const vehicleSearchResults = useMemo(() => {
    const botData = formData.bot_data || {};
    const interestedIds = new Set((botData.interested_vehicles || []).map((v: any) => v.id));
    const available = allCars.filter((c) => !interestedIds.has(c.id));

    const q = vehicleSearch.toLowerCase();
    if (!q) return available;
    return available.filter((c) => c.nome.toLowerCase().includes(q));
  }, [vehicleSearch, allCars, formData.bot_data?.interested_vehicles]);

  const navSections = useMemo(
    () =>
      [
        { id: 'perfil', label: 'Perfil', icon: User2, condition: () => true },
        { id: 'interesse', label: 'Interesses', icon: Search, condition: () => true },
        { id: 'troca', label: 'Troca', icon: ChevronRight, condition: () => hasTradeIn },
        { id: 'financiamento', label: 'Financiamento', icon: ChevronRight, condition: () => hasFinancing },
        { id: 'visita', label: 'Visita', icon: CalendarDays, condition: () => hasVisit },
        { id: 'documentos', label: 'Documentos', icon: FileText, condition: () => true },
      ].filter((s) => s.condition()),
    [hasTradeIn, hasFinancing, hasVisit],
  );

  const handleDeepChange = (path: string, value: any) =>
    setFormData(
      produce((draft: any) => {
        let current = draft;
        const keys = path.split('.');
        keys.slice(0, -1).forEach((k) => {
          current = (current[k] = current[k] || {});
        });
        current[keys[keys.length - 1]] = value;
      }),
    );

  const handleStatusChange = (value: string) =>
    setFormData(
      produce((draft: any) => {
        draft.state = value;
        draft.bot_data = draft.bot_data || {};
        draft.bot_data.state = value;
      }),
    );

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly === '') {
      handleDeepChange(path, '');
      return;
    }
    const numberValue = Number(digitsOnly) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
    }).format(numberValue);
    handleDeepChange(path, formatted);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>, path: string) =>
    handleDeepChange(path, e.target.value.replace(/\D/g, '').slice(0, 4));

  const [docsBusy, setDocsBusy] = useState(false);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'documents' | 'tradeInPhotos') => {
    const files = Array.from(e.target.files || []).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    if (type === 'documents') setNewDocs((p) => [...p, ...files]);
    if (type === 'tradeInPhotos') setNewTradeInPhotos((p) => [...p, ...files]);
  };
  const removeNewFile = (previewUrl: string, type: 'documents' | 'tradeInPhotos') => {
    URL.revokeObjectURL(previewUrl);
    if (type === 'documents') setNewDocs((p) => p.filter((f) => f.preview !== previewUrl));
    if (type === 'tradeInPhotos')
      setNewTradeInPhotos((p) => p.filter((f) => f.preview !== previewUrl));
  };
  const removeExistingFile = (filePath: string, type: 'documents' | 'tradeInPhotos') => {
    if (docsBusy) return;
    if (type === 'documents') setRemovedDocs((p) => [...new Set([...p, filePath])]);
    if (type === 'tradeInPhotos')
      setRemovedTradeInPhotos((p) => [...new Set([...p, filePath])]);
  };

  const handleSave = async () => {
    try {
      setDocsBusy(true);
      const payload = produce(formData, (draft: any) => {});

      const newDocUrls = await Promise.all(
        newDocs.map((f) =>
          uploadClientFile({
            chatId: client.chat_id,
            file: f.file,
            bucketName: 'client-documents',
            filePathPrefix: 'documents',
          }),
        ),
      );
      const newTradeInUrls = await Promise.all(
        newTradeInPhotos.map((f) =>
          uploadClientFile({
            chatId: client.chat_id,
            file: f.file,
            bucketName: 'trade-in-cars',
            filePathPrefix: 'trade-in',
          }),
        ),
      );

      await Promise.all([
        ...removedDocs.map((u) => deleteClientFile({ fileUrl: u, bucketName: 'client-documents' })),
        ...removedTradeInPhotos.map((u) =>
          deleteClientFile({ fileUrl: u, bucketName: 'trade-in-cars' })),
      ]);

      const finalPayload = produce(payload, (draft: any) => {
        const currentDocs = (draft.documents || []).filter((d: string) => !removedDocs.includes(d));
        draft.documents = [...currentDocs, ...newDocUrls];

        draft.bot_data = draft.bot_data || {};
        draft.bot_data.documents = draft.documents;

        if (draft.bot_data.trade_in_car) {
          const currentPhotos = (draft.bot_data.trade_in_car.photos || []).filter(
            (p: string) => !removedTradeInPhotos.includes(p),
          );
          draft.bot_data.trade_in_car.photos = [...currentPhotos, ...newTradeInUrls];
        }

        if (draft.bot_data?.financing_details?.entry)
          draft.bot_data.financing_details.entry = parseCurrency(draft.bot_data.financing_details.entry);
        if (draft.bot_data?.trade_in_car?.value)
          draft.bot_data.trade_in_car.value = parseCurrency(draft.bot_data.trade_in_car.value);

        if (draft.interested_vehicles)
          draft.interested_vehicles = JSON.stringify(draft.interested_vehicles);
        if (draft.trade_in_car) draft.trade_in_car = JSON.stringify(draft.trade_in_car);
        if (draft.financing_details)
          draft.financing_details = JSON.stringify(draft.financing_details);

        draft.bot_data.history = [
          ...(draft.bot_data?.history || []),
          {
            timestamp: new Date().toLocaleString('pt-BR'),
            updated_data: { changes: 'Dados atualizados via CRM' },
          },
        ];
      });

      await updateMutation.mutateAsync({
        chatId: client.chat_id,
        updatedData: finalPayload,
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Falha ao salvar:', error);
      toast({
        title: 'Falha ao Salvar',
        description: error?.message || 'Erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setDocsBusy(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfInfoRef.current) return;
    try {
      setIsDownloadingPdf(true);

      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-99999px';
      wrapper.style.top = '0';
      wrapper.style.width = '820px';
      wrapper.style.padding = '32px';
      wrapper.style.background = '#ffffff';
      wrapper.style.color = '#111827';
      wrapper.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto';

      const stateName =
        customColumns.find((c) => c.id === (formData.state || ''))?.name || 'Não informado';
      const today = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // Capa premium
      const cover = document.createElement('div');
      cover.innerHTML = `
        <div style="
          border: 1px solid #E5E7EB;
          border-radius: 24px;
          padding: 28px;
          background:
            linear-gradient(135deg,#0F172A 0%, #1F2937 40%, #92400E 100%);
          color: #fff;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        ">
          <div style="
            position:absolute;
            inset:auto -20% -20% auto;
            width:360px;
            height:360px;
            background: radial-gradient(closest-side, rgba(255,255,255,0.14), transparent 70%);
            transform: rotate(18deg);
          "></div>
          <div style="display:flex; align-items:center; gap:16px; position:relative;">
            <div style="width:62px; height:62px; border-radius:16px; background:#F59E0B; display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:22px; box-shadow: 0 6px 18px rgba(245,158,11,.35);">
              ${String(formData?.name || 'C')[0]?.toUpperCase() || 'C'}
            </div>
            <div style="flex:1;">
              <div style="font-weight:800; font-size:22px; line-height:1.2; margin-bottom:2px;">
                Relatório do Cliente
              </div>
              <div style="color:#FDE68A; font-size:13px;">Gerado em ${today}</div>
            </div>
            <div style="display:flex; gap:8px;">
              <span style="font-size:11px;background:rgba(255,255,255,.12);padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.2)">Status: ${stateName}</span>
              <span style="font-size:11px;background:rgba(255,255,255,.12);padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.2)">CRM</span>
            </div>
          </div>
        </div>
      `;

      // Conteúdo clonado
      const clone = pdfInfoRef.current.cloneNode(true) as HTMLElement;
      clone.style.position = 'static';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.width = 'auto';
      clone.style.padding = '0';
      clone.style.background = 'transparent';

      wrapper.appendChild(cover);
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      await exportNodePaginatedToPDF(
        wrapper,
        `Relatorio_${(formData?.name || 'Cliente').replace(/\s+/g, '_')}.pdf`,
        { scale: 2, marginMM: 10 }
      );

      document.body.removeChild(wrapper);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Erro ao gerar PDF',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const addInterestVehicle = (car: any) => {
    const current = formData.bot_data?.interested_vehicles || [];
    handleDeepChange('bot_data.interested_vehicles', [...current, car]);
    setVehicleSearch('');
  };

  const removeInterestVehicle = (carId: string) => {
    const current = formData.bot_data?.interested_vehicles || [];
    handleDeepChange(
      'bot_data.interested_vehicles',
      current.filter((v: any) => v.id !== carId),
    );
  };

  const botData = formData?.bot_data || {};
  const visibleDocuments = (formData.documents || []).filter((d: string) => !removedDocs.includes(d));
  const tradeInPhotos = (botData.trade_in_car?.photos || []).filter(
    (p: string) => !removedTradeInPhotos.includes(p),
  );

  const renderSectionContent = (sectionId: string, isForPdf = false) => {
    // “Cart” com moldura sutil e título destacado
    const SectionCard = ({ title, children }: any) => (
      <Card className={isForPdf ? '' : 'border-amber-100'}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">{children}</CardContent>
      </Card>
    );

    switch (sectionId) {
      case 'perfil':
        return (
          <SectionCard title="Perfil do Cliente">
            <InfoRow label="Nome">
              {isEditing && !isForPdf ? (
                <Input
                  value={formData.name || ''}
                  onChange={(e) => handleDeepChange('name', e.target.value)}
                />
              ) : (
                formData.name || 'N/A'
              )}
            </InfoRow>
            <InfoRow label="Telefone">
              {isEditing && !isForPdf ? (
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => handleDeepChange('phone', e.target.value)}
                />
              ) : (
                formData.phone || 'N/A'
              )}
            </InfoRow>
            <InfoRow label="CPF">
              {isEditing && !isForPdf ? (
                <Input
                  value={formData.cpf || ''}
                  onChange={(e) => handleDeepChange('cpf', e.target.value)}
                />
              ) : (
                formData.cpf || 'N/A'
              )}
            </InfoRow>
            <InfoRow label="Ocupação">
              {isEditing && !isForPdf ? (
                <Input
                  value={formData.job || ''}
                  onChange={(e) => handleDeepChange('job', e.target.value)}
                />
              ) : (
                formData.job || 'N/A'
              )}
            </InfoRow>
            <InfoRow label="Status no Funil">
              {isEditing && !isForPdf ? (
                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      {customColumns.find((c) => c.id === (formData.state || ''))?.name ||
                        'Selecione...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <ScrollArea className="h-48">
                      {customColumns.map((col) => (
                        <div
                          key={col.id}
                          className="p-2 hover:bg-accent cursor-pointer text-sm"
                          onClick={() => {
                            handleStatusChange(col.id);
                            setStatusOpen(false);
                          }}
                        >
                          {col.name}
                        </div>
                      ))}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
                  {customColumns.find((c) => c.id === formData.state)?.name || 'Não informado'}
                </span>
              )}
            </InfoRow>
          </SectionCard>
        );
      case 'interesse':
        return (
          <SectionCard title="Veículos de Interesse">
            {isEditing && !isForPdf ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 min-h-[24px]">
                  {(botData.interested_vehicles || []).map((v: any) => (
                    <Badge key={v.id} variant="secondary" className="text-base py-1 pr-1 h-auto">
                      {v.nome}
                      <button
                        onClick={() => removeInterestVehicle(v.id)}
                        className="ml-2 rounded-full hover:bg-destructive/80 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Input
                      placeholder="Pesquisar e adicionar veículo..."
                      value={vehicleSearch}
                      onChange={(e) => setVehicleSearch(e.target.value)}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    {isLoadingCars ? (
                      <div className="p-4 text-center text-sm">Carregando...</div>
                    ) : vehicleSearchResults.length > 0 ? (
                      <ScrollArea className="h-[200px]">
                        {vehicleSearchResults.map((car: any) => (
                          <div
                            key={car.id}
                            onClick={() => addInterestVehicle(car)}
                            className="p-2 hover:bg-accent cursor-pointer"
                          >
                            {car.nome} - {toBRL(car.preco)}
                          </div>
                        ))}
                      </ScrollArea>
                    ) : (
                      <div className="p-4 text-center text-sm">Nenhum veículo encontrado.</div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            ) : botData.interested_vehicles?.length > 0 ? (
              <div className="space-y-4">
                {(botData.interested_vehicles || []).map((v: any) => (
                  <div key={v.id} className="p-3 border rounded-md bg-white/60">
                    <h4 className="font-semibold text-base mb-2">{v.nome}</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <div className="text-muted-foreground">Ano:</div>
                      <div>{v.ano || 'N/A'}</div>
                      <div className="text-muted-foreground">Preço:</div>
                      <div>{toBRL(v.preco) || 'N/A'}</div>
                      <div className="text-muted-foreground">KM:</div>
                      <div>{v.km ? new Intl.NumberFormat('pt-BR').format(v.km) : 'N/A'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum veículo de interesse.</p>
            )}
          </SectionCard>
        );
      case 'troca':
        return (
          <SectionCard title="Carro para Troca">
            <InfoRow label="Modelo">
              {isEditing && !isForPdf ? (
                <Input
                  value={botData.trade_in_car?.model || ''}
                  onChange={(e) => handleDeepChange('bot_data.trade_in_car.model', e.target.value)}
                />
              ) : (
                botData.trade_in_car?.model || 'N/A'
              )}
            </InfoRow>
            <InfoRow label="Ano">
              {isEditing && !isForPdf ? (
                <Input
                  value={botData.trade_in_car?.year || ''}
                  onChange={(e) => handleYearChange(e, 'bot_data.trade_in_car.year')}
                  placeholder="AAAA"
                />
              ) : (
                botData.trade_in_car?.year || 'N/A'
              )}
            </InfoRow>
            <InfoRow label="Valor Desejado">
              {isEditing && !isForPdf ? (
                <Input
                  value={botData.trade_in_car?.value || ''}
                  onChange={(e) => handleCurrencyChange(e, 'bot_data.trade_in_car.value')}
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                />
              ) : (
                toBRL(botData.trade_in_car?.value) || 'N/A'
              )}
            </InfoRow>

            {!isForPdf && (
              <>
                <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] mt-4">
                  {(botData.trade_in_car?.photos || [])
                    .filter((p: string) => !removedTradeInPhotos.includes(p))
                    .map((docPath: string) =>
                      renderFilePreview(docPath, isEditing, () =>
                        removeExistingFile(docPath, 'tradeInPhotos'),
                      ),
                  )}
                  {isEditing &&
                    newTradeInPhotos.map((f) => (
                      <div key={f.preview} className="relative group">
                        <a
                          href={f.preview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full h-32 rounded overflow-hidden bg-zinc-100 flex items-center justify-center"
                        >
                          <img
                            src={f.preview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                        </a>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => removeNewFile(f.preview, 'tradeInPhotos')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      multiple
                      ref={tradeInInputRef}
                      onChange={(e) => handleFileSelect(e as any, 'tradeInPhotos')}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => tradeInInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" /> Adicionar Fotos
                    </Button>
                  </>
                )}
              </>
            )}
          </SectionCard>
        );
      case 'financiamento':
        return (
          <SectionCard title="Detalhes de Financiamento">
            <InfoRow label="Valor da Entrada">
              {isEditing && !isForPdf ? (
                <Input
                  value={botData.financing_details?.entry || ''}
                  onChange={(e) => handleCurrencyChange(e, 'bot_data.financing_details.entry')}
                  placeholder="R$ 0,00"
                  inputMode="numeric"
                />
              ) : (
                toBRL(botData.financing_details?.entry) || 'N/A'
              )}
            </InfoRow>
            <InfoRow label="Parcelas">
              {isEditing && !isForPdf ? (
                <Popover open={parcelsOpen} onOpenChange={setParcelsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start font-normal">
                      {`${String(botData.financing_details?.parcels || '12')}x`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <ScrollArea className="h-48">
                      {[12, 24, 36, 48, 60].map((opt) => (
                        <div
                          key={opt}
                          className="p-2 hover:bg-accent cursor-pointer text-sm"
                          onClick={() => {
                            handleDeepChange('bot_data.financing_details.parcels', String(opt));
                            setParcelsOpen(false);
                          }}
                        >
                          {opt}x
                        </div>
                      ))}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              ) : (
                `${botData.financing_details?.parcels || 'N/A'}x`
              )}
            </InfoRow>
          </SectionCard>
        );
      case 'visita':
        return (
          <SectionCard title="Agendamento de Visita">
            <InfoRow label="Data">
              {isEditing && !isForPdf ? (
                <Input
                  type="date"
                  value={botData.visit_details?.day || ''}
                  onChange={(e) => handleDeepChange('bot_data.visit_details.day', e.target.value)}
                />
              ) : (
                botData.visit_details?.day || 'N/A'
              )}
            </InfoRow>
            <InfoRow label="Horário">
              {isEditing && !isForPdf ? (
                <Input
                  type="time"
                  value={botData.visit_details?.time || ''}
                  onChange={(e) => handleDeepChange('bot_data.visit_details.time', e.target.value)}
                />
              ) : (
                botData.visit_details?.time || 'N/A'
              )}
            </InfoRow>
          </SectionCard>
        );
      case 'documentos':
        if (isForPdf) return null;
        return (
          <SectionCard title="Documentos">
            <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(8rem,1fr))]">
              {visibleDocuments.map((docPath: string) =>
                renderFilePreview(docPath, isEditing, () => removeExistingFile(docPath, 'documents')),
              )}
              {isEditing &&
                newDocs.map((f) => (
                  <div key={f.preview} className="relative group">
                    <a
                      href={f.preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-32 rounded overflow-hidden bg-zinc-100 flex items-center justify-center"
                    >
                      <img src={f.preview} alt="Preview" className="w-full h-full object-contain" />
                    </a>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => removeNewFile(f.preview, 'documents')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
            {isEditing && (
              <>
                <input
                  type="file"
                  multiple
                  ref={docInputRef}
                  onChange={(e) => handleFileSelect(e as any, 'documents')}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => docInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" /> Adicionar Documentos
                </Button>
              </>
            )}
          </SectionCard>
        );
      default:
        return <div>Selecione uma seção</div>;
    }
  };

  if (!client) return null;

  // HERO premium no topo do dialog
  const stateName = customColumns.find((c) => c.id === (formData.state || ''))?.name || '—';
  const initials = String(formData?.name || 'C')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] md:max-w-6xl max-h-[92vh] p-0 flex flex-col overflow-hidden">
        {/* HERO */}
        <div className="relative px-6 pt-6 pb-4 border-b
                        bg-[linear-gradient(135deg,#0F172A_0%,#1F2937_40%,#92400E_100%)]
                        text-white">
          <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 opacity-30 pointer-events-none">
            <Sparkles className="h-24 w-24" />
          </div>
          <div className="flex items-center justify-between gap-4 relative">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-xl bg-amber-500 flex items-center justify-center font-extrabold shadow-lg">
                {initials}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg md:text-xl truncate">
                  {formData.name || 'Detalhes do Cliente'}
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-[12px] text-amber-100 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {formData.phone || '—'}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="bg-white/15 hover:bg-white/25 border-white/20"
                >
                  {isDownloadingPdf ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" /> Baixar PDF
                    </>
                  )}
                </Button>
              )}
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" /> Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Cancelar
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)} className="bg-white text-slate-900 hover:bg-zinc-100">
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
              )}
            </div>
          </div>

          {/* Métricas rápidas */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="rounded-lg px-3 py-2 bg-white/10 border border-white/15">
              <div className="text-[11px] opacity-80">Status</div>
              <div className="text-sm font-semibold">{stateName}</div>
            </div>
            <div className="rounded-lg px-3 py-2 bg-white/10 border border-white/15">
              <div className="text-[11px] opacity-80">Tipo de Negócio</div>
              <div className="text-sm font-semibold">{formData?.bot_data?.deal_type || '—'}</div>
            </div>
            <div className="rounded-lg px-3 py-2 bg-white/10 border border-white/15">
              <div className="text-[11px] opacity-80">Entrada (se houver)</div>
              <div className="text-sm font-semibold">
                {toBRL(formData?.bot_data?.financing_details?.entry || 0)}
              </div>
            </div>
            <div className="rounded-lg px-3 py-2 bg-white/10 border border-white/15">
              <div className="text-[11px] opacity-80">Parcelas</div>
              <div className="text-sm font-semibold">
                {formData?.bot_data?.financing_details?.parcels || '—'}x
              </div>
            </div>
          </div>
        </div>

        {/* Navegação mobile */}
        <div className="p-4 border-b block md:hidden">
          <Popover open={navOpen} onOpenChange={setNavOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <span className="truncate">
                  {(['perfil','interesse','troca','financiamento','visita','documentos'] as const)
                    .includes(activeSection as any)
                    ? ([
                        { id: 'perfil', label: 'Perfil'},
                        { id: 'interesse', label: 'Interesses'},
                        { id: 'troca', label: 'Troca'},
                        { id: 'financiamento', label: 'Financiamento'},
                        { id: 'visita', label: 'Visita'},
                        { id: 'documentos', label: 'Documentos'},
                      ].find(s => s.id === activeSection)?.label)
                    : 'Navegar...'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <ScrollArea className="h-48">
                {[
                  { id: 'perfil', label: 'Perfil', icon: User2 },
                  { id: 'interesse', label: 'Interesses', icon: Search },
                  ...( (formData?.bot_data?.deal_type === 'troca') ? [{ id: 'troca', label: 'Troca', icon: ChevronRight }] : []),
                  ...( (formData?.bot_data?.deal_type === 'financiamento' || formData?.bot_data?.payment_method === 'financiamento') ? [{ id: 'financiamento', label: 'Financiamento', icon: ChevronRight }] : []),
                  ...( (formData?.bot_data?.deal_type === 'visita') ? [{ id: 'visita', label: 'Visita', icon: CalendarDays }] : []),
                  { id: 'documentos', label: 'Documentos', icon: FileText },
                ].map((section:any) => (
                  <div
                    key={section.id}
                    className="p-2 hover:bg-accent cursor-pointer text-sm flex items-center gap-2"
                    onClick={() => {
                      setActiveSection(section.id);
                      setNavOpen(false);
                    }}
                  >
                    <section.icon className="h-4 w-4" />
                    <span>{section.label}</span>
                  </div>
                ))}
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 flex min-h-0">
          <aside className="border-r bg-muted/30 hidden md:block w-[260px] flex-shrink-0">
            <ScrollArea className="h-full py-4">
              <nav className="px-4 space-y-1">
                {[
                  { id: 'perfil', label: 'Perfil', icon: User2, show: true },
                  { id: 'interesse', label: 'Interesses', icon: Search, show: true },
                  { id: 'troca', label: 'Troca', icon: ChevronRight, show: formData?.bot_data?.deal_type === 'troca' },
                  { id: 'financiamento', label: 'Financiamento', icon: ChevronRight, show: (formData?.bot_data?.deal_type === 'financiamento' || formData?.bot_data?.payment_method === 'financiamento') },
                  { id: 'visita', label: 'Visita', icon: CalendarDays, show: formData?.bot_data?.deal_type === 'visita' },
                  { id: 'documentos', label: 'Documentos', icon: FileText, show: true },
                ].filter(s=>s.show).map((section:any) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon className="mr-2 h-4 w-4" />
                    {section.label}
                  </Button>
                ))}
              </nav>
            </ScrollArea>
          </aside>

          <main className="flex-1 min-w-0 bg-white">
            <ScrollArea className="h-full">
              {/* faixa sutil */}
              <div className="h-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 opacity-60" />
              <div className="p-6 space-y-6">{renderSectionContent(activeSection)}</div>
            </ScrollArea>
          </main>
        </div>

        {/* Conteúdo oculto p/ PDF (sem Documentos) */}
        <div
          ref={pdfInfoRef}
          className="absolute -left-[9999px] top-0 bg-white space-y-8 p-8 w-[820px] text-black"
        >
          {/* cabeçalho interno das seções com divisórias “clean” */}
          {['perfil','interesse','troca','financiamento','visita']
            .filter((s) => s !== 'troca' ? true : (formData?.bot_data?.deal_type === 'troca'))
            .filter((s) => s !== 'financiamento' ? true : (formData?.bot_data?.deal_type === 'financiamento' || formData?.bot_data?.payment_method === 'financiamento'))
            .filter((s) => s !== 'visita' ? true : (formData?.bot_data?.deal_type === 'visita'))
            .map((section) => (
              <div key={`pdf-info-${section}`} style={{ breakInside: 'avoid' }}>
                {renderSectionContent(section, true)}
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// -------------------- CRM Kanban (board) --------------------
function CRMKanbanContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeClient, setActiveClient] = useState<any>(null);
  const [detailedClient, setDetailedClient] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Colunas persistidas por loja
  const [kanbanColumns, setKanbanColumns] = useState(() => {
    const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${LOJA_ID_ATUAL}`;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : INITIAL_KANBAN_COLUMNS;
    } catch {
      return INITIAL_KANBAN_COLUMNS;
    }
  });
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [isManagingColumns, setIsManagingColumns] = useState(false);

  // Slider de scroll horizontal
  const [scrollProgress, setScrollProgress] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const newColumnNameRef = useRef('');

  useEffect(() => {
    const storageKey = `${LOCAL_STORAGE_KEY_PREFIX}${LOJA_ID_ATUAL}`;
    localStorage.setItem(storageKey, JSON.stringify(kanbanColumns));
  }, [kanbanColumns]);

  const handleCreateColumn = (name: string) => {
    if (!name.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da coluna não pode ser vazio.',
        variant: 'destructive',
      });
    } else {
      const newId = `custom_${Date.now()}`;
      const newColumn = {
        id: newId,
        name: name.trim(),
        isDefault: false,
        order: kanbanColumns.length + 1,
      };
      setKanbanColumns((p: any[]) => [...p, newColumn]);
      toast({ title: 'Sucesso', description: `Coluna '${newColumn.name}' criada.` });
    }
  };

  const handleUpdateColumnName = (columnId: string, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da coluna não pode ser vazio.',
        variant: 'destructive',
      });
      return;
    }
    setKanbanColumns((prev: any[]) =>
      prev.map((c) => (c.id === columnId ? { ...c, name: newName.trim() } : c)),
    );
    toast({ title: 'Sucesso', description: `Nome atualizado para '${newName.trim()}'` });
  };

  const handleDeleteColumn = (columnId: string) => {
    const columnToDelete = kanbanColumns.find((c: any) => c.id === columnId);
    if (columnToDelete && columnToDelete.isDefault && columnToDelete.id === kanbanColumns[0].id) {
      toast({
        title: 'Ação Bloqueada',
        description: "A primeira coluna ('Novo Lead') não pode ser excluída.",
        variant: 'destructive',
      });
      return;
    }

    const columnsAfter = kanbanColumns.filter((c: any) => c.id !== columnId);
    const fallbackColumnId = columnsAfter[0]?.id;
    if (!fallbackColumnId) {
      toast({
        title: 'Erro',
        description: 'Não é possível excluir a última coluna restante.',
        variant: 'destructive',
      });
      return;
    }

    // move os leads da coluna deletada para a primeira
    queryClient.setQueryData(['clients'], (old: any[]) =>
      (old || []).map((client) => {
        const currentColumnId = getClientColumnId(client.bot_data?.state, kanbanColumns);
        if (currentColumnId === columnId) {
          return produce(client, (draft: any) => {
            draft.state = fallbackColumnId;
            draft.bot_data = draft.bot_data || {};
            draft.bot_data.state = fallbackColumnId;
          });
        }
        return client;
      }),
    );

    setKanbanColumns(columnsAfter);
    toast({
      title: 'Sucesso',
      description: 'Coluna excluída e leads movidos para a primeira etapa.',
    });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };

  // Sensores DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  // Fetch de clientes
  const {
    data: clients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    refetchInterval: 10000,
    initialData: [],
  });

  // Slider progress
  const handleScroll = () => {
    if (boardRef.current && !isDraggingSlider) {
      const { scrollLeft, scrollWidth, clientWidth } = boardRef.current;
      if (scrollWidth > clientWidth) {
        const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
        setScrollProgress(progress);
      } else setScrollProgress(0);
    }
  };
  const handleSliderMove = (clientX: number) => {
    if (!isDraggingSlider || !boardRef.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const width = rect.width;
    let progress = (relX / width) * 100;
    progress = Math.min(100, Math.max(0, progress));
    setScrollProgress(progress);
    const { scrollWidth, clientWidth } = boardRef.current;
    const maxScroll = scrollWidth - clientWidth;
    boardRef.current.scrollLeft = (progress / 100) * maxScroll;
  };
  const handleSliderStart = (clientX: number) => {
    setIsDraggingSlider(true);
    handleSliderMove(clientX);
  };
  const handleSliderEnd = () => setIsDraggingSlider(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleSliderMove(e.clientX);
    const onMouseUp = handleSliderEnd;
    const onTouchMove = (e: TouchEvent) => handleSliderMove(e.touches[0].clientX);
    const onTouchEnd = handleSliderEnd;
    if (isDraggingSlider) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDraggingSlider]);

  useEffect(() => {
    const el = boardRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [kanbanColumns.length, searchTerm, isDraggingSlider]);

  // Mutations
  const { mutate: mutateStatus } = useMutation({
    mutationFn: updateClientStatus,
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Cliente movido.' });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err: any) =>
      toast({ title: 'Erro', description: err?.message || 'Falha ao mover.', variant: 'destructive' }),
  });

  const updateDetailsMutation = useMutation({
    mutationFn: updateClientDetails,
    onSuccess: async () => {
      toast({ title: 'Sucesso!', description: 'Dados do cliente atualizados.' });
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (err: any) =>
      toast({ title: 'Erro ao Salvar', description: err?.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: (chatId: string) => {
      toast({ title: 'Sucesso', description: 'Cliente deletado.' });
      queryClient.setQueryData(['clients'], (old: any[]) =>
        old?.filter((c) => c.chat_id !== chatId),
      );
      if (detailedClient?.chat_id === chatId) setDetailedClient(null);
    },
    onError: (err: any) =>
      toast({ title: 'Erro', description: err?.message, variant: 'destructive' }),
  });

  // Filtro
  const filteredClients = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return clients;

    const getVehicleName = (client: any) => {
      if (!client.bot_data?.interested_vehicles) return '';
      try {
        const vehicles =
          typeof client.bot_data.interested_vehicles === 'string'
            ? JSON.parse(client.bot_data.interested_vehicles)
            : client.bot_data.interested_vehicles;
        if (!Array.isArray(vehicles) || vehicles.length === 0) return '';
        return vehicles[0]?.nome?.toLowerCase() || '';
      } catch {
        return '';
      }
    };

    return clients.filter((c: any) => {
      const nameMatch = (c.name?.toLowerCase() || '').includes(q);
      const vehicleMatch = getVehicleName(c).includes(q);
      return nameMatch || vehicleMatch;
    });
  }, [clients, searchTerm]);

  // Data por coluna
  const columns = useMemo(() => {
    const buckets: Record<string, any[]> = Object.fromEntries(
      kanbanColumns.map((c: any) => [c.id, []]),
    );
    filteredClients.forEach((client: any) => {
      const colId = getClientColumnId(client.bot_data?.state, kanbanColumns);
      (buckets[colId] = buckets[colId] || []).push(client);
    });
    return kanbanColumns
      .map((c: any) => ({ ...c, clients: buckets[c.id] || [] }))
      .filter((c: any) => (searchTerm.trim() === '' ? true : c.clients.length > 0));
  }, [filteredClients, searchTerm, kanbanColumns]);

  // Drag start/end
  function handleDragStart(event: any) {
    const client = filteredClients.find((c: any) => c.chat_id === event.active.id);
    setActiveClient(client || null);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveClient(null);
    if (!over) return;

    const activeClientId = active.id;
    const activeClientData = clients.find((c: any) => c.chat_id === activeClientId);

    let destColumnId: string | null = null;
    const overId = String(over.id);

    const overClient = clients.find((c: any) => c.chat_id === overId);
    if (overClient) {
      destColumnId = getClientColumnId(overClient.bot_data?.state, kanbanColumns);
    } else {
      const isColumn = kanbanColumns.some((c: any) => c.id === overId);
      if (isColumn) {
        destColumnId = overId;
      } else {
        const containerId = over.data?.current?.sortable?.containerId;
        if (kanbanColumns.some((c: any) => c.id === containerId)) {
          destColumnId = containerId;
        }
      }
    }

    const sourceColumnId = getClientColumnId(activeClientData?.bot_data?.state, kanbanColumns);

    if (destColumnId && sourceColumnId !== destColumnId) {
      mutateStatus({ chatId: activeClientId, newState: destColumnId });
    }
  }

  const handleConfirmDelete = () => {
    if (clientToDelete) deleteMutation.mutate(clientToDelete);
    setClientToDelete(null);
  };

  if (isLoading)
    return (
      <div className="p-6">
        <Loader2 className="h-6 w-6 animate-spin mr-2 inline-block" /> Carregando CRM...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-destructive">
        <AlertTriangle className="h-5 w-5 mr-2 inline-block" /> Erro ao carregar dados
      </div>
    );

  return (
    <>
      <div className="space-y-6 p-4 md:p-6 h-screen overflow-y-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">CRM – Funil de Vendas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Organize, avance e conclua negócios com mais rapidez.
            </p>
          </div>
          <Badge className="text-sm px-3 py-1 rounded-full">
            {Array.isArray(clients) ? clients.length : 0} leads
          </Badge>
        </div>

        <div className="flex justify-between items-center gap-2">
          <div className="relative max-w-md flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar clientes ou nome do carro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus-visible:ring-amber-500/20"
            />
          </div>

          <Button onClick={() => setIsManagingColumns(true)} variant="outline" className="flex-shrink-0">
            <Settings className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Gerenciar Colunas</span>
          </Button>
        </div>

        {/* Slider de rolagem horizontal */}
        <div
          ref={sliderRef}
          className="relative w-full h-2 bg-gradient-to-r from-zinc-200 to-zinc-100 rounded-full mt-2 cursor-pointer"
          onMouseDown={(e) => handleSliderStart(e.clientX)}
          onTouchStart={(e) => handleSliderStart(e.touches[0].clientX)}
        >
          <div
            className="absolute top-0 left-0 h-full bg-amber-500/70 rounded-full transition-all duration-100 ease-linear pointer-events-none"
            style={{ width: `${scrollProgress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-amber-600 rounded-full shadow-md z-10 cursor-grab active:scale-95 transition-transform"
            style={{ left: `calc(${scrollProgress}% - 8px)` }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleSliderStart(e.clientX);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleSliderStart(e.touches[0].clientX);
            }}
          />
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={(e)=> {
            const client = filteredClients.find((c: any) => c.chat_id === e.active.id);
            setActiveClient(client || null);
          }}
          onDragEnd={(e)=> {
            const { active, over } = e;
            setActiveClient(null);
            if (!over) return;
            const activeClientId = active.id;
            const overId = String(over.id);
            const overClient = clients.find((c: any) => c.chat_id === overId);
            let destColumnId: string | null = null;
            if (overClient) {
              destColumnId = getClientColumnId(overClient.bot_data?.state, kanbanColumns);
            } else if (kanbanColumns.some((c: any) => c.id === overId)) {
              destColumnId = overId;
            } else {
              const containerId = over.data?.current?.sortable?.containerId;
              if (kanbanColumns.some((c: any) => c.id === containerId)) destColumnId = containerId;
            }
            const activeClientData = clients.find((c: any) => c.chat_id === activeClientId);
            const sourceColumnId = getClientColumnId(activeClientData?.bot_data?.state, kanbanColumns);
            if (destColumnId && sourceColumnId !== destColumnId) {
              mutateStatus({ chatId: activeClientId, newState: destColumnId });
            }
          }}
          collisionDetection={closestCenter}
        >
          <div
            ref={boardRef}
            className="w-full overflow-x-auto pb-4 scroll-smooth [mask-image:linear-gradient(to right,transparent,black_8%,black_92%,transparent)]"
          >
            <div className="flex flex-nowrap gap-4 md:gap-6 items-start h-full">
              {columns.length > 0 ? (
                columns.map((column: any) => {
                  const isImmutable = column.isDefault && column.id === kanbanColumns[0].id;
                  return (
                    <KanbanColumn
                      key={column.id}
                      column={column}
                      isImmutable={isImmutable}
                      onEditClick={() => setEditingColumnId(column.id)}
                      onRef={(el) => (columnRefs.current[column.id] = el)}
                    >
                      <SortableContext
                        id={column.id}
                        items={column.clients.map((c: any) => c.chat_id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {column.clients.map((client: any) => (
                          <ClientCard
                            key={client.chat_id}
                            client={client}
                            onDelete={(chatId) => setClientToDelete(chatId)}
                            onViewDetails={() => setDetailedClient(client)}
                          />
                        ))}
                      </SortableContext>
                    </KanbanColumn>
                  );
                })
              ) : (
                <div className="w-full text-center text-sm text-muted-foreground">
                  Nenhuma coluna ou cliente encontrado para &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeClient ? (
              <ClientCard client={activeClient} onDelete={() => {}} onViewDetails={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modal de detalhes premium */}
      {detailedClient && (
        <ClientDetailDialog
          client={detailedClient}
          isOpen={!!detailedClient}
          onOpenChange={(o) => !o && setDetailedClient(null)}
          updateMutation={updateDetailsMutation}
          customColumns={kanbanColumns}
        />
      )}

      {/* Confirmação de Delete */}
      <Dialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gerenciador de Colunas */}
      <Dialog open={isManagingColumns} onOpenChange={setIsManagingColumns}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" /> Gerenciar Colunas
            </DialogTitle>
            <DialogDescription>
              Crie novas etapas ou organize as colunas do seu funil de vendas. A coluna &quot;Novo
              Lead&quot; não pode ser excluída.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2 border-b pb-2">
              <Layers className="h-4 w-4" /> Criar Nova Coluna
            </h4>
            <div className="flex gap-2">
              <Input
                id="new-column-name"
                placeholder="Nome da nova coluna"
                onChange={(e) => (newColumnNameRef.current = e.target.value)}
              />
              <Button
                onClick={() => {
                  handleCreateColumn(newColumnNameRef.current);
                  const el = document.getElementById('new-column-name') as HTMLInputElement | null;
                  if (el) el.value = '';
                  newColumnNameRef.current = '';
                }}
              >
                Criar
              </Button>
            </div>

            <h4 className="font-semibold">Colunas Atuais</h4>
            <ScrollArea className="h-40 border rounded-md p-2">
              {kanbanColumns.map((col: any) => {
                const isImmutable = col.isDefault && col.id === kanbanColumns[0].id;
                const isEditingName = editingColumnId === col.id;
                return (
                  <div
                    key={col.id}
                    className="flex items-center justify-between p-2 border-b last:border-b-0 gap-2"
                  >
                    {isEditingName ? (
                      <Input
                        defaultValue={col.name}
                        onBlur={(e) => {
                          handleUpdateColumnName(col.id, e.target.value);
                          setEditingColumnId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        }}
                        autoFocus
                        className="h-8 text-sm md:text-base font-semibold"
                      />
                    ) : (
                      <span className="truncate">{col.name}</span>
                    )}

                    {isImmutable ? (
                      <Badge variant="outline">Padrão</Badge>
                    ) : isEditingName ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingColumnId(null)}
                      >
                        Cancelar
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingColumnId(col.id)}
                        >
                          Renomear
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteColumn(col.id)}
                        >
                          <Trash2 className="h-3 w-3" /> Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManagingColumns(false)}>
              Fechar
            </Button>
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
