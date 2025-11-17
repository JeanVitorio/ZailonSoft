// src/components/CRMKanban.tsx
// Kanban + Modal Premium + PDF (design do Dashboard)
// Requisitos: react, @tanstack/react-query, dnd-kit, shadcn/ui, lucide-react, html2canvas, jspdf
// APIs esperadas: fetchClients, updateClientStatus, updateClientDetails, deleteClient
// Opcional (caso use fallback de imagens de troca via BD/API): endpoint GET /api/trade-car-images?chatId=...
import React, {
  useEffect,
  useMemo,
  useReducer,
  useState,
  useContext,
  useRef,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// --- UI (shadcn) ---
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Edit,
  Loader2,
  MessageSquare,
  MoveRight,
  Phone,
  Search,
  ThumbsDown,
  User2,
  X,
  Link2,
  Flag,
  FileDown,
  FileText,
  FolderOpenDot,
  Images,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
// --- PDF ---
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// --- API (seu projeto) ---
import {
  fetchClients,
  updateClientStatus,
  updateClientDetails,
  deleteClient,
} from "@/services/api";

// =========================== Toast (Estilo Dashboard) ===========================
const ToastContext = React.createContext<any>(null);

function toastReducer(state: any[], action: any) {
  switch (action.type) {
    case "ADD_TOAST":
      return [...state, action.payload];
    case "REMOVE_TOAST":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

const Toaster = ({ toasts, dispatch }: { toasts: any[]; dispatch: any }) => {
  const variantClasses: Record<string, string> = {
    default: "bg-slate-800 text-slate-100 border border-slate-700",
    destructive: "bg-red-500/15 text-red-300 border border-red-500/30",
    success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  };
  return (
    <div className="fixed bottom-0 right-0 p-6 space-y-2 z-[100]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg flex items-start gap-4 w-80 md:w-96 ${
            variantClasses[toast.variant || "default"]
          }`}
        >
          <div className="flex-grow">
            {toast.title && <h3 className="font-semibold">{toast.title}</h3>}
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dispatch({ type: "REMOVE_TOAST", id: toast.id })}
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
  if (!dispatch) throw new Error("useToast must be used within a ToastProvider");
  return {
    toast: ({
      title,
      description,
      variant = "default",
      duration = 5000,
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive" | "success";
      duration?: number;
    }) => {
      const id = Date.now();
      dispatch({ type: "ADD_TOAST", payload: { id, title, description, variant } });
      setTimeout(() => dispatch({ type: "REMOVE_TOAST", id }), duration);
    },
  };
};

// =========================== Utils ===========================
function parsePrice(value: any): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value ?? "").trim();
  if (!s) return 0;
  const brlLike = s
    .replace(/\s+/g, "")
    .replace(/R\$\s?/gi, "")
    .replace(/\./g, "")
    .replace(/,/, ".");
  const n = Number(brlLike);
  if (Number.isFinite(n)) return n;
  const digits = s.replace(/\D+/g, "");
  return digits ? (digits.length >= 3 ? Number(digits) / 100 : Number(digits)) : 0;
}

const toBRL = (value: any) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    parsePrice(value)
  );

function fmtDateTime(d?: string | Date | null) {
  const date = typeof d === "string" ? new Date(d) : d;
  if (!date) return "N/A";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "N/A";
  }
}

function priorityBadge(p?: string | null) {
  const val = (p || "normal").toLowerCase();
  if (val === "alta")
    return <Badge className="bg-red-600 text-white">Alta</Badge>;
  if (val === "baixa")
    return <Badge className="bg-slate-700 text-slate-200">Baixa</Badge>;
  return <Badge className="bg-amber-500 text-white">Normal</Badge>;
}

function interestedVehicleFromBot(bot_data: any) {
  try {
    const vehicles =
      typeof bot_data?.interested_vehicles === "string"
        ? JSON.parse(bot_data.interested_vehicles)
        : bot_data?.interested_vehicles;
    if (Array.isArray(vehicles) && vehicles.length) {
      const v = vehicles[0];
      return `${v?.nome || "Veículo"} ${v?.ano ? `(${v.ano})` : ""}`.trim();
    }
  } catch {}
  return "—";
}

// =========================== Colunas & migração ===========================
const KANBAN_SCHEMA_VERSION = 3;
const COLUNAS_FOCO_EM_MARCOS = [
  { id: "novo_lead", name: "Novo Lead", isDefault: true, order: 1 },
  { id: "em_contato", name: "Em Contato", isDefault: false, order: 2 },
  { id: "qualificado", name: "Qualificado", isDefault: false, order: 3 },
  { id: "proposta_enviada", name: "Proposta Enviada", isDefault: false, order: 4 },
  { id: "negociacao_final", name: "Negociação Final", isDefault: false, order: 5 },
  { id: "vendido", name: "Vendido", isDefault: false, order: 6 },
  { id: "perdido", name: "Perdido", isDefault: false, order: 7 },
];
const LOJA_ID_ATUAL = "loja_default";
const LOCAL_STORAGE_KEY_PREFIX = "kanban_columns_";
const LOCAL_STORAGE_META_PREFIX = "kanban_meta_";

function normalizaEstadoParaColuna(value?: string | null): string {
  const s = String(value || "").trim().toLowerCase();
  if (!s || s === "inicial" || s === "leed_recebido") return "novo_lead";
  const valid = new Set(COLUNAS_FOCO_EM_MARCOS.map((c) => c.id));
  return valid.has(s) ? s : "novo_lead";
}

// =========================== Helpers de negócio ===========================
function dealType(
  bot_data: any
): "troca" | "financiamento" | "à vista" | "visita" | "—" {
  const txt = (s?: string) => String(s || "").toLowerCase();
  const deal = txt(bot_data?.deal_type);
  const pay = txt(bot_data?.payment_method);
  const visit = bot_data?.visit_details || {};
  const hasTrade =
    !!bot_data?.trade_in_car &&
    (Array.isArray(bot_data.trade_in_car?.imagens) ||
      Array.isArray(bot_data.trade_in_car?.images) ||
      Array.isArray(bot_data.trade_in_car?.photos) ||
      bot_data.trade_in_car?.modelo ||
      bot_data.trade_in_car?.descricao);
  if (hasTrade || deal.includes("troca") || pay.includes("troca")) return "troca";
  if (deal.includes("financ") || pay.includes("financ") || pay.includes("parcel"))
    return "financiamento";
  if (
    deal.includes("vista") ||
    pay.includes("vista") ||
    pay.includes("pix") ||
    pay.includes("dinheiro")
  )
    return "à vista";
  if (visit?.day || visit?.time) return "visita";
  return "—";
}

function tradeImagesFromBot(bot_data: any): string[] {
  const t = bot_data?.trade_in_car || {};
  const imgs: string[] = []
    .concat(
      Array.isArray(t?.imagens) ? t.imagens : [],
      Array.isArray(t?.images) ? t.images : [],
      Array.isArray(t?.photos) ? t.photos : []
    )
    .filter((u) => typeof u === "string" && /^https?:\/\//.test(u));
  return imgs;
}

// =========================== Hook: buscar imagens do veículo de troca ===========================
// Tenta (1) bot_data.trade_in_car, (2) API fallback /api/trade-car-images?chatId=...
function useTradeCarImages(client: any) {
  const chatId = client?.chat_id;
  const bot = client?.bot_data || {};
  const localImgs = tradeImagesFromBot(bot);
  const enabled = !!chatId && localImgs.length === 0;
  const { data, isFetching, error } = useQuery({
    queryKey: ["trade-car-images", chatId],
    enabled,
    queryFn: async () => {
      try {
        const res = await fetch(
          `/api/trade-car-images?chatId=${encodeURIComponent(chatId)}`
        );
        if (!res.ok) throw new Error("Falha ao buscar imagens de troca");
        const json = await res.json();
        // Esperado: { images: string[] }
        const arr = Array.isArray(json?.images) ? json.images : [];
        return arr.filter(
          (u: any) => typeof u === "string" && /^https?:\/\//.test(u)
        );
      } catch (err) {
        console.error("Error fetching trade images:", err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
  if (error) console.warn("Trade images fetch error for chatId", chatId, error);
  const merged = localImgs.length ? localImgs : data || [];
  return { images: merged, isFetching };
}

// =========================== Card Arrastável (Estilo Dashboard) ===========================
function SortableCard({
  client,
  onOpen,
  onDelete,
}: {
  client: any;
  onOpen: () => void;
  onDelete: (chatId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: client.chat_id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 0,
    touchAction: "none",
  };
  const tipo = dealType(client.bot_data);
  // Use the hook to fetch if local missing (fix for new version)
  const { images: imgsTroca, isFetching } = useTradeCarImages(client);
  const vehicle = interestedVehicleFromBot(client.bot_data);
  const seller = client.owner || "—";
  const tipoBadge = (
    <Badge
      variant="default"
      className="bg-slate-800/90 text-slate-300 border-slate-700 text-[10px]"
    >
      <MessageSquare className="h-3 w-3 mr-1" />
      {tipo.toUpperCase()}
    </Badge>
  );
  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-slate-900/80 border border-slate-800 shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-slate-50 truncate">
                {client.name || "Sem nome"}
              </h4>
              {priorityBadge(client.priority)}
            </div>
            <p className="text-xs text-slate-400 truncate">{vehicle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="default"
                className="bg-slate-800/90 text-slate-300 border-slate-700 text-[10px]"
              >
                <User2 className="h-3 w-3 mr-1" /> {seller}
              </Badge>
              {tipoBadge}
              {client.channel ? (
                <Badge
                  variant="default"
                  className="bg-slate-800/90 text-slate-300 border-slate-700 text-[10px]"
                >
                  <MessageSquare className="h-3 w-3 mr-1" /> {client.channel}
                </Badge>
              ) : null}
            </div>
            {tipo === "troca" && (
              <div className="mt-2 flex gap-1.5">
                {isFetching ? (
                  <Loader2 className="h-10 w-10 animate-spin text-slate-500" />
                ) : imgsTroca.length > 0 ? (
                  imgsTroca.slice(0, 4).map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      title="Imagem do veículo de troca"
                      className="block w-10 h-10 rounded border border-slate-700 overflow-hidden"
                    >
                      <img src={src} className="w-full h-full object-cover" />
                    </a>
                  ))
                ) : null}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              {...listeners}
              title="Arrastar"
            >
              <MoveRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100"
                onClick={onOpen}
                title="Abrir"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500/70 hover:bg-red-500/10 hover:text-red-500"
                onClick={() => onDelete(client.chat_id)}
                title="Excluir"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =========================== Coluna (droppable) (Estilo Dashboard) ===========================
function Column({
  columnId,
  name,
  items,
  onOpen,
  onDelete,
}: {
  columnId: string;
  name: string;
  items: any[];
  onOpen: (c: any) => void;
  onDelete: (chatId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  return (
    <div className="w-80 flex-shrink-0">
      <div
        ref={setNodeRef}
        className={`rounded-2xl p-4 h-[calc(100vh-16rem)] flex flex-col transition-colors ${
          isOver
            ? "bg-emerald-500/5 border border-emerald-500/30"
            : "bg-slate-900/70 border border-slate-800/50"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-slate-100">{name}</h3>
          <Badge
            variant="default"
            className="bg-slate-800 text-slate-200"
          >
            {items.length}
          </Badge>
        </div>
        <ScrollArea className="flex-1 pr-2">
          <SortableContext
            id={columnId}
            items={items.map((c) => c.chat_id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((c) => (
                <SortableCard
                  key={c.chat_id}
                  client={c}
                  onOpen={() => onOpen(c)}
                  onDelete={onDelete}
                />
              ))}
              {items.length === 0 && (
                <div className="h-[100px] border-2 border-dashed border-slate-700 rounded-lg text-sm text-slate-500 grid place-items-center">
                  Solte aqui
                </div>
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </div>
    </div>
  );
}

// =========================== PDF Components (Branding Dashboard) ===========================
// *Nota: PDFs mantêm fundo branco para impressão, mas usam a paleta de acentos do dashboard (emerald/cyan)*
function normalizeClientForPdf(client: any) {
  const c = { ...client };
  try {
    if (c?.bot_data?.interested_vehicles && typeof c.bot_data.interested_vehicles === "string") {
      c.bot_data.interested_vehicles = JSON.parse(c.bot_data.interested_vehicles);
    }
    if (typeof c?.bot_data?.trade_in_car === "string" && c.bot_data.trade_in_car.trim()) {
      c.bot_data.trade_in_car = JSON.parse(c.bot_data.trade_in_car);
    }
    if (typeof c?.bot_data?.financing_details === "string" && c.bot_data.financing_details.trim()) {
      c.bot_data.financing_details = JSON.parse(c.bot_data.financing_details);
    }
    if (typeof c?.bot_data?.visit_details === "string" && c.bot_data.visit_details.trim()) {
      c.bot_data.visit_details = JSON.parse(c.bot_data.visit_details);
    }
    if (typeof c?.documents === "string" && c.documents.trim()) {
      c.documents = JSON.parse(c.documents);
    }
    if (typeof c?.trade_in_car === "string" && c.trade_in_car.trim()) {
      c.trade_in_car = JSON.parse(c.trade_in_car);
    }
  } catch {}
  return c;
}

function initialsFromName(name?: string) {
  return (
    (name || "")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CL"
  );
}

// ---------- Página 1: PDF Main (tudo MENOS Negociação) ----------
function PdfMain({ client, externalTradeImages }: { client: any; externalTradeImages: string[] }) {
  const normalized = React.useMemo(() => normalizeClientForPdf(client), [client]);
  const bot = normalized?.bot_data || {};
  const interested = interestedVehicleFromBot(bot);
  const interestedVehicles: any[] = Array.isArray(bot?.interested_vehicles)
    ? bot.interested_vehicles
    : [];
  const chosen = interestedVehicles?.length ? interestedVehicles[0] : null;
  const chosenTitle = chosen?.nome ?? chosen?.name ?? null;
  const chosenYear = chosen?.ano ?? chosen?.year ?? null;
  const chosenPrice = chosen?.preco ?? chosen?.price ?? null;
  const chosenImgs: string[] = (chosen?.imagens ?? chosen?.images ?? []) as string[];
  const chosenImg0 =
    (chosenImgs && chosenImgs[0]) ||
    "https://placehold.co/600x400/f3f4f6/9ca3af?text=Sem+Foto";
  
  // Arquivos/Imagens (incluindo imagens do veículo de troca)
  const documents = Array.isArray(normalized?.documents) ? normalized?.documents : [];
  const tradeImages =
    externalTradeImages && externalTradeImages.length
      ? externalTradeImages
      : (normalized?.bot_data?.trade_in_car?.imagens ||
          normalized?.bot_data?.trade_in_car?.images ||
          []) || [];
  const allImages: { src: string; label: string }[] = [];
  if (normalized?.rg_photo) allImages.push({ src: normalized.rg_photo, label: "Foto RG" });
  if (normalized?.incomeProof) allImages.push({ src: normalized.incomeProof, label: "Comprovante Renda" });
  (documents || []).forEach((doc: string, i: number) => {
    if (doc) allImages.push({ src: doc, label: `Documento ${i + 1}` });
  });
  (tradeImages || []).forEach((img: string, i: number) => {
    if (img) allImages.push({ src: img, label: `Imagem Troca ${i + 1}` });
  });

  const initials = initialsFromName(normalized?.name);

  return (
    <div
      id="pdf-main"
      className="w-[794px] bg-white text-gray-900 font-sans text-base leading-relaxed antialiased"
    >
      {/* Topbar (Dashboard Style) */}
      <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400" />
      
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold leading-tight">
                Ficha do Cliente: {normalized?.name || "Cliente"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Gerado em {fmtDateTime(new Date())}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Body */}
      <div className="px-8 pb-8 space-y-8">
        {/* Dados do Cliente */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2 rounded-t-lg">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-lg">Dados do Cliente</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Nome</p>
              <p className="mt-1">{normalized?.name || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Telefone</p>
              <p className="mt-1">{normalized?.phone || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">CPF</p>
              <p className="mt-1">{normalized?.cpf || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Ocupação</p>
              <p className="mt-1">{normalized?.job || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Vendedor</p>
              <p className="mt-1">{normalized?.owner || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Visita</p>
              <p className="mt-1">
                {normalized?.appointment_at ? fmtDateTime(normalized.appointment_at) : "—"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Resumo do Interesse */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2 rounded-t-lg">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-lg">Resumo do Interesse</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Interesse</p>
              <p className="mt-1">{interested}</p>
            </div>
          </div>
          {chosenTitle && (
            <div className="px-6 pb-6">
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <div className="grid md:grid-cols-2">
                  <div className="h-48 bg-gray-50 flex items-center justify-center">
                    <img
                      src={chosenImg0}
                      alt={chosenTitle}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <h4 className="font-bold text-xl leading-tight text-gray-900">{chosenTitle}</h4>
                    <p className="text-base text-gray-600 flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" /> {chosenYear ?? "—"}
                    </p>
                    {chosenPrice != null && (
                      <p className="text-2xl font-bold text-emerald-600">{toBRL(chosenPrice)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Observações */}
        {(normalized?.notes || normalized?.report) && (
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2 rounded-t-lg">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-lg">Observações</h3>
            </div>
            <div className="p-6 text-sm space-y-6">
              {normalized?.notes && (
                <div>
                  <p className="text-gray-500 font-medium mb-2">Notas (interno)</p>
                  <p className="whitespace-pre-wrap break-words">{normalized.notes}</p>
                </div>
              )}
              {normalized?.report && (
                <div>
                  <p className="text-gray-500 font-medium mb-2">Relatório</p>
                  <p className="whitespace-pre-wrap break-words">{normalized.report}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-8 pb-8 pt-4 text-sm text-gray-500 border-t border-gray-200">
        Documento gerado automaticamente pelo CRM • {new Date().getFullYear()}
      </div>
    </div>
  );
}

// ---------- Página 2: PDF Negotiation (apenas Negociação) ----------
function PdfNegotiation({
  client,
  externalTradeImages,
}: {
  client: any;
  externalTradeImages: string[];
}) {
  const normalized = React.useMemo(() => normalizeClientForPdf(client), [client]);
  const bot = normalized?.bot_data || {};
  const tipo = dealType(bot);
  const tradeInCar = bot?.trade_in_car || normalized?.trade_in_car || {};
  const financingDetails = bot?.financing_details || {};
  const visitDetails = bot?.visit_details || {};
  const chosenTradeImages =
    (externalTradeImages && externalTradeImages.length ? externalTradeImages : []) ||
    (tradeInCar?.imagens || tradeInCar?.images || []);
  
  const tradeModel = tradeInCar?.modelo ?? tradeInCar?.model ?? null;
  const tradeYear = tradeInCar?.ano ?? tradeInCar?.year ?? null;
  const tradePrice = tradeInCar?.valor ?? tradeInCar?.value ?? null;
  const tradeImg0 =
    (Array.isArray(chosenTradeImages) && chosenTradeImages[0]) ||
    "https://placehold.co/600x400/f3f4f6/9ca3af?text=Sem+Foto";
  const tradeTitle = tradeModel ? `${tradeModel} (${tradeYear ?? "—"})` : null;
  const initials = initialsFromName(normalized?.name);

  return (
    <div
      id="pdf-negociacao"
      className="w-[794px] bg-white text-gray-900 font-sans text-base leading-relaxed antialiased"
    >
      {/* Topbar (Dashboard Style) */}
      <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400" />
      
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold leading-tight">Negociação</h1>
              <p className="text-sm text-gray-600 mt-1">
                Cliente: {normalized?.name || "—"} • Gerado em {fmtDateTime(new Date())}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Body (apenas Negociação) */}
      <div className="px-8 pb-8 space-y-8">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2 rounded-t-lg">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-lg">Detalhes da Negociação</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Tipo</p>
              <p className="mt-1">{tipo.toUpperCase()}</p>
            </div>
            {tipo === "visita" && (
              <>
                <div>
                  <p className="text-gray-500 font-medium">Data</p>
                  <p className="mt-1">{visitDetails?.day || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Hora</p>
                  <p className="mt-1">{visitDetails?.time || "—"}</p>
                </div>
              </>
            )}
            {tipo === "troca" && (
              <>
                <div>
                  <p className="text-gray-500 font-medium">Modelo</p>
                  <p className="mt-1">{tradeModel || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Ano</p>
                  <p className="mt-1">{tradeYear || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Valor Desejado</p>
                  <p className="mt-1">{toBRL(tradePrice)}</p>
                </div>
              </>
            )}
            {tipo === "financiamento" && (
              <>
                <div>
                  <p className="text-gray-500 font-medium">Entrada</p>
                  <p className="mt-1">{toBRL(financingDetails?.entry)}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Parcelas</p>
                  <p className="mt-1">{financingDetails?.parcels || "—"}</p>
                </div>
              </>
            )}
          </div>
          
          {/* Vitrine do veículo de troca */}
          {tipo === "troca" && tradeTitle && (
            <div className="px-6 pb-6">
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
                <div className="grid md:grid-cols-2">
                  <div className="h-48 bg-gray-50 flex items-center justify-center">
                    <img
                      src={tradeImg0}
                      alt={tradeTitle}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <h4 className="font-bold text-xl leading-tight text-gray-900">{tradeTitle}</h4>
                    {tradePrice != null && (
                      <p className="text-2xl font-bold text-emerald-600">{toBRL(tradePrice)}</p>
                    )}
                  </div>
                </div>
                {Array.isArray(chosenTradeImages) && chosenTradeImages.length > 1 && (
                  <div className="p-6 border-t border-gray-200">
                    <h5 className="font-semibold text-base mb-4">Outras Imagens do Veículo de Troca</h5>
                    <div className="grid grid-cols-4 gap-4">
                      {chosenTradeImages.slice(1, 5).map((src, i) => (
                        <div key={i} className="rounded-md border overflow-hidden bg-gray-50">
                          <img src={src} className="w-full h-24 object-contain" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-8 pb-8 pt-4 text-sm text-gray-500 border-t border-gray-200">
        Documento gerado automaticamente pelo CRM • {new Date().getFullYear()}
      </div>
    </div>
  );
}

// =========================== Modal (Atendimento) — (Estilo Dashboard) ===========================
const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => {
  if (!children || children === "N/A" || children === "" || (Array.isArray(children) && children.length === 0))
    return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-3 py-2">
      <Label className="text-left md:text-right text-slate-400 text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </Label>
      <div className="col-span-2 text-sm min-w-0 text-slate-100">{children}</div>
    </div>
  );
};

const getNameCat = (c: any) => c?.nome ?? c?.name ?? "";
const getYearCat = (c: any) => c?.ano ?? c?.year ?? "";
const getPriceRawCat = (c: any) => c?.preco ?? c?.price ?? 0;
const getImagesCat = (c: any) => c?.imagens ?? c?.images ?? [];
const formatCurrencyCat = (v: any) => toBRL(v);

function AtendimentoDialog({
  open,
  onOpenChange,
  client,
  onSave,
  onMove,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  client: any;
  onSave: (chatId: string, updated: any) => void;
  onMove: (chatId: string, newState: string) => void;
}) {
  const [data, setData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<"resumo" | "form" | "arquivos" | "troca">("resumo");
  
  // --- PDF refs (duas páginas): Main e Negociação
  const pdfMainRef = useRef<HTMLDivElement>(null);
  const pdfNegRef = useRef<HTMLDivElement>(null);
  
  // Hook de imagens de troca (busca BD/api caso não tenha no bot_data)
  const { images: tradeCarImages, isFetching: isFetchingTradeImages } = useTradeCarImages(client || {});

  const normalizeClient = (raw: any) => {
    const c = { ...raw };
    try {
      if (c.bot_data?.interested_vehicles && typeof c.bot_data.interested_vehicles === "string") {
        c.bot_data.interested_vehicles = JSON.parse(c.bot_data.interested_vehicles);
      }
      if (typeof c.bot_data?.trade_in_car === "string" && c.bot_data.trade_in_car.trim()) {
        c.bot_data.trade_in_car = JSON.parse(c.bot_data.trade_in_car);
      }
      if (typeof c.bot_data?.financing_details === "string" && c.bot_data.financing_details.trim()) {
        c.bot_data.financing_details = JSON.parse(c.bot_data.financing_details);
      }
      if (typeof c.bot_data?.visit_details === "string" && c.bot_data.visit_details.trim()) {
        c.bot_data.visit_details = JSON.parse(c.bot_data.visit_details);
      }
      if (typeof c.documents === "string" && c.documents.trim()) {
        c.documents = JSON.parse(c.documents);
      }
    } catch {}
    return c;
  };

  useEffect(() => {
    if (open && client) {
      setData(
        normalizeClient({
          ...client,
          priority: client?.priority || "normal",
        })
      );
      setTab("resumo");
    }
  }, [open, client]);

  if (!client) return null;

  const set = (path: string, value: any) => {
    setData((prev: any) => {
      const clone = structuredClone(prev);
      const keys = path.split(".");
      let cur = clone;
      for (let i = 0; i < keys.length - 1; i++) cur[keys[i]] = cur[keys[i]] ?? {};
      cur[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const quickWhats = client?.phone
    ? `https://wa.me/55${String(client.phone).replace(/\D/g, "")}`
    : "";

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        owner: data.owner || null,
        priority: data.priority || "normal",
        next_action_at: data.next_action_at || null,
        appointment_at: data.appointment_at || null,
        reservation_expires_at: data.reservation_expires_at || null,
        notes: data.notes || null,
        outcome: data.outcome || null,
        won_reason: data.won_reason || null,
        lost_reason: data.lost_reason || null,
        channel: data.channel || null,
      };
      await onSave(client.chat_id, payload);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  // ===== Exportar PDF (duas páginas: MAIN e NEGOCIAÇÃO EM PÁGINA PRÓPRIA) =====
  const exportClientPDF = useCallback(async () => {
    if (!pdfMainRef.current || !pdfNegRef.current) return;
    try {
      setExporting(true);
      // Helpers
      async function renderCanvas(el: HTMLDivElement) {
        const originalStyle = el.style.cssText;
        el.style.position = "absolute";
        el.style.left = "-10000px";
        el.style.top = "0px";
        el.style.width = "794px";
        el.style.clip = "auto";
        el.style.overflow = "visible";
        el.style.margin = "0";
        el.style.padding = "0";
        el.style.opacity = "1";
        el.style.zIndex = "-1";
        
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: 800,
          windowHeight: Math.max(1200, el.scrollHeight || 1200),
        });
        el.style.cssText = originalStyle;
        return canvas;
      }
      
      // Renderiza páginas
      const mainCanvas = await renderCanvas(pdfMainRef.current);
      const negCanvas = await renderCanvas(pdfNegRef.current);
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth(); // ~210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // ~297mm
      
      // --- Página 1 (MAIN) -> slice se precisar (várias páginas)
      {
        const imgWidthPx = mainCanvas.width;
        const imgHeightPx = mainCanvas.height;
        const ratio = pageWidth / imgWidthPx;
        const sliceHeightPx = Math.floor(pageHeight / ratio);
        let rendered = 0;
        let pageCount = 0;
        const MAX_PAGES = 40;
        const pageCanvas = document.createElement("canvas");
        const ctx = pageCanvas.getContext("2d")!;
        
        while (rendered < imgHeightPx && pageCount < MAX_PAGES) {
          const currentSlice = Math.min(sliceHeightPx, imgHeightPx - rendered);
          pageCanvas.width = imgWidthPx;
          pageCanvas.height = currentSlice;
          ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            mainCanvas,
            0,
            rendered,
            imgWidthPx,
            currentSlice,
            0,
            0,
            imgWidthPx,
            currentSlice
          );
          
          const pdfImgHeight = currentSlice * ratio;
          
          if (pageCount === 0) {
            pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pdfImgHeight);
          } else {
            pdf.addPage();
            pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pdfImgHeight);
          }
          rendered += currentSlice;
          pageCount++;
        }
      }
      
      // --- Página 2 (NEGOCIAÇÃO) -> 1 página única
      {
        pdf.addPage();
        const imgWidthPx = negCanvas.width;
        const imgHeightPx = negCanvas.height;
        // Escalar mantendo proporção para caber em UMA página
        const wRatio = pageWidth / imgWidthPx;
        const hRatio = pageHeight / imgHeightPx;
        const fitRatio = Math.min(wRatio, hRatio);
        const drawWidth = imgWidthPx * fitRatio;
        const drawHeight = imgHeightPx * fitRatio;
        const offsetX = (pageWidth - drawWidth) / 2;
        const offsetY = (pageHeight - drawHeight) / 2;
        
        pdf.addImage(
          negCanvas.toDataURL("image/png"),
          "PNG",
          offsetX,
          offsetY,
          drawWidth,
          drawHeight
        );
      }

      const nameSafe = (client?.name || "Cliente").replace(/[^\p{L}\p{N}\s_-]+/gu, "");
      pdf.save(`Atendimento_${nameSafe}_${new Date().toLocaleDateString("pt-BR")}.pdf`);
    } finally {
      setExporting(false);
    }
  }, [client?.name]);

  const bot = data?.bot_data || {};
  const interestedVehicles: any[] = Array.isArray(bot?.interested_vehicles)
    ? bot.interested_vehicles
    : [];
  const tradeInCar = bot?.trade_in_car || {};
  const financingDetails = bot?.financing_details || {};
  const visitDetails = bot?.visit_details || {};
  const documents = Array.isArray(data?.documents) ? data.documents : [];
  const tipo = dealType(bot);

  // Imagens agregadas (docs + troca)
  const allImages: { src: string; label: string }[] = [];
  if (data?.rg_photo) allImages.push({ src: data.rg_photo, label: "Foto RG" });
  if (data?.incomeProof) allImages.push({ src: data.incomeProof, label: "Comprovante Renda" });
  documents.forEach((doc: string, i: number) => {
    if (doc) allImages.push({ src: doc, label: `Documento ${i + 1}` });
  });
  (tradeCarImages || []).forEach((img: string, i: number) => {
    if (img) allImages.push({ src: img, label: `Imagem Troca ${i + 1}` });
  });

  const initials = initialsFromName(data?.name);
  
  // Vitrine para troca no dialog
  const tradeTitle = tradeInCar?.modelo ? `${tradeInCar.modelo} (${tradeInCar?.ano ?? "—"})` : null;
  const tradePrice = tradeInCar?.valor ?? tradeInCar?.value ?? null;
  const tradeImg0 = tradeCarImages[0] || "https://placehold.co/600x400/f3f4f6/9ca3af?text=Sem+Foto";

  // Dynamic tabs
  const tabsList = [
    { id: "resumo" as const, label: "Resumo", icon: <ClipboardList className="w-3.5 h-3.5 mr-1" /> },
    { id: "form" as const, label: "Formulário", icon: <FileText className="w-3.5 h-3.5 mr-1" /> },
    ...(tipo === "troca" ? [{ id: "troca" as const, label: "Troca", icon: <RefreshCw className="w-3.5 h-3.5 mr-1" /> }] : []),
    { id: "arquivos" as const, label: "Arquivos", icon: <Images className="w-3.5 h-3.5 mr-1" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-screen-lg md:max-w-5xl p-0 overflow-hidden bg-slate-900 border border-slate-800 text-slate-100">
        {/* Header (Dashboard Style) */}
        <div className="relative">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-400" />
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <DialogTitle className="text-lg md:text-xl leading-tight text-slate-50">
                  {data?.name || "Atendimento"}
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm">
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Phone className="h-3.5 w-3.5" />
                    {data?.phone || "—"}
                    {data?.phone && (
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={quickWhats}
                        className="inline-flex items-center gap-1 ml-2 text-emerald-400 hover:underline"
                      >
                        <Link2 className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    )}
                  </span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {priorityBadge(data?.priority)}
              {data?.channel ? (
                <Badge
                  variant="default"
                  className="bg-slate-800/90 text-slate-300 border-slate-700 text-[10px]"
                >
                  {data.channel}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        
        {/* Tabs (Dashboard Style) */}
        <div className="px-5 pt-2">
          <div className="inline-flex rounded-xl border border-slate-700/70 bg-slate-900/70 p-1 text-sm">
            {tabsList.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg inline-flex items-center transition ${
                  tab === t.id
                    ? "bg-emerald-500 text-slate-950 shadow-lg"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
        
        <ScrollArea className="max-h-[65vh] bg-slate-950">
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Resumo */}
            {tab === "resumo" && (
              <>
                {/* Roteiro */}
                <Card className="bg-slate-800/60 border-slate-700/80 text-slate-100">
                  <CardHeader className="py-3 border-b border-slate-700/80">
                    <CardTitle className="text-sm font-semibold text-slate-100">Roteiro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label className="text-xs text-slate-400">Vendedor</Label>
                      <Input
                        className="col-span-2 h-9 bg-slate-900 border-slate-700 text-slate-100 focus:ring-emerald-500"
                        placeholder="Nome do vendedor"
                        value={data.owner || ""}
                        onChange={(e) => set("owner", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label className="text-xs text-slate-400">Prioridade</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="col-span-2 justify-start bg-slate-900 border-slate-700 hover:bg-slate-800"
                          >
                            <Flag className="h-3.5 w-3.5 mr-2" />
                            {(data.priority || "normal").toUpperCase()}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 w-44 bg-slate-900 border-slate-800 text-slate-100">
                          {["alta", "normal", "baixa"].map((p) => (
                            <Button
                              key={p}
                              variant="ghost"
                              className="w-full justify-start hover:bg-slate-800"
                              onClick={() => set("priority", p)}
                            >
                              {p.toUpperCase()}
                            </Button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label className="text-xs text-slate-400">Canal</Label>
                      <Input
                        className="col-span-2 h-9 bg-slate-900 border-slate-700 text-slate-100 focus:ring-emerald-500"
                        placeholder="WhatsApp / Ligação / Instagram / Site..."
                        value={data.channel || ""}
                        onChange={(e) => set("channel", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label className="text-xs text-slate-400">Próx. ação</Label>
                      <Input
                        type="datetime-local"
                        className="col-span-2 h-9 bg-slate-900 border-slate-700 text-slate-100 focus:ring-emerald-500"
                        value={data.next_action_at?.slice(0, 16) || ""}
                        onChange={(e) => set("next_action_at", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label className="text-xs text-slate-400">Visita</Label>
                      <Input
                        type="datetime-local"
                        className="col-span-2 h-9 bg-slate-900 border-slate-700 text-slate-100 focus:ring-emerald-500"
                        value={data.appointment_at?.slice(0, 16) || ""}
                        onChange={(e) => set("appointment_at", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <Label className="text-xs text-slate-400">Reserva até</Label>
                      <Input
                        type="datetime-local"
                        className="col-span-2 h-9 bg-slate-900 border-slate-700 text-slate-100 focus:ring-emerald-500"
                        value={data.reservation_expires_at?.slice(0, 16) || ""}
                        onChange={(e) => set("reservation_expires_at", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Notas */}
                <Card className="bg-slate-800/60 border-slate-700/80 text-slate-100">
                  <CardHeader className="py-3 border-b border-slate-700/80">
                    <CardTitle className="text-sm font-semibold text-slate-100">Notas (interno)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Textarea
                      placeholder="Observações, próximos passos, objeções, etc."
                      value={data.notes || ""}
                      onChange={(e) => set("notes", e.target.value)}
                      className="min-h-[180px] bg-slate-900 border-slate-700 text-slate-100 focus:ring-emerald-500"
                    />
                  </CardContent>
                </Card>
                
                {/* Vitrine (interesse) */}
                {(() => {
                  const chosen =
                    Array.isArray(interestedVehicles) && interestedVehicles.length
                      ? interestedVehicles[0]
                      : null;
                  if (!chosen) return null;
                  const title = getNameCat(chosen) || "Sem título";
                  const year = getYearCat(chosen) || "—";
                  const price = getPriceRawCat(chosen);
                  const imgs = (getImagesCat(chosen) as string[]) || [];
                  const img0 =
                    imgs?.[0] ||
                    "https://placehold.co/600x400/f3f4f6/9ca3af?text=Sem+Foto";
                  return (
                    <div className="lg:col-span-2">
                      <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-lg">
                        <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                        <div className="grid md:grid-cols-2 gap-0">
                          <div className="h-48 bg-slate-800">
                            <img src={img0} alt={title} className="w-full h-full object-contain" />
                          </div>
                          <div className="p-5 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-slate-50 text-lg leading-tight">
                                  {title}
                                </h3>
                                <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                  <CalendarDays className="w-4 h-4" /> {year}
                                </p>
                              </div>
                              <p className="text-xl font-bold text-emerald-400 whitespace-nowrap">
                                {formatCurrencyCat(price)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Desfecho */}
                <Card className="lg:col-span-2 bg-slate-800/60 border-slate-700/80 text-slate-100">
                  <CardHeader className="py-3 border-b border-slate-700/80">
                    <CardTitle className="text-sm font-semibold text-slate-100">Desfecho</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Resultado</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start bg-slate-900 border-slate-700 hover:bg-slate-800"
                          >
                            <ChevronRight className="h-3.5 w-3.5 mr-2" />
                            {(data.outcome || "—").toUpperCase()}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-2 bg-slate-900 border-slate-800 text-slate-100">
                          {["", "vendido", "perdido"].map((v) => (
                            <Button
                              key={v || "vazio"}
                              variant="ghost"
                              className="w-full justify-start hover:bg-slate-800"
                              onClick={() => set("outcome", v || null)}
                            >
                              {(v || "—").toUpperCase()}
                            </Button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Motivo (vendido)</Label>
                      <Input
                        placeholder="Ex.: melhor avaliação na troca"
                        value={data.won_reason || ""}
                        onChange={(e) => set("won_reason", e.target.value)}
                        className="bg-slate-900 border-slate-700 text-slate-100 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400 flex items-center gap-1">
                        <ThumbsDown className="h-3.5 w-3.5" /> Motivo (perdido)
                      </Label>
                      <Input
                        placeholder="Ex.: preço/financiamento/tempo"
                        value={data.lost_reason || ""}
                        onChange={(e) => set("lost_reason", e.target.value)}
                        className="bg-slate-900 border-slate-700 text-slate-100 focus:ring-emerald-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {/* Formulário (Somente leitura) */}
            {tab === "form" && (
              <Card className="lg:col-span-2 bg-slate-800/60 border-slate-700/80 text-slate-100">
                <CardHeader className="py-3 border-b border-slate-700/80">
                  <CardTitle className="text-sm font-semibold text-slate-100">Dados do Formulário (somente leitura)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                    <h4 className="font-semibold mb-2 text-slate-100">Perfil</h4>
                    <div className="divide-y divide-slate-700">
                      <InfoRow label="Nome">{data?.name}</InfoRow>
                      <InfoRow label="Telefone">{data?.phone}</InfoRow>
                      <InfoRow label="CPF">{data?.cpf}</InfoRow>
                      <InfoRow label="Ocupação">{data?.job}</InfoRow>
                      <InfoRow label="Etapa (form)">{bot?.state || data?.state}</InfoRow>
                      <InfoRow label="Tipo negociação">{bot?.deal_type || data?.deal_type}</InfoRow>
                      <InfoRow label="Pagamento">{bot?.payment_method || data?.payment_method}</InfoRow>
                      <InfoRow label="RG Número">{data?.rg_number}</InfoRow>
                      <InfoRow label="Relatório">{data?.report}</InfoRow>
                    </div>
                  </div>
                  
                  {dealType(bot) === "visita" && (
                    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                      <h4 className="font-semibold mb-2 text-slate-100">Visita</h4>
                      <div className="divide-y divide-slate-700">
                        <InfoRow label="Data">{visitDetails?.day}</InfoRow>
                        <InfoRow label="Hora">{visitDetails?.time}</InfoRow>
                      </div>
                    </div>
                  )}
                  
                  {dealType(bot) === "troca" && (
                    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                      <h4 className="font-semibold mb-2 text-slate-100">Troca</h4>
                      <div className="divide-y divide-slate-700">
                        <InfoRow label="Modelo">{tradeInCar?.modelo || tradeInCar?.model}</InfoRow>
                        <InfoRow label="Ano">{tradeInCar?.ano || tradeInCar?.year}</InfoRow>
                        <InfoRow label="Valor Desejado">{toBRL(tradeInCar?.valor || tradeInCar?.value)}</InfoRow>
                        <InfoRow label="Descrição">{tradeInCar?.descricao || tradeInCar?.description}</InfoRow>
                      </div>
                      
                      {/* Vitrine do veículo de troca no dialog */}
                      {tradeTitle && (
                        <div className="mt-4">
                          <div className="rounded-lg border border-slate-700 overflow-hidden bg-slate-900 shadow-sm">
                            <div className="grid md:grid-cols-2">
                              <div className="h-48 bg-slate-800 flex items-center justify-center">
                                {isFetchingTradeImages ? (
                                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                ) : (
                                  <img
                                    src={tradeImg0}
                                    alt={tradeTitle}
                                    className="max-w-full max-h-full object-contain"
                                    loading="lazy"
                                  />
                                )}
                              </div>
                              <div className="p-6 space-y-3">
                                <h4 className="font-bold text-xl leading-tight text-slate-50">{tradeTitle}</h4>
                                {tradePrice != null && (
                                  <p className="text-2xl font-bold text-emerald-400">{toBRL(tradePrice)}</p>
                                )}
                              </div>
                            </div>
                            {tradeCarImages.length > 1 && (
                              <div className="p-6 border-t border-slate-700">
                                <h5 className="font-semibold text-base mb-4 text-slate-100">Outras Imagens do Veículo de Troca</h5>
                                <div className="grid grid-cols-4 gap-4">
                                  {tradeCarImages.slice(1, 5).map((src, i) => (
                                    <div key={i} className="rounded-md border border-slate-700 overflow-hidden bg-slate-800">
                                      <img src={src} className="w-full h-24 object-contain" loading="lazy" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {dealType(bot) === "financiamento" && (
                    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                      <h4 className="font-semibold mb-2 text-slate-100">Financiamento</h4>
                      <div className="divide-y divide-slate-700">
                        <InfoRow label="Entrada">{toBRL(financingDetails.entry)}</InfoRow>
                        <InfoRow label="Parcelas">{financingDetails.parcels}</InfoRow>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Troca tab */}
            {tab === "troca" && (
              <Card className="lg:col-span-2 bg-slate-800/60 border-slate-700/80 text-slate-100">
                <CardHeader className="py-3 border-b border-slate-700/80">
                  <CardTitle className="text-sm font-semibold text-slate-100">Detalhes da Troca</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                    <h4 className="font-semibold mb-2 text-slate-100">Veículo de Troca</h4>
                    <div className="divide-y divide-slate-700 text-sm">
                      <InfoRow label="Modelo">{tradeInCar?.modelo || tradeInCar?.model || "—"}</InfoRow>
                      <InfoRow label="Ano">{tradeInCar?.ano || tradeInCar?.year || "—"}</InfoRow>
                      <InfoRow label="Valor Desejado">{toBRL(tradeInCar?.valor || tradeInCar?.value) || "—"}</InfoRow>
                      <InfoRow label="Descrição">{tradeInCar?.descricao || tradeInCar?.description || "—"}</InfoRow>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4">
                    <h4 className="font-semibold mb-2 text-slate-100">Imagens do Veículo de Troca</h4>
                    {isFetchingTradeImages ? (
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto" />
                    ) : tradeCarImages.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center">Nenhuma imagem disponível.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tradeCarImages.map((src, i) => (
                          <div key={i} className="text-center">
                            <a
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg border border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition"
                            >
                              <img src={src} alt={`Imagem Troca ${i + 1}`} className="w-full h-32 object-cover bg-slate-800" />
                            </a>
                            <p className="text-xs mt-1 text-slate-300">Imagem {i + 1}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Arquivos (somente visual) */}
            {tab === "arquivos" && (
              <Card className="lg:col-span-2 bg-slate-800/60 border-slate-700/80 text-slate-100">
                <CardHeader className="py-3 border-b border-slate-700/80">
                  <CardTitle className="text-sm font-semibold text-slate-100">Arquivos enviados</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {allImages.length === 0 ? (
                    <div className="text-sm text-slate-400">Nenhum arquivo enviado.</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {allImages.map(({ src, label }, i) => (
                        <div key={i} className="text-center">
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg border border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition"
                          >
                            <img src={src} alt={label} className="w-full h-32 object-cover bg-slate-800" />
                          </a>
                          <p className="text-xs mt-1 text-slate-300">{label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
        
        {/* Rodapé com ações (Dashboard Style) */}
        <DialogFooter className="px-5 py-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
          <div className="mr-auto flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100"
              onClick={() => onMove(client.chat_id, "reservado")}
              title="Mover para Reservado"
            >
              <CalendarDays className="h-4 w-4 mr-2" /> Reservar
            </Button>
            <Button
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100"
              onClick={() => onMove(client.chat_id, "vendido")}
              title="Marcar como Vendido"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" /> Vendido
            </Button>
            <Button
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100"
              onClick={() => onMove(client.chat_id, "perdido")}
              title="Marcar como Perdido"
            >
              <ThumbsDown className="h-4 w-4 mr-2" /> Perdido
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100"
              onClick={exportClientPDF}
              disabled={exporting}
              title="Exportar PDF do atendimento"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando PDF...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
                </>
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-[0_10px_30px_rgba(16,185,129,0.4)]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                <>Salvar alterações</>
              )}
            </Button>
          </div>
        </DialogFooter>
        
        {/* ====== Área oculta para renderizar o PDF (DUAS PÁGINAS) ====== */}
        <div className="sr-only absolute -left-[99999px] top-0" aria-hidden>
          <div ref={pdfMainRef}>
            <PdfMain client={data} externalTradeImages={tradeCarImages} />
          </div>
          <div ref={pdfNegRef}>
            <PdfNegotiation client={data} externalTradeImages={tradeCarImages} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =========================== Página (Kanban) (Estilo Dashboard) ===========================
function CRMKanbanContent() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<any>(null);
  const [modal, setModal] = useState<any>(null);
  
  // Simula o storeDetailsData do dashboard para o header
  const storeDetailsData = {
    nome: "Minha Loja", // Substitua pelo seu
    logo_url: "", // Substitua pelo seu
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } })
  );

  const [kanbanColumns, setKanbanColumns] = useState(() => {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${LOJA_ID_ATUAL}`;
    const metaKey = `${LOCAL_STORAGE_META_PREFIX}${LOJA_ID_ATUAL}`;
    try {
      const meta = JSON.parse(localStorage.getItem(metaKey) || "{}");
      const saved = localStorage.getItem(key);
      if (!meta.version || meta.version !== KANBAN_SCHEMA_VERSION) {
        localStorage.setItem(key, JSON.stringify(COLUNAS_FOCO_EM_MARCOS));
        localStorage.setItem(metaKey, JSON.stringify({ version: KANBAN_SCHEMA_VERSION }));
        return COLUNAS_FOCO_EM_MARCOS;
      }
      return saved ? JSON.parse(saved) : COLUNAS_FOCO_EM_MARCOS;
    } catch {
      localStorage.setItem(key, JSON.stringify(COLUNAS_FOCO_EM_MARCOS));
      localStorage.setItem(
        `${LOCAL_STORAGE_META_PREFIX}${LOJA_ID_ATUAL}`,
        JSON.stringify({ version: KANBAN_SCHEMA_VERSION })
      );
      return COLUNAS_FOCO_EM_MARCOS;
    }
  });

  useEffect(() => {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${LOJA_ID_ATUAL}`;
    localStorage.setItem(key, JSON.stringify(kanbanColumns));
  }, [kanbanColumns]);

  const {
    data: clients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    refetchInterval: 10000,
    initialData: [],
  });

  const updateStatus = useMutation({
    mutationFn: updateClientStatus,
    onSuccess: () => {
      toast({ title: "Status atualizado", variant: "success" });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: any) =>
      toast({ title: "Falha ao mover", description: e?.message, variant: "destructive" }),
  });

  const updateDetails = useMutation({
    mutationFn: updateClientDetails,
    onSuccess: () => {
      toast({ title: "Atendimento salvo", variant: "success" });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: any) =>
      toast({ title: "Erro ao salvar", description: e?.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (chatId: string) => deleteClient(chatId),
    onSuccess: () => {
      toast({ title: "Cliente excluído", variant: "success" });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: any) => {
      toast({ title: "Erro ao excluir", description: e?.message, variant: "destructive" });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const arr = q
      ? clients.filter((c: any) => {
          const name = (c.name || "").toLowerCase();
          const owner = (c.owner || "").toLowerCase();
          const vehicle = interestedVehicleFromBot(c.bot_data).toLowerCase();
          return name.includes(q) || owner.includes(q) || vehicle.includes(q);
        })
      : clients;
    return arr;
  }, [clients, search]);

  const buckets = useMemo(() => {
    const map: Record<string, any[]> = Object.fromEntries(
      COLUNAS_FOCO_EM_MARCOS.map((c) => [c.id, []])
    );
    filtered.forEach((c: any) => {
      const s = normalizaEstadoParaColuna(c.bot_data?.state || c.state);
      map[s] ? map[s].push(c) : map["novo_lead"].push(c);
    });
    return map;
  }, [filtered]);

  function handleDragStart(event: any) {
    const c = filtered.find((x: any) => x.chat_id === event.active.id);
    setActive(c || null);
  }

  function handleDragEnd(event: any) {
    setActive(null);
    const { active, over } = event;
    if (!over) return;
    const id = active.id as string;
    const overId = String(over.id);
    let dest = COLUNAS_FOCO_EM_MARCOS.some((c) => c.id === overId) ? overId : null;
    if (!dest) {
      const overClient = clients.find((c: any) => c.chat_id === overId);
      if (overClient)
        dest = normalizaEstadoParaColuna(
          overClient?.bot_data?.state || overClient?.state
        );
    }
    if (!dest) return;
    updateStatus.mutate({ chatId: id, newState: dest });
  }

  const handleSave = async (chatId: string, updated: any) => {
    await updateDetails.mutateAsync({ chatId, updatedData: updated });
  };

  const handleMove = async (chatId: string, newState: string) => {
    await updateStatus.mutateAsync({ chatId, newState });
  };

  const [toDelete, setToDelete] = useState<{ chatId: string; name?: string } | null>(null);

  return (
    <div className="bg-slate-950 text-slate-50 min-h-screen p-4 md:p-6">
      {/* HEADER (Estilo Dashboard) */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-start gap-4">
          {storeDetailsData?.logo_url ? (
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/70 flex items-center justify-center overflow-hidden shadow-lg">
              <img
                src={storeDetailsData.logo_url}
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/70 flex items-center justify-center shadow-lg text-lg font-bold">
              {storeDetailsData?.nome?.[0] || 'Z'}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              CRM de Atendimento
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative max-w-md w-full lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por cliente, veículo ou vendedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full bg-slate-800 border-slate-700 text-slate-100 focus:ring-emerald-500"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="p-6 text-slate-300">
          <Loader2 className="h-6 w-6 animate-spin mr-2 inline-block text-emerald-500" /> Carregando CRM...
        </div>
      ) : error ? (
        <div className="p-6 text-red-400">
          <AlertTriangle className="h-5 w-5 mr-2 inline-block" /> Erro ao carregar dados.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCenter}
        >
          <div className="w-full overflow-x-auto pb-8">
            <div className="flex flex-nowrap gap-4 md:gap-6 items-start">
              {COLUNAS_FOCO_EM_MARCOS.map((col) => (
                <Column
                  key={col.id}
                  columnId={col.id}
                  name={col.name}
                  items={buckets[col.id] || []}
                  onOpen={(c) => setModal(c)}
                  onDelete={(chatId) => {
                    const target = clients.find((x: any) => x.chat_id === chatId);
                    setToDelete({ chatId, name: target?.name });
                  }}
                />
              ))}
            </div>
          </div>
          <DragOverlay>
            {active ? (
              <Card className="bg-slate-800 border border-slate-700 shadow-2xl">
                <CardContent className="p-3">
                  <div className="font-semibold text-sm text-slate-50">{active.name || "Cliente"}</div>
                  <div className="text-xs text-slate-400">
                    {interestedVehicleFromBot(active.bot_data)}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      
      {/* Modal de atendimento */}
      {modal && (
        <AtendimentoDialog
          open={!!modal}
          onOpenChange={(o) => !o && setModal(null)}
          client={modal}
          onSave={handleSave}
          onMove={handleMove}
        />
      )}
      
      {/* Delete Dialog (Estilo Dashboard) */}
      <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-slate-50">Confirmar exclusão</DialogTitle>
            <DialogDescription className="text-slate-400">
              {toDelete?.name ? (
                <>
                  Tem certeza que deseja excluir <b>{toDelete.name}</b>? Essa ação não pode ser
                  desfeita.
                </>
              ) : (
                <>Essa ação não pode ser desfeita.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100"
              onClick={() => setToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 text-red-50 hover:bg-red-700"
              onClick={async () => {
                if (!toDelete?.chatId) return;
                await deleteMutation.mutateAsync(toDelete.chatId);
                setToDelete(null);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CRMKanban() {
  return (
    <ToastProvider>
      <CRMKanbanContent />
    </ToastProvider>
  );
}