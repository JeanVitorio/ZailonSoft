// src/pages/CRMAtendimento.tsx
// CRM de Atendimento (pós-formulário): Kanban com DnD, modal responsivo,
// leitura dos dados do formulário (somente leitura) e colunas focadas em marcos.
// Requisitos: react, @tanstack/react-query, dnd-kit, shadcn/ui, lucide-react, html2canvas, jspdf
// APIs do seu projeto: fetchClients, updateClientStatus, updateClientDetails, deleteClient.

import React, { useEffect, useMemo, useReducer, useState, useContext, useRef, useCallback } from "react";
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

// =========================== Toast simples ===========================
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
    default: "bg-background text-foreground border",
    destructive: "bg-destructive text-destructive-foreground border-destructive",
    success:
      "bg-emerald-600/10 text-emerald-900 border border-emerald-600/30 dark:text-emerald-100",
  };
  return (
    <div className="fixed bottom-0 right-0 p-6 space-y-2 z-[100]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg flex items-start gap-4 w-80 md:w-96 ${variantClasses[toast.variant || "default"]}`}
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
const toBRL = (value: any) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    typeof value === "number" ? value : Number(value || 0)
  );
function parseISOOrNull(v?: string | null) {
  try {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}
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
  if (val === "alta") return <Badge className="bg-red-600 text-white">Alta</Badge>;
  if (val === "baixa") return <Badge variant="secondary">Baixa</Badge>;
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
// Versão do schema localStorage (altere se mexer nas colunas)
const KANBAN_SCHEMA_VERSION = 3;

// Colunas focadas em marcos
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
  // 👇 Correção: qualquer vazio/"inicial"/"leed_recebido" cai em "novo_lead"
  if (!s || s === "inicial" || s === "leed_recebido") return "novo_lead";
  // Se vier um estado desconhecido, também forçamos "novo_lead"
  const valid = new Set(COLUNAS_FOCO_EM_MARCOS.map((c) => c.id));
  return valid.has(s) ? s : "novo_lead";
}

// =========================== Helpers de negócio ===========================
function dealType(bot_data: any): "troca" | "financiamento" | "à vista" | "visita" | "—" {
  const txt = (s?: string) => String(s || "").toLowerCase();
  const deal = txt(bot_data?.deal_type);
  const pay = txt(bot_data?.payment_method);
  const visit = bot_data?.visit_details || {};
  const hasTrade =
    !!bot_data?.trade_in_car &&
    (Array.isArray(bot_data.trade_in_car?.imagens) ||
      Array.isArray(bot_data.trade_in_car?.images) ||
      bot_data.trade_in_car?.modelo ||
      bot_data.trade_in_car?.descricao);

  if (hasTrade || deal.includes("troca") || pay.includes("troca")) return "troca";
  if (deal.includes("financ") || pay.includes("financ") || pay.includes("parcel")) return "financiamento";
  if (deal.includes("vista") || pay.includes("vista") || pay.includes("pix") || pay.includes("dinheiro"))
    return "à vista";
  if (visit?.day || visit?.time) return "visita";
  return "—";
}
function tradeImagesFromBot(bot_data: any): string[] {
  const t = bot_data?.trade_in_car || {};
  const imgs: string[] = []
    .concat(Array.isArray(t?.imagens) ? t.imagens : [], Array.isArray(t?.images) ? t.images : [])
    .filter((u) => typeof u === "string" && /^https?:\/\//.test(u));
  return imgs;
}

// =========================== Card Arrastável ===========================
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

  const vehicle = interestedVehicleFromBot(client.bot_data);
  const seller = client.owner || "—";
  const tipo = dealType(client.bot_data);
  const imgsTroca = tipo === "troca" ? tradeImagesFromBot(client.bot_data) : [];

  const tipoBadge = (
    <Badge variant={tipo === "—" ? "outline" : "secondary"}>
      <MessageSquare className="h-3 w-3 mr-1" />
      {tipo.toUpperCase()}
    </Badge>
  );

  return (
    <Card ref={setNodeRef} style={style} {...attributes} className="bg-background/80">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm truncate">{client.name || "Sem nome"}</h4>
              {priorityBadge(client.priority)}
            </div>

            <p className="text-xs text-muted-foreground truncate">{vehicle}</p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <User2 className="h-3 w-3 mr-1" /> {seller}
              </Badge>
              {tipoBadge}
              {client.channel ? (
                <Badge variant="outline">
                  <MessageSquare className="h-3 w-3 mr-1" /> {client.channel}
                </Badge>
              ) : null}
            </div>

            {imgsTroca.length > 0 && (
              <div className="mt-2 flex gap-1.5">
                {imgsTroca.slice(0, 4).map((src, i) => (
                  <a
                    key={i}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    title="Imagem do veículo de troca"
                    className="block w-10 h-10 rounded border overflow-hidden"
                  >
                    <img src={src} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" {...listeners} title="Arrastar">
              <MoveRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={onOpen} title="Abrir">
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
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

// =========================== Coluna (droppable) ===========================
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
    <div className="w-[280px] sm:w-72 flex-shrink-0">
      <div
        ref={setNodeRef}
        className={`rounded-lg p-4 h-[calc(100vh-14rem)] flex flex-col transition-colors ${
          isOver ? "bg-amber-50 border border-amber-200" : "bg-muted/50"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{name}</h3>
          <Badge variant="secondary">{items.length}</Badge>
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
                <div className="h-[100px] border-2 border-dashed rounded-md text-sm text-muted-foreground grid place-items-center">
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

// =========================== Modal (Atendimento) ===========================
const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-3 border-b py-2 last:border-none">
    <Label className="text-left md:text-right text-muted-foreground text-xs font-semibold">
      {label}
    </Label>
    <div className="col-span-2 text-sm min-w-0">{children}</div>
  </div>
);

// Helpers de normalização (estilo Catálogo) para o card de vitrine no diálogo
const getNameCat = (c: any) => c?.nome ?? c?.name ?? "";
const getDescCat = (c: any) => c?.descricao ?? c?.description ?? "";
const getYearCat = (c: any) => c?.ano ?? c?.year ?? "";
const getPriceRawCat = (c: any) => c?.preco ?? c?.price ?? 0;
const getImagesCat = (c: any) => c?.imagens ?? c?.images ?? [];
const parsePriceCat = (v: any) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").trim();
  if (!s) return 0;
  const brlLike = s.replace(/\s+/g, "").replace(/R\$\s?/gi, "").replace(/\./g, "").replace(/,/, ".");
  const n = Number(brlLike);
  if (Number.isFinite(n)) return n;
  const digits = s.replace(/\D+/g, "");
  return digits ? (digits.length >= 3 ? Number(digits) / 100 : Number(digits)) : 0;
};
const formatCurrencyCat = (v: any) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(
    parsePriceCat(v)
  );

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
  const pdfRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // normaliza bot_data
  const normalizeClient = (raw: any) => {
    const c = { ...raw };
    try {
      if (c.bot_data?.interested_vehicles && typeof c.bot_data.interested_vehicles === "string") {
        c.bot_data.interested_vehicles = JSON.parse(c.bot_data.interested_vehicles);
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

  const quickWhats = client?.phone ? `https://wa.me/55${String(client.phone).replace(/\D/g, "")}` : "";

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

  const exportClientPDF = useCallback(async () => {
    if (!pdfRef.current) return;
    try {
      setExporting(true);
      const el = pdfRef.current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const ratio = pageWidth / canvas.width;
      const imgHeight = canvas.height * ratio;
      if (imgHeight <= pdf.internal.pageSize.getHeight()) {
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, imgHeight);
      } else {
        // simples: cortar em páginas
        const pageHeight = pdf.internal.pageSize.getHeight();
        const sliceHeightPx = pageHeight / ratio;
        let renderedHeight = 0;
        const pageCanvas = document.createElement("canvas");
        const ctx = pageCanvas.getContext("2d")!;
        while (renderedHeight < canvas.height) {
          const sliceHeight = Math.min(sliceHeightPx, canvas.height - renderedHeight);
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          const h = sliceHeight * ratio;
          if (renderedHeight === 0) {
            pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, h);
          } else {
            pdf.addPage();
            pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, h);
          }
          renderedHeight += sliceHeight;
        }
      }
      const nameSafe = (client?.name || "Cliente").replace(/[^\p{L}\p{N}\s_-]+/gu, "");
      pdf.save(`Atendimento_${nameSafe}_${new Date().toLocaleDateString("pt-BR")}.pdf`);
    } finally {
      setExporting(false);
    }
  }, [client?.name]);

  const bot = data?.bot_data || {};
  const interestedVehicles: any[] = Array.isArray(bot?.interested_vehicles) ? bot.interested_vehicles : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-screen-lg md:max-w-5xl p-0">
        <div className="max-h-[92vh] flex flex-col">
          <DialogHeader className="px-5 pt-5 pb-3 border-b">
            <DialogTitle className="text-lg md:text-xl flex items-center gap-2">
              <User2 className="h-5 w-5 text-amber-600" />
              {data?.name || "Atendimento"}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" />
              {data?.phone || "—"}
              {quickWhats ? (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={quickWhats}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:underline ml-2"
                >
                  <Link2 className="h-3.5 w-3.5" /> WhatsApp
                </a>
              ) : null}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div ref={pdfRef} className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Roteiro */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Roteiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Vendedor</Label>
                    <Input
                      className="col-span-2 h-9"
                      placeholder="Nome do vendedor"
                      value={data.owner || ""}
                      onChange={(e) => set("owner", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Prioridade</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="col-span-2 justify-start">
                          <Flag className="h-3.5 w-3.5 mr-2" />
                          {(data.priority || "normal").toUpperCase()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-2 w-44">
                        {["alta", "normal", "baixa"].map((p) => (
                          <Button
                            key={p}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => set("priority", p)}
                          >
                            {p.toUpperCase()}
                          </Button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Canal</Label>
                    <Input
                      className="col-span-2 h-9"
                      placeholder="WhatsApp / Ligação / Instagram / Site..."
                      value={data.channel || ""}
                      onChange={(e) => set("channel", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Próx. ação</Label>
                    <Input
                      type="datetime-local"
                      className="col-span-2 h-9"
                      value={data.next_action_at?.slice(0, 16) || ""}
                      onChange={(e) => set("next_action_at", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Visita</Label>
                    <Input
                      type="datetime-local"
                      className="col-span-2 h-9"
                      value={data.appointment_at?.slice(0, 16) || ""}
                      onChange={(e) => set("appointment_at", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Reserva até</Label>
                    <Input
                      type="datetime-local"
                      className="col-span-2 h-9"
                      value={data.reservation_expires_at?.slice(0, 16) || ""}
                      onChange={(e) => set("reservation_expires_at", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notas */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Notas (interno)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Observações, próximos passos, objeções, etc."
                    value={data.notes || ""}
                    onChange={(e) => set("notes", e.target.value)}
                    className="min-h-[140px]"
                  />
                </CardContent>
              </Card>

              {/* Veículo de interesse (estilo catálogo) */}
              {(() => {
                const chosen =
                  Array.isArray(interestedVehicles) && interestedVehicles.length
                    ? interestedVehicles[0]
                    : null;
                if (!chosen) return null;

                const title = getNameCat(chosen) || "Sem título";
                const year = getYearCat(chosen) || "—";
                const price = getPriceRawCat(chosen);
                const desc = getDescCat(chosen) || "Sem descrição";
                const imgs = (getImagesCat(chosen) as string[]) || [];
                const img0 =
                  imgs?.[0] ||
                  "https://placehold.co/600x400/f3f4f6/9ca3af?text=Sem+Foto";

                return (
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow">
                      <div className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500" />
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="aspect-video bg-gray-100">
                          <img src={img0} alt={title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                                {title}
                              </h3>
                              <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                <CalendarDays className="w-4 h-4" /> {year}
                              </p>
                            </div>
                            <p className="text-xl font-bold text-amber-600 whitespace-nowrap">
                              {formatCurrencyCat(price)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700">{desc}</p>
                          {imgs?.length > 1 && (
                            <div className="grid grid-cols-5 gap-2 pt-2">
                              {imgs.slice(0, 5).map((src, i) => (
                                <a
                                  key={i}
                                  href={src}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block rounded-lg border overflow-hidden"
                                >
                                  <img src={src} className="w-full h-20 object-cover" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Desfecho */}
              <Card className="lg:col-span-2">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Desfecho</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Resultado</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <ChevronRight className="h-3.5 w-3.5 mr-2" />
                          {(data.outcome || "—").toUpperCase()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-2">
                        {["", "vendido", "perdido"].map((v) => (
                          <Button
                            key={v || "vazio"}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => set("outcome", v || null)}
                          >
                            {(v || "—").toUpperCase()}
                          </Button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Motivo (vendido)</Label>
                    <Input
                      placeholder="Ex.: melhor avaliação na troca"
                      value={data.won_reason || ""}
                      onChange={(e) => set("won_reason", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <ThumbsDown className="h-3.5 w-3.5" /> Motivo (perdido)
                    </Label>
                    <Input
                      placeholder="Ex.: preço/financiamento/tempo"
                      value={data.lost_reason || ""}
                      onChange={(e) => set("lost_reason", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dados do formulário (somente leitura) */}
              <Card className="lg:col-span-2">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Dados do Formulário (somente leitura)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-3">
                    <h4 className="font-semibold mb-2">Perfil</h4>
                    <div className="space-y-1">
                      <InfoRow label="Nome">{data?.name || "N/A"}</InfoRow>
                      <InfoRow label="Telefone">{data?.phone || "N/A"}</InfoRow>
                      <InfoRow label="CPF">{data?.cpf || "N/A"}</InfoRow>
                      <InfoRow label="Ocupação">{data?.job || "N/A"}</InfoRow>
                      <InfoRow label="Etapa (form)">{data?.form_stage || "N/A"}</InfoRow>
                      <InfoRow label="Tipo negociação">{bot?.deal_type || "N/A"}</InfoRow>
                      <InfoRow label="Pagamento">{bot?.payment_method || "N/A"}</InfoRow>
                    </div>
                  </div>

                  <div className="border rounded-md p-3">
                    <h4 className="font-semibold mb-2">Visita</h4>
                    <div className="space-y-1">
                      <InfoRow label="Data">
                        {bot?.visit_details?.day || "N/A"}
                      </InfoRow>
                      <InfoRow label="Hora">
                        {bot?.visit_details?.time || "N/A"}
                      </InfoRow>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <DialogFooter className="px-5 py-4 border-t">
            <div className="mr-auto flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => onMove(client.chat_id, "reservado")}
                title="Mover para Reservado"
              >
                <CalendarDays className="h-4 w-4 mr-2" /> Reservar
              </Button>
              <Button
                variant="outline"
                onClick={() => onMove(client.chat_id, "vendido")}
                title="Marcar como Vendido"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Vendido
              </Button>
              <Button
                variant="outline"
                onClick={() => onMove(client.chat_id, "perdido")}
                title="Marcar como Perdido"
              >
                <ThumbsDown className="h-4 w-4 mr-2" /> Perdido
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={exportClientPDF}
                disabled={exporting}
                title="Exportar PDF deste atendimento"
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
                className="bg-amber-500 hover:bg-amber-600 text-white"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =========================== Página (Kanban) ===========================
function CRMAtendimentoContent() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [active, setActive] = useState<any>(null);
  const [modal, setModal] = useState<any>(null);

  // Sensores drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 5 } })
  );

  // Colunas com migração de versão
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
      localStorage.setItem(`${LOCAL_STORAGE_META_PREFIX}${LOJA_ID_ATUAL}`, JSON.stringify({ version: KANBAN_SCHEMA_VERSION }));
      return COLUNAS_FOCO_EM_MARCOS;
    }
  });
  useEffect(() => {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${LOJA_ID_ATUAL}`;
    localStorage.setItem(key, JSON.stringify(kanbanColumns));
  }, [kanbanColumns]);

  // Dados
  const { data: clients = [], isLoading, error } = useQuery({
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
    // sua assinatura é deleteClient(chatId: string)
    mutationFn: (chatId: string) => deleteClient(chatId),
    onSuccess: () => {
      toast({ title: "Cliente excluído", variant: "success" });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: any) => {
      toast({ title: "Erro ao excluir", description: e?.message, variant: "destructive" });
    },
  });

  // Filtro de busca (nome, veículo, vendedor)
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

  // Distribui por coluna (com fallback seguro para "novo_lead")
  const buckets = useMemo(() => {
    const map: Record<string, any[]> = Object.fromEntries(COLUNAS_FOCO_EM_MARCOS.map((c) => [c.id, []]));
    filtered.forEach((c: any) => {
      const s = normalizaEstadoParaColuna(c.bot_data?.state || c.state);
      map[s] ? map[s].push(c) : map["novo_lead"].push(c);
    });
    return map;
  }, [filtered]);

  // Drag
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

    // Se soltou na coluna diretamente
    let dest = COLUNAS_FOCO_EM_MARCOS.some((c) => c.id === overId) ? overId : null;

    // Senão, pega a coluna do card alvo
    if (!dest) {
      const overClient = clients.find((c: any) => c.chat_id === overId);
      if (overClient) dest = normalizaEstadoParaColuna(overClient?.bot_data?.state || overClient?.state);
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

  // Delete
  const [toDelete, setToDelete] = useState<{ chatId: string; name?: string } | null>(null);

  return (
    <div className="space-y-6 p-4 md:p-6 h-screen overflow-y-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">CRM de Atendimento</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative max-w-md flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por cliente, veículo ou vendedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2 inline-block" /> Carregando CRM...
        </div>
      ) : error ? (
        <div className="p-6 text-destructive">
          <AlertTriangle className="h-5 w-5 mr-2 inline-block" /> Erro ao carregar dados.
        </div>
      ) : (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div className="w-full overflow-x-auto">
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
              <Card>
                <CardContent className="p-3">
                  <div className="font-semibold text-sm">{active.name || "Cliente"}</div>
                  <div className="text-xs text-muted-foreground">
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

      {/* Delete */}
      <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              {toDelete?.name ? (
                <>Tem certeza que deseja excluir <b>{toDelete.name}</b>? Essa ação não pode ser desfeita.</>
              ) : (
                <>Essa ação não pode ser desfeita.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleteMutation.isPending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
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

export default function CRMAtendimento() {
  return (
    <ToastProvider>
      <CRMAtendimentoContent />
    </ToastProvider>
  );
}
