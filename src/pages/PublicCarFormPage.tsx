import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

// Import components and types from AddClient.tsx (excluding StepDealType)
import { 
  StepPersonalData, StepFileUpload, StepPaymentType, StepFinancing, StepSummary,
  StepTradeDetails, StepVisitDetails, parseCurrency, formatCurrency,
  FormData, ClientPayload, Car, Files
} from '../components/AddClient'; // Adjust path if needed

// Import API functions
import { fetchCarDetails, createClient } from '@/services/api'; 

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } } };

// Define StepDealType component locally to fix the missing export error
const StepDealType = ({ setDealType, nextStep }: { setDealType: (type: 'comum' | 'troca' | 'visita') => void; nextStep: () => void }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900">Selecione o Tipo de Negócio</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          className="p-4 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-amber-100 hover:border-amber-500 transition-all"
          onClick={() => { setDealType('comum'); nextStep(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Feather.ShoppingCart className="w-6 h-6 mx-auto mb-2" />
          Compra Comum
        </motion.button>
        <motion.button
          className="p-4 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-amber-100 hover:border-amber-500 transition-all"
          onClick={() => { setDealType('troca'); nextStep(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Feather.RefreshCw className="w-6 h-6 mx-auto mb-2" />
          Troca
        </motion.button>
        <motion.button
          className="p-4 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-amber-100 hover:border-amber-500 transition-all"
          onClick={() => { setDealType('visita'); nextStep(); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Feather.Calendar className="w-6 h-6 mx-auto mb-2" />
          Agendar Visita
        </motion.button>
      </div>
    </div>
  );
};

// Estado Inicial (baseado no AddClient.tsx)
const initialFormData: FormData = {
  name: '', phone: '', cpf: '', job: '', state: 'inicial',
  interested_vehicles: [],
  trade_in_car: { model: '', year: '', value: '' },
  financing_details: { entry: '', parcels: '' },
  visit_details: { day: '', time: '' },
};
const initialFiles: Files = { documents: [], trade_in_photos: [] };

export function PublicCarFormPage() {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0); // Começa no passo 0 (DealType)
  const [dealType, setDealType] = useState<'comum' | 'troca' | 'visita' | ''>(''); 
  const [paymentType, setPaymentType] = useState<'a_vista' | 'financiamento' | ''>('');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [files, setFiles] = useState<Files>(initialFiles);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch dos detalhes do carro
  const { data: interestedCar, isLoading: isLoadingCar, error: errorCar } = useQuery<Car>({
    queryKey: ['carDetails', carId],
    queryFn: () => fetchCarDetails(carId!), 
    enabled: !!carId,
  });

  // Preencher o veículo de interesse automaticamente
  useEffect(() => {
    if (interestedCar) {
      setFormData(prev => ({ ...prev, interested_vehicles: [interestedCar] }));
    }
  }, [interestedCar]);

  // Mutation for form submission
  const mutation = useMutation({
    mutationFn: ({ clientPayload, files, lojaId }: { clientPayload: ClientPayload; files: Files; lojaId: string }) =>
      createClient({ clientPayload, files, lojaId }),
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Proposta enviada com sucesso." });
      queryClient.invalidateQueries({ queryKey: ['carDetails', carId] });
      navigate('/'); // Redirect to home or another page
    },
    onError: (error: Error) => {
      console.error('Erro ao enviar proposta:', error);
      toast({ title: "Erro!", description: error.message || "Falha ao enviar a proposta.", variant: "destructive" });
    },
  });

  const handleInputChange = (path: keyof FormData | string, value: any) => {
    setValidationError(null);
    setFormData(prev => {
      const keys = path.split('.');
      const newState = JSON.parse(JSON.stringify(prev));
      let current: any = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  const handleFileChange = (type: keyof Files, fileList: FileList | null) => {
    setValidationError(null);
    setFiles(prev => ({ ...prev, [type]: fileList ? Array.from(fileList) : [] }));
  };

  // Lógica de validação adaptada
  const validateStep = (): boolean => {
    const currentStepId = flowSteps[step - 1]?.id;
    if (!currentStepId) return true;

    const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

    switch (currentStepId) {
      case 'personal':
        if (!formData.name.trim()) return !setValidationError("Nome é obrigatório.");
        if (!phoneRegex.test(formData.phone)) return !setValidationError("Telefone inválido. Formato esperado: (99) 99999-9999.");
        if (formData.cpf && !cpfRegex.test(formData.cpf)) return !setValidationError("CPF inválido. Formato esperado: 999.999.999-99.");
        break;
      case 'documents':
        if (files.documents.length === 0) return !setValidationError("É necessário enviar as fotos dos documentos (RG e CPF).");
        break;
      case 'trade_details':
        if (!formData.trade_in_car.model.trim()) return !setValidationError("Modelo do carro de troca é obrigatório.");
        if (!/^\d{4}$/.test(formData.trade_in_car.year)) return !setValidationError("Ano do carro de troca inválido (use 4 dígitos).");
        break;
      case 'trade_photos':
        if (files.trade_in_photos.length === 0) return !setValidationError("É necessário enviar as fotos do carro de troca.");
        break;
      case 'financing':
        const entryValue = parseCurrency(formData.financing_details.entry);
        const carPrice = interestedCar ? parseCurrency(interestedCar.preco) : 0;
        if (entryValue >= carPrice && carPrice > 0) return !setValidationError("A entrada não pode ser maior ou igual ao valor do veículo.");
        if (!formData.financing_details.parcels) return !setValidationError("Selecione o número de parcelas.");
        break;
      case 'visit_details':
        if (!formData.visit_details.day || !formData.visit_details.time) return !setValidationError("Data e horário da visita são obrigatórios.");
        break;
    }
    setValidationError(null);
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(prev => prev + 1); };
  const prevStep = () => { setStep(prev => prev - 1); setValidationError(null); };

  // Lógica de passos
  const flowSteps = useMemo(() => {
    if (!interestedCar) return [];
    const personal = { id: 'personal', title: 'Seus Dados', icon: Feather.UserPlus };
    const documents = { id: 'documents', title: 'Envio de Documentos', icon: Feather.FileText };
    const tradeDetails = { id: 'trade_details', title: 'Detalhes da Troca', icon: Feather.RefreshCw };
    const tradePhotos = { id: 'trade_photos', title: 'Fotos da Troca', icon: Feather.Upload };
    const paymentTypeStep = { id: 'payment_type', title: 'Forma de Pagamento', icon: Feather.DollarSign };
    const financing = { id: 'financing', title: 'Financiamento', icon: Feather.DollarSign };
    const visitDetails = { id: 'visit_details', title: 'Agendar Visita', icon: Feather.Calendar };
    const summary = { id: 'summary', title: 'Revisão e Envio', icon: Feather.Check };

    let steps = [personal];

    if (dealType === 'troca') {
      steps.push(documents, tradeDetails, tradePhotos);
      const tradeInValue = parseCurrency(formData.trade_in_car.value);
      const interestedCarPrice = interestedCar ? parseCurrency(interestedCar.preco) : 0;
      if (interestedCar && interestedCarPrice > tradeInValue) {
        steps.push({ id: 'troca_payment_type', title: 'Pagamento da Diferença', icon: Feather.DollarSign });
        if (paymentType === 'financiamento') {
          steps.push(financing);
        }
      }
    } else if (dealType === 'comum') {
      steps.push(documents, paymentTypeStep);
      if (paymentType === 'financiamento') {
        steps.push(financing);
      }
    } else if (dealType === 'visita') {
      steps.push(visitDetails);
    }

    return dealType ? [...steps, summary] : [];
  }, [dealType, paymentType, formData.trade_in_car.value, interestedCar]);

  const handleSubmit = () => {
    if (!validateStep()) return;
    if (!interestedCar?.loja_id) {
      toast({ title: "Erro", description: "O ID da loja não foi carregado. Tente novamente.", variant: 'destructive' });
      return;
    }

    const finalDealType = dealType === 'comum' ? paymentType : dealType;

    const payload: ClientPayload = {
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
      job: formData.job,
      state: 'proposta_web',
      deal_type: finalDealType,
      payment_method: paymentType,
      interested_vehicles: formData.interested_vehicles,
      trade_in_car: formData.trade_in_car,
      financing_details: formData.financing_details,
      visit_details: formData.visit_details,
      bot_data: { 
        state: 'proposta_web',
        deal_type: finalDealType,
        interested_vehicles: formData.interested_vehicles,
        financing_details: formData.financing_details,
        visit_details: formData.visit_details,
        trade_in_car: { ...formData.trade_in_car, photos: [] },
      }
    };

    mutation.mutate({ clientPayload: payload, files, lojaId: interestedCar.loja_id });
  };

  // Rendering
  if (isLoadingCar) return <div className="text-center py-20 text-zinc-600">Carregando detalhes do veículo...</div>;
  if (errorCar || !interestedCar) return <div className="text-center py-20 text-red-500">Veículo não encontrado ou link inválido.</div>;

  const renderCurrentStep = () => {
    if (step === 0) return <StepDealType setDealType={(type) => { setDealType(type); setStep(1); }} nextStep={() => {}} />;

    const currentStepConfig = flowSteps[step - 1];
    if (!currentStepConfig) return null;

    const tradeInValue = dealType === 'troca' ? parseCurrency(formData.trade_in_car.value) : 0;

    switch (currentStepConfig.id) {
      case 'personal': return <StepPersonalData formData={formData} handleInputChange={handleInputChange} />;
      case 'documents': return <StepFileUpload fileKey="documents" files={files.documents} handleFileChange={handleFileChange} description="Envie fotos dos documentos (RG, CPF/CNH) para análise de crédito." />;
      case 'trade_details': return <StepTradeDetails formData={formData} handleInputChange={handleInputChange} />;
      case 'trade_photos': return <StepFileUpload fileKey="trade_in_photos" files={files.trade_in_photos} handleFileChange={handleFileChange} description="Envie fotos do seu veículo para avaliação (Troca)." />;
      case 'visit_details': return <StepVisitDetails formData={formData} handleInputChange={handleInputChange} />;
      case 'payment_type': return <StepPaymentType setPaymentType={(type) => { setPaymentType(type); nextStep(); }} nextStep={nextStep} />;
      case 'troca_payment_type': return <StepPaymentType setPaymentType={(type) => { setPaymentType(type); nextStep(); }} nextStep={nextStep} title="Como será pago o valor restante (diferença)?" />;
      case 'financing':
        return <StepFinancing 
          formData={formData} 
          handleInputChange={handleInputChange} 
          carPrice={parseCurrency(interestedCar.preco)}
          tradeInValue={tradeInValue}
        />;
      case 'summary': return (
        <StepSummary 
          formData={formData} 
          files={files} 
          dealType={dealType} 
          paymentType={paymentType} 
        />
      );
      default: return null;
    }
  };

  const progressValue = dealType ? ((step) / (flowSteps.length + 1)) * 100 : 0; // +1 para incluir o StepDealType

  return (
    <motion.div 
      className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 font-poppins bg-white/70 min-h-screen"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <div className="space-y-3 p-4 border-b border-zinc-200">
        <h1 className="text-3xl font-bold text-zinc-900">Proposta de Interesse</h1>
        <h2 className="text-xl font-semibold text-amber-600 flex items-center gap-2">
          <Feather.CheckCircle className="h-6 w-6" /> Veículo: **{interestedCar.nome}** ({interestedCar.ano}) - {formatCurrency(interestedCar.preco)}
        </h2>
      </div>
      
      {progressValue > 0 && (
        <div className="px-4">
          <Progress value={progressValue} className="w-full h-2 bg-zinc-200 [&>div]:bg-amber-500" />
          <p className="text-zinc-600 text-sm mt-1">
            {step > 0 && flowSteps[step - 1] ? `Passo ${step} de ${flowSteps.length}: ${flowSteps[step - 1].title}` : 'Selecione o tipo de negócio'}
          </p>
        </div>
      )}

      {validationError && (
        <motion.p 
          className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Feather.AlertTriangle className="mr-2 h-4 w-4 inline" /> **Erro:** {validationError}
        </motion.p>
      )}

      <div className="px-4">{renderCurrentStep()}</div>

      <motion.div 
        className="flex justify-between mt-6 px-4"
        variants={fadeInUp}
      >
        {step > 1 ? (
          <motion.button
            className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all flex items-center"
            onClick={prevStep}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Feather.ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </motion.button>
        ) : <div />}

        {step > 0 && step < flowSteps.length && (
          <motion.button
            className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all flex items-center"
            onClick={nextStep}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Avançar <Feather.ArrowRight className="ml-2 h-4 w-4" />
          </motion.button>
        )}

        {step > 0 && step === flowSteps.length && (
          <motion.button
            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all disabled:bg-green-300 disabled:cursor-not-allowed"
            onClick={handleSubmit}
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

export default PublicCarFormPage;