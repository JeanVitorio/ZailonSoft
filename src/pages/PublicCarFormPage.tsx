// src/pages/PublicCarFormPage.tsx
import React, {
  useState,
  useMemo,
  useEffect,
  useReducer,
  useContext,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';
// import { useToast } from '../components/ui/use-toast'; // Substituído pelo provider local
import { Progress } from '@/components/ui/progress';
import imageCompression from 'browser-image-compression';

// Componentes do fluxo
import {
  StepPersonalData, StepFileUpload, StepPaymentType, StepFinancing,
  StepTradeDetails, StepVisitDetails,
  FormData, ClientPayload, Car, Files
} from '../components/AddClient';

// API dos carros
import { fetchCarDetails } from '../services/api';

// ✅ Supabase (singleton para evitar “Multiple GoTrueClient instances”)
import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window { __supabase__?: SupabaseClient }
}
const supabase: SupabaseClient =
  window.__supabase__ ??
  createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
window.__supabase__ = supabase;

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
            <Feather.X className="h-4 w-4" />
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
// -------------------------------------------------------------------------------------

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } }
};

// Helpers de moeda
const parseCurrency = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  const cleaned = String(value).replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
};

const formatCurrency = (value: string | number): string => {
  const number = parseCurrency(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};

// Card de detalhes do veículo (Estilo Dashboard)
function CarDetailsDisplay({ vehicle }: { vehicle: Car }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const navigateGallery = (direction: number) => {
    if (!vehicle?.imagens || vehicle.imagens.length === 0) return;
    const newIndex = (currentImageIndex + direction + vehicle.imagens.length) % vehicle.imagens.length;
    setCurrentImageIndex(newIndex);
  };

  const toggleDescription = () => setIsDescriptionExpanded((v) => !v);
  const currentImages = vehicle.imagens || [];

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-[0_18px_40px_rgba(15,23,42,0.9)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Galeria */}
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700">
            {currentImages.length > 0 ? (
              <img
                src={currentImages[currentImageIndex]}
                alt="Imagem principal do veículo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                Sem imagem
              </div>
            )}
            {currentImages.length > 1 && (
              <>
                <motion.button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-800/70 p-2 rounded-full border border-slate-700 text-emerald-400 hover:bg-slate-700"
                  onClick={() => navigateGallery(-1)}
                  aria-label="Imagem anterior"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Feather.ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800/70 p-2 rounded-full border border-slate-700 text-emerald-400 hover:bg-slate-700"
                  onClick={() => navigateGallery(1)}
                  aria-label="Próxima imagem"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Feather.ChevronRight className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {currentImages.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentImageIndex(index)}
                className={`w-full aspect-square overflow-hidden rounded-md border-2 ${currentImageIndex === index ? 'border-emerald-500' : 'border-transparent'}`}
                aria-label={`Selecionar imagem ${index + 1}`}
              >
                <img src={img} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-200 font-medium">Preço</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(vehicle.preco || 0)}</p>
            </div>
            <div>
              <p className="text-slate-200 font-medium">Ano</p>
              <p className="font-semibold text-slate-100 text-2xl">{vehicle.ano}</p>
            </div>
          </div>
          <div>
            <p className="text-slate-200 font-medium">Descrição</p>
            <p className={`text-slate-400 whitespace-pre-wrap transition-all duration-300 ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}>
              {vehicle.descricao || 'Nenhuma descrição disponível.'}
            </p>
            {vehicle.descricao && vehicle.descricao.length > 200 && (
              <button
                onClick={toggleDescription}
                className="text-emerald-400 font-semibold text-sm mt-2 hover:underline"
                type="button"
              >
                {isDescriptionExpanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Passo local: tipo de negócio (Estilo Dashboard)
const StepDealType = ({
  setDealType,
  nextStep
}: {
  setDealType: (type: 'comum' | 'troca' | 'visita') => void;
  nextStep: () => void;
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-50">Selecione o Tipo de Negócio</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-emerald-500/50 transition-all"
          onClick={() => { setDealType('comum'); nextStep(); }}
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Feather.ShoppingCart className="w-6 h-6 mx-auto mb-2 text-emerald-400" /> Compra
        </motion.button>
        <motion.button
          className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-emerald-500/50 transition-all"
          onClick={() => { setDealType('troca'); nextStep(); }}
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Feather.RefreshCw className="w-6 h-6 mx-auto mb-2 text-emerald-400" /> Troca
        </motion.button>
        <motion.button
          className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-emerald-500/50 transition-all"
          onClick={() => { setDealType('visita'); nextStep(); }}
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Feather.Calendar className="w-6 h-6 mx-auto mb-2 text-emerald-400" /> Agendar Visita
        </motion.button>
      </div>
    </div>
  );
};

// Summary (Estilo Dashboard)
function StepSummary({
  formData, files, dealType, paymentType
}: { formData: FormData; files: Files; dealType: string; paymentType: string; }) {
  const interestedCar = formData.interested_vehicles[0];

  const renderFinancingDetails = () => (
    <>
      <h4 className="font-semibold text-slate-100 mt-2">Detalhes do Financiamento:</h4>
      <p className="text-slate-400">Entrada: <span className="font-medium text-slate-100">{formData.financing_details.entry ? formatCurrency(formData.financing_details.entry) : 'Não informado'}</span></p>
      <p className="text-slate-400">Parcelas: <span className="font-medium text-slate-100">{formData.financing_details.parcels}x</span></p>
    </>
  );

  const renderTradeInDetails = () => (
    <>
      <h4 className="font-semibold text-slate-100 mt-2">Veículo da Troca:</h4>
      <p className="text-slate-400">Modelo: <span className="font-medium text-slate-100">{formData.trade_in_car.model}</span></p>
      <p className="text-slate-400">Ano: <span className="font-medium text-slate-100">{formData.trade_in_car.year}</span></p>
      <p className="text-slate-400">Valor Desejado: <span className="font-medium text-slate-100">{formatCurrency(formData.trade_in_car.value)}</span></p>
    </>
  );

  const renderVisitDetails = () => (
    <>
      <h4 className="font-semibold text-slate-100 mt-2">Agendamento:</h4>
      <p className="text-slate-400">Data: <span className="font-medium text-slate-100">{formData.visit_details.day}</span></p>
      <p className="text-slate-400">Horário: <span className="font-medium text-slate-100">{formData.visit_details.time}</span></p>
    </>
  );

  return (
    <div className="space-y-6 bg-slate-900 border border-slate-800 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-slate-50">Revise sua Proposta</h2>

      <div className="border-b border-slate-700 pb-4">
        <h3 className="text-lg font-semibold text-emerald-400">Seus Dados</h3>
        <p className="text-slate-400">Nome: <span className="font-medium text-slate-100">{formData.name}</span></p>
        <p className="text-slate-400">Telefone: <span className="font-medium text-slate-100">{formData.phone}</span></p>
        <p className="text-slate-400">CPF: <span className="font-medium text-slate-100">{formData.cpf}</span></p>
        <p className="text-slate-400">Profissão: <span className="font-medium text-slate-100">{formData.job}</span></p>
      </div>

      {interestedCar && (
        <div className="border-b border-slate-700 pb-4">
          <h3 className="text-lg font-semibold text-emerald-400">Veículo de Interesse</h3>
          <p className="text-slate-400">Modelo: <span className="font-medium text-slate-100">{interestedCar.nome} ({interestedCar.ano})</span></p>
          <p className="text-slate-400">Preço: <span className="font-medium text-slate-100">{formatCurrency(interestedCar.preco)}</span></p>
        </div>
      )}

      <div className="border-b border-slate-700 pb-4">
        <h3 className="text-lg font-semibold text-emerald-400">Detalhes da Negociação</h3>

        {dealType === 'visita' && (
          <>
            <p className="text-slate-400">Tipo: <span className="font-medium text-slate-100">Agendamento de Visita</span></p>
            {renderVisitDetails()}
          </>
        )}

        {dealType === 'comum' && (
          <>
            <p className="text-slate-400">Tipo: <span className="font-medium text-slate-100">Proposta de Compra</span></p>
            <p className="text-slate-400">Pagamento: <span className="font-medium text-slate-100">{paymentType === 'a_vista' ? 'À Vista' : 'Financiamento'}</span></p>
            {paymentType === 'financiamento' && renderFinancingDetails()}
          </>
        )}

        {dealType === 'troca' && (
          <>
            <p className="text-slate-400">Tipo: <span className="font-medium text-slate-100">Proposta de Troca</span></p>
            {renderTradeInDetails()}
            <h4 className="font-semibold text-slate-100 mt-2">Pagamento da Diferença:</h4>
            <p className="text-slate-400">Método: <span className="font-medium text-slate-100">{paymentType === 'a_vista' ? 'À Vista' : 'Financiamento'}</span></p>
            {paymentType === 'financiamento' && renderFinancingDetails()}
          </>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-emerald-400">Arquivos Enviados (Opcional)</h3>
        <p className="text-slate-400">Documentos: <span className="font-medium text-slate-100">{files.documents.length > 0 ? `${files.documents.length} arquivo(s)` : 'Nenhum'}</span></p>
        <p className="text-slate-400">Fotos da Troca: <span className="font-medium text-slate-100">{files.trade_in_photos.length > 0 ? `${files.trade_in_photos.length} arquivo(s)` : 'Nenhum'}</span></p>
      </div>
    </div>
  );
}

// Estado inicial
const initialFormData: FormData = {
  name: '', phone: '', cpf: '', job: '', state: 'inicial',
  interested_vehicles: [],
  trade_in_car: { model: '', year: '', value: '' },
  financing_details: { entry: '', parcels: '' },
  visit_details: { day: '', time: '' }
};
const initialFiles: Files = { documents: [], trade_in_photos: [] };

// Página principal
export function PublicCarFormPage() {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast(); // Usa o hook local
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [dealType, setDealType] = useState<'comum' | 'troca' | 'visita' | ''>('');
  const [paymentType, setPaymentType] = useState<'a_vista' | 'financiamento' | ''>('');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [files, setFiles] = useState<Files>(initialFiles);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const { data: interestedCar, isLoading: isLoadingCar, error: errorCar } = useQuery<Car>({
    queryKey: ['carDetails', carId],
    queryFn: () => fetchCarDetails(carId!),
    enabled: !!carId
  });

  useEffect(() => {
    if (interestedCar) {
      setFormData((prev) => ({ ...prev, interested_vehicles: [interestedCar] }));
    }
  }, [interestedCar]);

  // ✅ Mutação: insere diretamente na tabela `clients` com `id` gerado
  const mutation = useMutation({
    mutationFn: async ({
      clientPayload,
      lojaId,
    }: { clientPayload: ClientPayload; lojaId: string }) => {
      // Monta o objeto exatamente como o schema espera
      const rowToInsert = {
        id: clientPayload.id,                           // 👈 OBRIGATÓRIO (não há DEFAULT no BD)
        chat_id: clientPayload.chat_id,                 // NOT NULL UNIQUE
        name: clientPayload.name ?? null,
        phone: clientPayload.phone ?? null,
        cpf: clientPayload.cpf ?? null,
        job: clientPayload.job ?? null,
        state: 'proposta_web',
        payment_method: clientPayload.payment_method ?? null,
        rg_number: null,
        incomeProof: null,
        rg_photo: null,
        visit_details: clientPayload.visit_details ?? null, // jsonb
        bot_data: clientPayload.bot_data ?? null,           // jsonb
        deal_type: clientPayload.deal_type ?? null,
        financing_details: clientPayload.financing_details ?? '',   // text NOT NULL DEFAULT ''
        interested_vehicles: clientPayload.interested_vehicles ?? '', // text NOT NULL DEFAULT ''
        trade_in_car: clientPayload.trade_in_car ?? '',           // text NOT NULL DEFAULT ''
        loja_id: lojaId ?? null
      };

      const { error } = await supabase.from('clients').insert(rowToInsert);
      if (error) {
        // repassa o mesmo formato do seu service anterior
        throw new Error(`Erro ao salvar formulário: ${error.message}`);
      }
      return true;
    },
    onSuccess: () => {
      toast({ title: 'Sucesso!', description: 'Proposta enviada com sucesso.', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['carDetails', carId] });
      if (interestedCar && interestedCar.loja_id) {
        navigate(`/catalogo-loja/${interestedCar.loja_id}`);
      } else {
        navigate('/');
      }
    },
    onError: (error: any) => {
      console.error('Erro ao enviar proposta:', error);
      toast({ title: 'Erro!', description: error?.message || 'Falha ao enviar a proposta.', variant: 'destructive' });
    }
  });

  // Compressão de imagens (mantida)
  const compressImage = async (imageFile: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.9
    };
    try {
      const compressedFile = await imageCompression(imageFile, options);
      return compressedFile as File;
    } catch (error) {
      console.error('Erro ao comprimir imagem, enviando original:', error);
      return imageFile;
    }
  };

  const handleInputChange = (path: keyof FormData | string, value: any) => {
    setValidationError(null);
    setFormData((prev) => {
      const keys = path.split('.');
      const newState = JSON.parse(JSON.stringify(prev));
      let current: any = newState;
      for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const handleFileChange = async (type: keyof Files, fileList: FileList | null) => {
    setValidationError(null);
    if (!fileList || fileList.length === 0) {
      setFiles((prev) => ({ ...prev, [type]: [] }));
      return;
    }
    const filesToCompress = Array.from(fileList);
    setIsCompressing(true);

    const fileTypeDescription = type === 'documents' ? 'documentos' : 'fotos da troca';
    toast({
      title: 'Preparando arquivos...',
      description: `Comprimindo ${filesToCompress.length} ${fileTypeDescription}...`,
      duration: filesToCompress.length * 1500,
      variant: 'default',
    });

    try {
      const compressedImagesPromises = filesToCompress.map((file) => compressImage(file));
      const compressedImages = await Promise.all(compressedImagesPromises);
      setFiles((prev) => ({ ...prev, [type]: compressedImages }));
      toast({ title: 'Arquivos prontos!', description: 'Arquivos otimizados e adicionados.', duration: 3000, variant: 'success' });
    } catch {
      toast({ title: 'Erro ao processar arquivos', description: 'Alguns arquivos podem não ter sido processados.', variant: 'destructive' });
    } finally {
      setIsCompressing(false);
    }
  };

  // Fluxo de passos
  const flowSteps = useMemo(() => {
    if (!interestedCar) return [];
    const personal = { id: 'personal', title: 'Seus Dados', icon: Feather.UserPlus };
    const documents = { id: 'documents', title: 'Envio de Documentos (Opcional)', icon: Feather.FileText };
    const tradeDetails = { id: 'trade_details', title: 'Detalhes da Troca', icon: Feather.RefreshCw };
    const tradePhotos = { id: 'trade_photos', title: 'Fotos da Troca (Opcional)', icon: Feather.Upload };
    const paymentTypeStep = { id: 'payment_type', title: 'Forma de Pagamento', icon: Feather.DollarSign };
    const financing = { id: 'financing', title: 'Financiamento', icon: Feather.DollarSign };
    const visitDetails = { id: 'visit_details', title: 'Agendar Visita', icon: Feather.Calendar };
    const summary = { id: 'summary', title: 'Revisão e Envio', icon: Feather.Check };

    let steps: any[] = [personal];

    if (dealType === 'troca') {
      steps.push(documents, tradeDetails, tradePhotos);
      const tradeInValue = parseCurrency(formData.trade_in_car.value);
      const interestedCarPrice = interestedCar ? parseCurrency(interestedCar.preco) : 0;
      if (interestedCar && interestedCarPrice > tradeInValue) {
        steps.push({ id: 'troca_payment_type', title: 'Pagamento da Diferença', icon: Feather.DollarSign });
        if (paymentType === 'financiamento') steps.push(financing);
      }
    } else if (dealType === 'comum') {
      steps.push(documents, paymentTypeStep);
      if (paymentType === 'financiamento') steps.push(financing);
    } else if (dealType === 'visita') {
      steps.push(visitDetails);
    }

    return dealType ? [...steps, summary] : [];
  }, [dealType, paymentType, formData.trade_in_car.value, interestedCar]);

  // Validação
  const validateStep = (): boolean => {
    const currentStepId = flowSteps[step - 1]?.id;
    if (!currentStepId) return true;

    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

    switch (currentStepId) {
      case 'personal':
        if (!formData.name.trim()) { setValidationError('Nome é obrigatório.'); return false; }
        if (!formData.job.trim()) { setValidationError('Profissão é obrigatória.'); return false; }
        if (!phoneRegex.test(formData.phone)) { setValidationError('Telefone inválido. Formato: (99) 99999-9999.'); return false; }
        if (!cpfRegex.test(formData.cpf)) { setValidationError('CPF inválido. Formato: 999.999.999-99.'); return false; }
        break;
      case 'documents':
        if (isCompressing) { setValidationError('Aguarde o processamento dos arquivos...'); return false; }
        break;
      case 'trade_details':
        if (!formData.trade_in_car.model.trim()) { setValidationError('Modelo do carro de troca é obrigatório.'); return false; }
        if (!/^\d{4}$/.test(formData.trade_in_car.year)) { setValidationError('Ano do carro de troca inválido (use 4 dígitos).'); return false; }
        if (!formData.trade_in_car.value.trim()) { setValidationError('O valor desejado na troca é obrigatório.'); return false; }
        break;
      case 'trade_photos':
        if (isCompressing) { setValidationError('Aguarde o processamento das fotos...'); return false; }
        break;
      case 'financing': {
        const entryValue = parseCurrency(formData.financing_details.entry);
        const carPrice = interestedCar ? parseCurrency(interestedCar.preco) : 0;
        if (entryValue >= carPrice && carPrice > 0) { setValidationError('A entrada não pode ser maior ou igual ao valor do veículo.'); return false; }
        if (!formData.financing_details.parcels) { setValidationError('Selecione o número de parcelas.'); return false; }
        break;
      }
      case 'visit_details':
        if (!formData.visit_details.day || !formData.visit_details.time) { setValidationError('Data e horário da visita são obrigatórios.'); return false; }
        break;
    }
    setValidationError(null);
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((prev) => prev + 1); };
  const prevStep = () => { setStep((prev) => prev - 1); setValidationError(null); };

  // Submit: monta payload e insere
  const handleSubmit = () => {
    if (!validateStep()) return;
    if (!interestedCar?.loja_id) {
      toast({ title: 'Erro', description: 'O ID da loja não foi carregado. Tente novamente.', variant: 'destructive' });
      return;
    }
    const finalDealType = dealType === 'comum' ? paymentType : dealType;

    const payload: ClientPayload = {
      id: crypto.randomUUID(),               // ✅ necessário porque sua tabela não tem DEFAULT para id
      chat_id: formData.phone,               // NOT NULL UNIQUE (você já usa o telefone)
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
      job: formData.job,
      state: 'proposta_web',
      deal_type: finalDealType,
      payment_method: paymentType,

      // Campos text no BD (stringify)
      interested_vehicles: JSON.stringify(formData.interested_vehicles ?? []),
      trade_in_car: JSON.stringify(formData.trade_in_car ?? {}),
      financing_details: JSON.stringify(formData.financing_details ?? {}),

      // jsonb e auxiliares
      visit_details: formData.visit_details ?? null,
      bot_data: {
        state: 'proposta_web',
        deal_type: finalDealType,
        interested_vehicles: formData.interested_vehicles,
        financing_details: formData.financing_details,
        visit_details: formData.visit_details,
        trade_in_car: { ...formData.trade_in_car, photos: [] }
      }
    };

    mutation.mutate({ clientPayload: payload, lojaId: interestedCar.loja_id });
  };

  if (isLoadingCar) return <div className="text-center py-20 text-slate-400 bg-slate-950 min-h-screen">Carregando detalhes do veículo...</div>;
  if (errorCar || !interestedCar) return <div className="text-center py-20 text-red-400 bg-slate-950 min-h-screen">Veículo não encontrado ou link inválido.</div>;

  const renderCurrentStep = () => {
    if (step === 0) return <StepDealType setDealType={(type) => { setDealType(type); setStep(1); }} nextStep={() => { }} />;
    const currentStepConfig = flowSteps[step - 1];
    if (!currentStepConfig) return null;
    const tradeInValue = dealType === 'troca' ? parseCurrency(formData.trade_in_car.value) : 0;

    switch (currentStepConfig.id) {
      case 'personal':
        return <StepPersonalData formData={formData} handleInputChange={handleInputChange} />;
      case 'documents':
        return <StepFileUpload fileKey="documents" files={files.documents} handleFileChange={handleFileChange} description="Envie fotos dos documentos (RG, CPF/CNH) para análise de crédito. (Opcional)" />;
      case 'trade_details':
        return <StepTradeDetails formData={formData} handleInputChange={handleInputChange} />;
      case 'trade_photos':
        return <StepFileUpload fileKey="trade_in_photos" files={files.trade_in_photos} handleFileChange={handleFileChange} description="Envie fotos do seu veículo para avaliação (Troca). (Opcional)" />;
      case 'visit_details':
        return <StepVisitDetails formData={formData} handleInputChange={handleInputChange} />;
      case 'payment_type':
        return <StepPaymentType setPaymentType={(type) => { setPaymentType(type); nextStep(); }} nextStep={nextStep} />;
      case 'troca_payment_type':
        return <StepPaymentType setPaymentType={(type) => { setPaymentType(type); nextStep(); }} nextStep={nextStep} title="Como será pago o valor restante (diferença)?" />;
      case 'financing':
        return <StepFinancing formData={formData} handleInputChange={handleInputChange} carPrice={parseCurrency(interestedCar.preco)} tradeInValue={tradeInValue} />;
      case 'summary':
        return <StepSummary formData={formData} files={files} dealType={dealType!} paymentType={paymentType!} />;
      default:
        return null;
    }
  };

  const progressValue = dealType ? (step / (flowSteps.length)) * 100 : 0;

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 font-poppins bg-slate-950 text-slate-50 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      {/* Header */}
      <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-slate-800">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-50">Proposta de Interesse</h1>
          <h2 className="text-xl font-semibold text-slate-100">
            Veículo: <span className="text-emerald-400">{interestedCar.nome} ({interestedCar.ano})</span>
          </h2>
        </div>

        <Link
          to={`/catalogo-loja/${interestedCar.loja_id}`}
          className="flex-shrink-0 flex items-center px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-all group"
        >
          <Feather.BookOpen className="w-4 h-4 mr-2 group-hover:text-emerald-300 transition-colors" />
          <span className="group-hover:text-emerald-300 transition-colors">Ver Catálogo da Loja</span>
        </Link>
      </div>

      {/* Card veículo */}
      <div className="p-4">
        <CarDetailsDisplay vehicle={interestedCar} />
      </div>

      {/* Barra de progresso */}
      {progressValue > 0 && (
        <div className="px-4">
          <Progress value={progressValue} className="w-full h-2 bg-slate-800 [&>div]:bg-emerald-500" />
          <p className="text-slate-400 text-sm mt-1">
            {step > 0 && flowSteps[step - 1] ? `Passo ${step} de ${flowSteps.length}: ${flowSteps[step - 1].title}` : 'Selecione o tipo de negócio'}
          </p>
        </div>
      )}

      {/* Erros de validação */}
      {validationError && (
        <motion.p
          className="text-sm font-medium text-red-400 bg-red-500/15 border border-red-500/30 p-3 rounded-md mx-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Feather.AlertTriangle className="mr-2 h-4 w-4 inline" /> <strong>Erro:</strong> {validationError}
        </motion.p>
      )}

      {/* Conteúdo atual */}
      <div className="px-4">{renderCurrentStep()}</div>

      {/* Navegação */}
      <motion.div className="flex justify-between mt-6 px-4" variants={fadeInUp}>
        {step > 1 ? (
          <motion.button
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100 transition-all flex items-center disabled:opacity-60"
            onClick={prevStep}
            type="button"
            disabled={mutation.isPending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Feather.ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </motion.button>
        ) : <div />}

        {step > 0 && step < flowSteps.length && (
          <motion.button
            className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition-all flex items-center disabled:bg-emerald-700 disabled:text-slate-400 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(16,185,129,0.4)]"
            onClick={nextStep}
            type="button"
            disabled={isCompressing || mutation.isPending}
            whileHover={isCompressing ? {} : { scale: 1.05 }}
            whileTap={isCompressing ? {} : { scale: 0.95 }}
          >
            {isCompressing ? (
              <>
                <Feather.Loader className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Avançar <Feather.ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </motion.button>
        )}

        {step > 0 && step === flowSteps.length && (
          <motion.button
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500 transition-all disabled:bg-green-800 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(22,163,74,0.4)]"
            onClick={handleSubmit}
            type="button"
            disabled={mutation.isPending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mutation.isPending ? 'Enviando Proposta...' : 'Enviar Proposta'}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

// Wrapper com o Provedor de Toast
export default function PublicCarFormPageWithToast() {
  return (
    <ToastProvider>
      <PublicCarFormPage />
    </ToastProvider>
  );
}