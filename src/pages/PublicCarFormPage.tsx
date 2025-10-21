// src/pages/PublicCarFormPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import * as Feather from 'react-feather';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

// Importe os componentes e tipos necessários
import {
    StepPersonalData, StepFileUpload, StepPaymentType, StepFinancing,
    StepTradeDetails, StepVisitDetails,
    FormData, ClientPayload, Car, Files
    // O 'StepSummary' foi removido daqui pois criamos uma versão local corrigida
} from '../components/AddClient'; // Ajuste o caminho se necessário

// Importe as funções da API
import { fetchCarDetails, createClient } from '@/services/api';

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } } };

// --- FUNÇÕES AUXILIARES ---
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

// --- COMPONENTE INTEGRADO DE DETALHES DO VEÍCULO ---
function CarDetailsDisplay({ vehicle }: { vehicle: Car }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const navigateGallery = (direction: number) => {
        if (!vehicle?.imagens) return;
        const newIndex = (currentImageIndex + direction + vehicle.imagens.length) % vehicle.imagens.length;
        setCurrentImageIndex(newIndex);
    };

    const toggleDescription = () => {
        setIsDescriptionExpanded(!isDescriptionExpanded);
    };

    const currentImages = vehicle.imagens || [];

    return (
        <div className="bg-white/70 p-6 rounded-lg border border-zinc-200 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna da Galeria de Imagens */}
                <div className="space-y-4">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200">
                        {currentImages.length > 0 ? (
                            <img src={currentImages[currentImageIndex]} alt="Imagem principal do veículo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-600">Sem imagem</div>
                        )}
                        {currentImages.length > 1 && (
                            <>
                                <motion.button
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full border border-zinc-200 text-amber-500 hover:bg-zinc-100"
                                    onClick={() => navigateGallery(-1)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Feather.ChevronLeft className="w-5 h-5" />
                                </motion.button>
                                <motion.button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full border border-zinc-200 text-amber-500 hover:bg-zinc-100"
                                    onClick={() => navigateGallery(1)}
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
                            <div key={index} className="relative">
                                <img
                                    src={img}
                                    onClick={() => setCurrentImageIndex(index)}
                                    alt={`Thumbnail ${index + 1} do veículo`}
                                    className={`w-full aspect-square object-cover rounded-md cursor-pointer border-2 ${currentImageIndex === index ? 'border-amber-500' : 'border-transparent'}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coluna de Informações */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-zinc-800 font-medium">Preço</p>
                            <p className="text-2xl font-bold text-amber-500">{formatCurrency(vehicle.preco || 0)}</p>
                        </div>
                        <div>
                            <p className="text-zinc-800 font-medium">Ano</p>
                            <p className="font-semibold text-zinc-800 text-2xl">{vehicle.ano}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-zinc-800 font-medium">Descrição</p>
                        <p className={`text-zinc-600 whitespace-pre-wrap transition-all duration-300 ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}>
                            {vehicle.descricao || 'Nenhuma descrição disponível.'}
                        </p>
                        {vehicle.descricao && vehicle.descricao.length > 200 && (
                            <button
                                onClick={toggleDescription}
                                className="text-amber-600 font-semibold text-sm mt-2 hover:underline"
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

// --- COMPONENTE LOCAL DE TIPO DE NEGÓCIO ---
const StepDealType = ({ setDealType, nextStep }: { setDealType: (type: 'comum' | 'troca' | 'visita') => void; nextStep: () => void }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">Selecione o Tipo de Negócio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button className="p-4 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-amber-100 hover:border-amber-500 transition-all" onClick={() => { setDealType('comum'); nextStep(); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Feather.ShoppingCart className="w-6 h-6 mx-auto mb-2" /> Compra
                </motion.button>
                <motion.button className="p-4 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-amber-100 hover:border-amber-500 transition-all" onClick={() => { setDealType('troca'); nextStep(); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Feather.RefreshCw className="w-6 h-6 mx-auto mb-2" /> Troca
                </motion.button>
                <motion.button className="p-4 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-amber-100 hover:border-amber-500 transition-all" onClick={() => { setDealType('visita'); nextStep(); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Feather.Calendar className="w-6 h-6 mx-auto mb-2" /> Agendar Visita
                </motion.button>
            </div>
        </div>
    );
};

// --- [INÍCIO] COMPONENTE DE SUMMARY CORRIGIDO ---
// (Substitui o 'StepSummary' importado que estava faltando informações)
function StepSummary({ formData, files, dealType, paymentType }: { formData: FormData; files: Files; dealType: string; paymentType: string; }) {
    const interestedCar = formData.interested_vehicles[0]; // Assumindo que sempre há um

    const renderFinancingDetails = () => (
        <>
            <h4 className="font-semibold text-zinc-800 mt-2">Detalhes do Financiamento:</h4>
            <p className="text-zinc-600">Entrada: <span className="font-medium">{formatCurrency(formData.financing_details.entry)}</span></p>
            <p className="text-zinc-600">Parcelas: <span className="font-medium">{formData.financing_details.parcels}x</span></p>
        </>
    );

    const renderTradeInDetails = () => (
        <>
            <h4 className="font-semibold text-zinc-800 mt-2">Veículo da Troca:</h4>
            <p className="text-zinc-600">Modelo: <span className="font-medium">{formData.trade_in_car.model}</span></p>
            <p className="text-zinc-600">Ano: <span className="font-medium">{formData.trade_in_car.year}</span></p>
            <p className="text-zinc-600">Valor Desejado: <span className="font-medium">{formatCurrency(formData.trade_in_car.value)}</span></p>
        </>
    );

    const renderVisitDetails = () => (
         <>
            <h4 className="font-semibold text-zinc-800 mt-2">Agendamento:</h4>
            <p className="text-zinc-600">Data: <span className="font-medium">{formData.visit_details.day}</span></p>
            <p className="text-zinc-600">Horário: <span className="font-medium">{formData.visit_details.time}</span></p>
        </>
    );

    return (
        <div className="space-y-6 bg-white border border-zinc-200 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-zinc-900">Revise sua Proposta</h2>
            
            {/* Dados Pessoais */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-amber-600">Seus Dados</h3>
                <p className="text-zinc-600">Nome: <span className="font-medium">{formData.name}</span></p>
                <p className="text-zinc-600">Telefone: <span className="font-medium">{formData.phone}</span></p>
                <p className="text-zinc-600">CPF: <span className="font-medium">{formData.cpf}</span></p>
                <p className="text-zinc-600">Profissão: <span className="font-medium">{formData.job}</span></p>
            </div>

            {/* Veículo de Interesse */}
            {interestedCar && (
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-amber-600">Veículo de Interesse</h3>
                    <p className="text-zinc-600">Modelo: <span className="font-medium">{interestedCar.nome} ({interestedCar.ano})</span></p>
                    <p className="text-zinc-600">Preço: <span className="font-medium">{formatCurrency(interestedCar.preco)}</span></p>
                </div>
            )}

            {/* Detalhes da Negociação */}
            <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-amber-600">Detalhes da Negociação</h3>
                
                {dealType === 'visita' && (
                    <>
                        <p className="text-zinc-600">Tipo: <span className="font-medium">Agendamento de Visita</span></p>
                        {renderVisitDetails()}
                    </>
                )}
                
                {dealType === 'comum' && (
                    <>
                        <p className="text-zinc-600">Tipo: <span className="font-medium">Proposta de Compra</span></p>
                        <p className="text-zinc-600">Pagamento: <span className="font-medium">{paymentType === 'a_vista' ? 'À Vista' : 'Financiamento'}</span></p>
                        {paymentType === 'financiamento' && renderFinancingDetails()}
                    </>
                )}

                {dealType === 'troca' && (
                    <>
                        <p className="text-zinc-600">Tipo: <span className="font-medium">Proposta de Troca</span></p>
                        {renderTradeInDetails()}
                        <h4 className="font-semibold text-zinc-800 mt-2">Pagamento da Diferença:</h4>
                         <p className="text-zinc-600">Método: <span className="font-medium">{paymentType === 'a_vista' ? 'À Vista' : 'Financiamento'}</span></p>
                        {paymentType === 'financiamento' && renderFinancingDetails()}
                    </>
                )}
            </div>

            {/* Arquivos */}
            <div>
                 <h3 className="text-lg font-semibold text-amber-600">Arquivos Enviados (Opcional)</h3>
                 <p className="text-zinc-600">Documentos: <span className="font-medium">{files.documents.length > 0 ? `${files.documents.length} arquivo(s)` : 'Nenhum'}</span></p>
                 <p className="text-zinc-600">Fotos da Troca: <span className="font-medium">{files.trade_in_photos.length > 0 ? `${files.trade_in_photos.length} arquivo(s)` : 'Nenhum'}</span></p>
            </div>
        </div>
    );
}
// --- [FIM] COMPONENTE DE SUMMARY CORRIGIDO ---


// --- ESTADO INICIAL DO FORMULÁRIO ---
const initialFormData: FormData = {
    name: '', phone: '', cpf: '', job: '', state: 'inicial',
    interested_vehicles: [],
    trade_in_car: { model: '', year: '', value: '' },
    financing_details: { entry: '', parcels: '' },
    visit_details: { day: '', time: '' },
};
const initialFiles: Files = { documents: [], trade_in_photos: [] };


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export function PublicCarFormPage() {
    const { carId } = useParams<{ carId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(0);
    const [dealType, setDealType] = useState<'comum' | 'troca' | 'visita' | ''>('');
    const [paymentType, setPaymentType] = useState<'a_vista' | 'financiamento' | ''>('');
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [files, setFiles] = useState<Files>(initialFiles);
    const [validationError, setValidationError] = useState<string | null>(null);

    const { data: interestedCar, isLoading: isLoadingCar, error: errorCar } = useQuery<Car>({
        queryKey: ['carDetails', carId],
        queryFn: () => fetchCarDetails(carId!),
        enabled: !!carId,
    });

    useEffect(() => {
        if (interestedCar) {
            setFormData(prev => ({ ...prev, interested_vehicles: [interestedCar] }));
        }
    }, [interestedCar]);

    const mutation = useMutation({
        mutationFn: ({ clientPayload, files, lojaId }: { clientPayload: ClientPayload; files: Files; lojaId: string }) =>
            createClient({ clientPayload, files, lojaId }),
        onSuccess: () => {
            toast({ title: "Sucesso!", description: "Proposta enviada com sucesso." });
            queryClient.invalidateQueries({ queryKey: ['carDetails', carId] });
            navigate('/');
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

    const validateStep = (): boolean => {
        const currentStepId = flowSteps[step - 1]?.id;
        if (!currentStepId) return true;

        const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

        switch (currentStepId) {
            case 'personal':
                if (!formData.name.trim()) {
                    setValidationError("Nome é obrigatório.");
                    return false;
                }
                if (!formData.job.trim()) {
                    setValidationError("Profissão é obrigatória.");
                    return false;
                }
                if (!phoneRegex.test(formData.phone)) {
                    setValidationError("Telefone inválido. Formato esperado: (99) 99999-9999.");
                    return false;
                }
                if (!cpfRegex.test(formData.cpf)) {
                    setValidationError("CPF inválido. Formato esperado: 999.999.999-99.");
                    return false;
                }
                break;
            case 'documents':
                // Validação de documentos removida (não é mais obrigatório)
                break;
            case 'trade_details':
                if (!formData.trade_in_car.model.trim()) {
                    setValidationError("Modelo do carro de troca é obrigatório.");
                    return false;
                }
                if (!/^\d{4}$/.test(formData.trade_in_car.year)) {
                    setValidationError("Ano do carro de troca inválido (use 4 dígitos).");
                    return false;
                }
                if (!formData.trade_in_car.value.trim()) {
                    setValidationError("O valor desejado na troca é obrigatório.");
                    return false;
                }
                break;
            case 'trade_photos':
                 // Validação de fotos da troca removida (não é mais obrigatório)
                break;
            case 'financing':
                const entryValue = parseCurrency(formData.financing_details.entry);
                const carPrice = interestedCar ? parseCurrency(interestedCar.preco) : 0;
                if (formData.financing_details.entry.trim() === '') {
                    setValidationError("O valor de entrada é obrigatório.");
                    return false;
                }
                if (entryValue >= carPrice && carPrice > 0) {
                    setValidationError("A entrada não pode ser maior ou igual ao valor do veículo.");
                    return false;
                }
                if (!formData.financing_details.parcels) {
                    setValidationError("Selecione o número de parcelas.");
                    return false;
                }
                break;
            case 'visit_details':
                if (!formData.visit_details.day || !formData.visit_details.time) {
                    setValidationError("Data e horário da visita são obrigatórios.");
                    return false;
                }
                break;
        }
        setValidationError(null);
        return true;
    };

    const nextStep = () => { if (validateStep()) setStep(prev => prev + 1); };
    const prevStep = () => { setStep(prev => prev - 1); setValidationError(null); };

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

        // O payload aqui já estava correto, enviando todos os dados.
        // Se o PDF está errado, o problema é no backend.
        const payload: ClientPayload = {
            name: formData.name, phone: formData.phone, cpf: formData.cpf, job: formData.job,
            state: 'proposta_web', deal_type: finalDealType, payment_method: paymentType,
            interested_vehicles: formData.interested_vehicles,
            trade_in_car: formData.trade_in_car, // Já estava sendo enviado
            financing_details: formData.financing_details, // Já estava sendo enviado
            visit_details: formData.visit_details, // Já estava sendo enviado
            bot_data: {
                state: 'proposta_web', deal_type: finalDealType, interested_vehicles: formData.interested_vehicles,
                financing_details: formData.financing_details,
                visit_details: formData.visit_details,
                trade_in_car: { ...formData.trade_in_car, photos: [] },
            }
        };
        mutation.mutate({ clientPayload: payload, files, lojaId: interestedCar.loja_id });
    };

    if (isLoadingCar) return <div className="text-center py-20 text-zinc-600">Carregando detalhes do veículo...</div>;
    if (errorCar || !interestedCar) return <div className="text-center py-20 text-red-500">Veículo não encontrado ou link inválido.</div>;

    const renderCurrentStep = () => {
        if (step === 0) return <StepDealType setDealType={(type) => { setDealType(type); setStep(1); }} nextStep={() => {}} />;
        const currentStepConfig = flowSteps[step - 1];
        if (!currentStepConfig) return null;
        const tradeInValue = dealType === 'troca' ? parseCurrency(formData.trade_in_car.value) : 0;
        switch (currentStepConfig.id) {
            case 'personal': return <StepPersonalData formData={formData} handleInputChange={handleInputChange} />;
            case 'documents': return <StepFileUpload fileKey="documents" files={files.documents} handleFileChange={handleFileChange} description="Envie fotos dos documentos (RG, CPF/CNH) para análise de crédito. (Opcional)" />;
            case 'trade_details': return <StepTradeDetails formData={formData} handleInputChange={handleInputChange} />;
            case 'trade_photos': return <StepFileUpload fileKey="trade_in_photos" files={files.trade_in_photos} handleFileChange={handleFileChange} description="Envie fotos do seu veículo para avaliação (Troca). (Opcional)" />;
            case 'visit_details': return <StepVisitDetails formData={formData} handleInputChange={handleInputChange} />;
            case 'payment_type': return <StepPaymentType setPaymentType={(type) => { setPaymentType(type); nextStep(); }} nextStep={nextStep} />;
            case 'troca_payment_type': return <StepPaymentType setPaymentType={(type) => { setPaymentType(type); nextStep(); }} nextStep={nextStep} title="Como será pago o valor restante (diferença)?" />;
            case 'financing': return <StepFinancing formData={formData} handleInputChange={handleInputChange} carPrice={parseCurrency(interestedCar.preco)} tradeInValue={tradeInValue} />;
            // Esta linha agora usa o componente local 'StepSummary' que criamos acima
            case 'summary': return <StepSummary formData={formData} files={files} dealType={dealType!} paymentType={paymentType!} />;
            default: return null;
        }
    };

    const progressValue = dealType ? ((step) / (flowSteps.length)) * 100 : 0;

    return (
        <motion.div
            className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 font-poppins bg-white/70 min-h-screen"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
        >
            <div className="space-y-3 p-4 border-b border-zinc-200">
                <h1 className="text-3xl font-bold text-zinc-900">Proposta de Interesse</h1>
                <h2 className="text-xl font-semibold text-zinc-800">
                    Veículo: <span className="text-amber-600">{interestedCar.nome} ({interestedCar.ano})</span>
                </h2>
            </div>

            <div className="p-4">
                <CarDetailsDisplay vehicle={interestedCar} />
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
                    className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md mx-4"
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
                    <motion.button className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all flex items-center" onClick={prevStep} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Feather.ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </motion.button>
                ) : <div />}

                {step > 0 && step < flowSteps.length && (
                    <motion.button className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all flex items-center" onClick={nextStep} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        Avançar <Feather.ArrowRight className="ml-2 h-4 w-4" />
                    </motion.button>
                )}

                {step > 0 && step === flowSteps.length && (
                    <motion.button className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all disabled:bg-green-300 disabled:cursor-not-allowed" onClick={handleSubmit} disabled={mutation.isPending} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {mutation.isPending ? 'Enviando Proposta...' : 'Enviar Proposta'}
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    );
}

export default PublicCarFormPage;