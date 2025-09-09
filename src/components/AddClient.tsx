import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InputMask from 'react-input-mask';
import { supabase } from '@/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

// Importe seus componentes UI (ex: shadcn/ui)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import * as Feather from 'react-feather';

// Importe as funções da API e os tipos do novo arquivo de serviço
import { fetchAvailableCars, createClient, Car, Files, ClientPayload } from '@/services/api';

// --- Tipos e Interfaces ---
interface FormData {
    name: string;
    phone: string;
    cpf: string;
    job: string;
    state: string;
    interested_vehicles: Car[];
    trade_in_car: {
        model: string;
        year: string;
        value: string;
    };
    financing_details: {
        entry: string;
        parcels: string;
    };
    visit_details: {
        day: string;
        time: string;
    };
}

// --- Funções Auxiliares ---
const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value || typeof value !== 'string') return 0;
    return Number(String(value).replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
};

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- Animações ---
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
};

// --- Estado Inicial ---
const initialFormData: FormData = {
    name: '', phone: '', cpf: '', job: '', state: 'inicial',
    interested_vehicles: [],
    trade_in_car: { model: '', year: '', value: '' },
    financing_details: { entry: '', parcels: '' },
    visit_details: { day: '', time: '' },
};
const initialFiles: Files = { documents: [], trade_in_photos: [] };

// --- Componente Principal ---
export function AddClient() {
    const [step, setStep] = useState(0);
    const [dealType, setDealType] = useState<'comum' | 'troca' | 'visita' | ''>('');
    const [paymentType, setPaymentType] = useState<'a_vista' | 'financiamento' | ''>('');
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [files, setFiles] = useState<Files>(initialFiles);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [lojaId, setLojaId] = useState<string | null>(null);

    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: carsData } = useQuery({ queryKey: ['availableCars'], queryFn: fetchAvailableCars });

    useEffect(() => {
        const fetchLojaData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: lojaData, error } = await supabase
                    .from('lojas')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();
                if (error) {
                    console.error("Erro ao buscar dados da loja:", error);
                    toast({
                        title: "Erro",
                        description: "Não foi possível encontrar uma loja associada a este usuário.",
                        variant: "destructive"
                    });
                } else if (lojaData) {
                    setLojaId(lojaData.id);
                }
            }
        };
        fetchLojaData();
    }, [toast]);

    const flowSteps = useMemo(() => {
        const personal = { id: 'personal', title: 'Dados Pessoais', icon: Feather.UserPlus };
        const documents = { id: 'documents', title: 'Documentos (RG/CPF/CNH)', icon: Feather.FileText };
        const interest = { id: 'interest', title: 'Veículo de Interesse', icon: Feather.Car };
        const state = { id: 'state', title: 'Estado do Lead', icon: Feather.Check };
        const summary = { id: 'summary', title: 'Resumo e Confirmação', icon: Feather.Check };

        switch (dealType) {
            case 'troca':
                const tradeSteps = [ personal, documents, { id: 'trade_details', title: 'Detalhes da Troca', icon: Feather.RefreshCw }, { id: 'trade_photos', title: 'Fotos da Troca', icon: Feather.Upload }, interest, state ];
                const tradeInValue = parseCurrency(formData.trade_in_car.value);
                const interestedCarPrice = formData.interested_vehicles[0] ? parseCurrency(formData.interested_vehicles[0].preco) : 0;
                
                if (formData.interested_vehicles.length > 0 && interestedCarPrice > tradeInValue) {
                    tradeSteps.push({ id: 'troca_payment_type', title: 'Pagamento da Diferença', icon: Feather.DollarSign });
                    if (paymentType === 'financiamento') {
                        tradeSteps.push({ id: 'financing', title: 'Financiamento da Diferença', icon: Feather.DollarSign });
                    }
                }
                return [...tradeSteps, summary];

            case 'visita':
                return [
                    personal, { id: 'visit_details', title: 'Agendar Visita', icon: Feather.Calendar }, interest, state, summary
                ];

            case 'comum':
                const commonFlow = [personal, documents, interest, { id: 'payment_type', title: 'Forma de Pagamento', icon: Feather.DollarSign }];
                if (paymentType === 'a_vista') {
                    commonFlow.push(state, summary);
                } else if (paymentType === 'financiamento') {
                    commonFlow.push({ id: 'financing', title: 'Detalhes do Financiamento', icon: Feather.DollarSign }, state, summary);
                }
                return commonFlow;

            default:
                return [];
        }
    }, [dealType, paymentType, formData.trade_in_car.value, formData.interested_vehicles]);

    const mutation = useMutation({
        mutationFn: ({ clientPayload, files, lojaId }: { clientPayload: ClientPayload; files: Files; lojaId: string }) => 
            createClient({ clientPayload, files, lojaId }),
        onSuccess: (data) => {
            toast({ title: "Cliente cadastrado com sucesso!", description: `${data.name} foi adicionado ao CRM.` });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            resetForm();
        },
        onError: (error: Error) => {
            toast({ title: "Erro ao cadastrar", description: error.message, variant: 'destructive' });
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

    const resetForm = () => {
        setStep(0); setDealType(''); setPaymentType('');
        setFormData(initialFormData); setFiles(initialFiles);
    };

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
            case 'interest':
                if (formData.interested_vehicles.length === 0) return !setValidationError("Selecione pelo menos um veículo de interesse.");
                break;
            case 'financing':
                const entryValue = parseCurrency(formData.financing_details.entry);
                const carPrice = formData.interested_vehicles[0] ? parseCurrency(formData.interested_vehicles[0].preco) : 0;
                if (entryValue >= carPrice && carPrice > 0) return !setValidationError("A entrada não pode ser maior ou igual ao valor do veículo.");
                if (!formData.financing_details.parcels) return !setValidationError("Selecione o número de parcelas.");
                break;
        }
        return true;
    };

    const nextStep = () => { if (validateStep()) setStep(prev => prev + 1); };
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = () => {
        if (!validateStep()) return;
        if (!lojaId) {
            toast({
                title: "Erro de Autenticação",
                description: "Não foi possível identificar a sua loja. A página pode estar carregando ou você não tem uma loja cadastrada.",
                variant: 'destructive',
            });
            return;
        }

        const finalDealType = dealType === 'comum' ? paymentType : dealType;
        
        const payload: ClientPayload = {
            name: formData.name,
            phone: formData.phone,
            cpf: formData.cpf,
            job: formData.job,
            state: formData.state,
            deal_type: finalDealType,
            payment_method: paymentType,
            interested_vehicles: formData.interested_vehicles,
            trade_in_car: formData.trade_in_car,
            financing_details: formData.financing_details,
            visit_details: formData.visit_details,
            bot_data: {
                state: formData.state,
                deal_type: finalDealType,
                interested_vehicles: formData.interested_vehicles,
                financing_details: formData.financing_details,
                visit_details: formData.visit_details,
                trade_in_car: { ...formData.trade_in_car, photos: [] },
            }
        };

        mutation.mutate({ clientPayload: payload, files, lojaId });
    };

    const renderCurrentStep = () => {
        if (step === 0) return <StepDealType setDealType={setDealType} nextStep={nextStep} />;
        const currentStepConfig = flowSteps[step - 1];
        if (!currentStepConfig) return null;

        switch (currentStepConfig.id) {
            case 'personal': return <StepPersonalData formData={formData} handleInputChange={handleInputChange} />;
            case 'documents': return <StepFileUpload fileKey="documents" files={files.documents} handleFileChange={handleFileChange} description="Envie as fotos dos documentos (RG e CPF)." />;
            case 'interest': return <StepVehicleInterest formData={formData} setFormData={setFormData} cars={carsData} singleSelection={dealType !== 'visita'} />;
            case 'trade_details': return <StepTradeDetails formData={formData} handleInputChange={handleInputChange} />;
            case 'trade_photos': return <StepFileUpload fileKey="trade_in_photos" files={files.trade_in_photos} handleFileChange={handleFileChange} description="Envie fotos do carro que será a troca." />;
            case 'visit_details': return <StepVisitDetails formData={formData} handleInputChange={handleInputChange} />;
            case 'payment_type': return <StepPaymentType setPaymentType={setPaymentType} nextStep={nextStep} />;
            case 'troca_payment_type': return <StepPaymentType setPaymentType={setPaymentType} nextStep={nextStep} title="Como será pago o valor restante?" />;
            
            case 'financing':
                const carForFinancing = formData.interested_vehicles[0];
                const tradeInValue = dealType === 'troca' ? parseCurrency(formData.trade_in_car.value) : 0;
                return <StepFinancing 
                    formData={formData} 
                    handleInputChange={handleInputChange} 
                    carPrice={carForFinancing ? parseCurrency(carForFinancing.preco) : 0}
                    tradeInValue={tradeInValue}
                />;

            case 'state': return <StepLeadState formData={formData} handleInputChange={handleInputChange} />;
            case 'summary': return <StepSummary formData={formData} files={files} dealType={dealType} paymentType={paymentType} />;
            default: return null;
        }
    };

    return (
        <motion.div 
            className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 font-poppins bg-white/70"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
        >
            <div className="space-y-2">
                <motion.h1 
                    className="text-2xl md:text-3xl font-bold text-zinc-900"
                    variants={fadeInUp}
                >
                    Cadastro de Novo Cliente
                </motion.h1>
                {step > 0 && flowSteps[step - 1] && (
                    <motion.p 
                        className="text-zinc-600 text-sm"
                        variants={fadeInUp}
                    >
                        Passo {step} de {flowSteps.length}: {flowSteps[step - 1].title}
                    </motion.p>
                )}
            </div>

            {step > 0 && (
                <motion.div variants={fadeInUp}>
                    <Progress 
                        value={((step) / flowSteps.length) * 100} 
                        className="w-full h-2 bg-zinc-200 [&>div]:bg-amber-500" 
                    />
                </motion.div>
            )}

            {validationError && (
                <motion.p 
                    className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {validationError}
                </motion.p>
            )}

            <div>{renderCurrentStep()}</div>

            <motion.div 
                className="flex justify-between mt-6"
                variants={fadeInUp}
            >
                {step > 0 ? (
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
                        className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all disabled:bg-amber-300 disabled:cursor-not-allowed"
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !lojaId}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {mutation.isPending ? 'Salvando...' : 'Finalizar Cadastro'}
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    );
}

// --- SUB-COMPONENTES PARA CADA PASSO ---

const StepDealType = ({ setDealType, nextStep }: { setDealType: (type: 'comum' | 'troca' | 'visita') => void, nextStep: () => void }) => {
    const handleSelect = (type: 'comum' | 'troca' | 'visita') => { setDealType(type); nextStep(); };
    return (
        <motion.div
            className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
            variants={fadeInUp}
        >
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4">Selecione o Tipo de Negócio</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <motion.button
                    className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center"
                    onClick={() => handleSelect('comum')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Feather.ShoppingCart className="mr-2 h-6 w-6" /> Venda
                </motion.button>
                <motion.button
                    className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center"
                    onClick={() => handleSelect('troca')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Feather.RefreshCw className="mr-2 h-6 w-6" /> Troca
                </motion.button>
                <motion.button
                    className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center"
                    onClick={() => handleSelect('visita')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Feather.Calendar className="mr-2 h-6 w-6" /> Visita
                </motion.button>
            </div>
        </motion.div>
    );
};

const StepPersonalData = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
    <motion.div
        className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
        variants={fadeInUp}
    >
        <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Feather.UserPlus className="h-5 w-5" /> Dados Pessoais
        </h2>
        <div className="space-y-4">
            <div>
                <Label htmlFor="name" className="text-zinc-600">Nome Completo *</Label>
                <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => handleInputChange('name', e.target.value)} 
                    required 
                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="phone" className="text-zinc-600">Telefone *</Label>
                    <InputMask 
                        mask="(99) 99999-9999" 
                        value={formData.phone} 
                        onChange={e => handleInputChange('phone', e.target.value)}
                    >
                        {(inputProps: any) => (
                            <Input 
                                {...inputProps} 
                                type="tel" 
                                id="phone" 
                                required 
                                className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                            />
                        )}
                    </InputMask>
                </div>
                <div>
                    <Label htmlFor="cpf" className="text-zinc-600">CPF</Label>
                    <InputMask 
                        mask="999.999.999-99" 
                        value={formData.cpf} 
                        onChange={e => handleInputChange('cpf', e.target.value)}
                    >
                        {(inputProps: any) => (
                            <Input 
                                {...inputProps} 
                                type="text" 
                                id="cpf" 
                                className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                            />
                        )}
                    </InputMask>
                </div>
            </div>
            <div>
                <Label htmlFor="job" className="text-zinc-600">Ocupação</Label>
                <Input 
                    id="job" 
                    value={formData.job} 
                    onChange={e => handleInputChange('job', e.target.value)} 
                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                />
            </div>
        </div>
    </motion.div>
);

const StepFileUpload = ({ fileKey, files, handleFileChange, description }: { fileKey: keyof Files, files: File[], handleFileChange: (key: keyof Files, list: FileList | null) => void, description: string }) => {
    const removeFile = (index: number) => {
        const dataTransfer = new DataTransfer();
        files.filter((_, i) => i !== index).forEach(file => dataTransfer.items.add(file));
        handleFileChange(fileKey, dataTransfer.files);
    };
    return (
        <motion.div
            className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
            variants={fadeInUp}
        >
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4">Envio de Arquivos</h2>
            <p className="text-sm text-zinc-600 mb-4">{description}</p>
            <Label 
                htmlFor={`file-upload-${fileKey}`} 
                className="p-6 border-2 border-dashed border-zinc-200 rounded-lg text-center cursor-pointer hover:border-amber-400/50 transition-colors block"
            >
                <Feather.Upload className="mx-auto h-12 w-12 text-zinc-400" />
                <p className="mt-2 text-sm text-zinc-600">Clique para selecionar ou arraste os arquivos</p>
            </Label>
            <Input 
                id={`file-upload-${fileKey}`} 
                type="file" 
                multiple 
                className="sr-only" 
                onChange={(e) => handleFileChange(fileKey, e.target.files)} 
            />
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="font-semibold text-sm text-zinc-900">Arquivos Selecionados:</p>
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-zinc-100 rounded-md text-sm">
                            <span className="truncate pr-2 text-zinc-600">{file.name}</span>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => removeFile(index)}
                            >
                                <Feather.Trash2 className="h-4 w-4 text-zinc-600" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

const StepVehicleInterest = ({ formData, setFormData, cars, singleSelection }: { formData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>, cars?: Car[], singleSelection: boolean }) => {
    const handleCarSelection = (car: Car) => {
        setFormData(prev => {
            const isSelected = prev.interested_vehicles.some(v => v.id === car.id);
            if (isSelected) {
                return { ...prev, interested_vehicles: prev.interested_vehicles.filter(v => v.id !== car.id) };
            } else {
                return singleSelection
                    ? { ...prev, interested_vehicles: [car] }
                    : { ...prev, interested_vehicles: [...prev.interested_vehicles, car] };
            }
        });
    };
    return (
        <motion.div
            className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
            variants={fadeInUp}
        >
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-2">Veículo(s) de Interesse</h2>
            <p className="text-sm text-zinc-600 mb-4">{singleSelection ? "Selecione o veículo desejado." : "Selecione um ou mais veículos."}</p>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {!cars ? <p className="text-zinc-600">Carregando...</p> : cars.map(car => (
                    <motion.div 
                        key={car.id} 
                        onClick={() => handleCarSelection(car)} 
                        className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer ${formData.interested_vehicles.some(v => v.id === car.id) ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-200 hover:bg-zinc-100'}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <img src={car.imagens?.[0] || 'https://placehold.co/80x64'} alt={car.nome} className="w-20 h-16 object-cover rounded-md bg-zinc-100" />
                        <div className="flex-1">
                            <p className="font-semibold text-zinc-900">{car.nome}</p>
                            <p className="text-sm text-zinc-600">{formatCurrency(parseCurrency(car.preco))}</p>
                        </div>
                        {formData.interested_vehicles.some(v => v.id === car.id) && <Feather.Check className="text-amber-500" />}
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

const StepTradeDetails = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
    <motion.div
        className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
        variants={fadeInUp}
    >
        <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4">Detalhes do Veículo da Troca</h2>
        <div className="space-y-4">
            <div>
                <Label htmlFor="trade-model" className="text-zinc-600">Modelo e Versão *</Label>
                <Input 
                    id="trade-model" 
                    value={formData.trade_in_car.model} 
                    onChange={e => handleInputChange('trade_in_car.model', e.target.value)} 
                    required 
                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="trade-year" className="text-zinc-600">Ano (4 dígitos) *</Label>
                    <InputMask 
                        mask="9999" 
                        value={formData.trade_in_car.year} 
                        onChange={e => handleInputChange('trade_in_car.year', e.target.value)}
                    >
                        {(inputProps: any) => (
                            <Input 
                                {...inputProps} 
                                type="text" 
                                id="trade-year" 
                                required 
                                className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                            />
                        )}
                    </InputMask>
                </div>
                <div>
                    <Label htmlFor="trade-value" className="text-zinc-600">Valor Pretendido</Label>
                    <Input 
                        id="trade-value" 
                        placeholder="R$ 0,00" 
                        value={formData.trade_in_car.value} 
                        onChange={e => handleInputChange('trade_in_car.value', e.target.value)} 
                        className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                    />
                </div>
            </div>
        </div>
    </motion.div>
);

const StepVisitDetails = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
    <motion.div
        className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
        variants={fadeInUp}
    >
        <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4">Agendamento da Visita</h2>
        <div className="grid md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="visit-day" className="text-zinc-600">Data da Visita *</Label>
                <Input 
                    id="visit-day" 
                    type="date" 
                    value={formData.visit_details.day} 
                    onChange={e => handleInputChange('visit_details.day', e.target.value)} 
                    required 
                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                />
            </div>
            <div>
                <Label htmlFor="visit-time" className="text-zinc-600">Horário da Visita *</Label>
                <Input 
                    id="visit-time" 
                    type="time" 
                    value={formData.visit_details.time} 
                    onChange={e => handleInputChange('visit_details.time', e.target.value)} 
                    required 
                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                />
            </div>
        </div>
    </motion.div>
);

const StepPaymentType = ({ setPaymentType, nextStep, title }: { setPaymentType: (type: 'a_vista' | 'financiamento') => void, nextStep: () => void, title?: string }) => {
    const handleSelect = (type: 'a_vista' | 'financiamento') => { setPaymentType(type); nextStep(); };
    return (
        <motion.div
            className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
            variants={fadeInUp}
        >
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4">{title || 'Qual a forma de pagamento?'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <motion.button
                    className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center"
                    onClick={() => handleSelect('a_vista')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Feather.DollarSign className="mr-2 h-6 w-6" /> À Vista
                </motion.button>
                <motion.button
                    className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center"
                    onClick={() => handleSelect('financiamento')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Feather.FileText className="mr-2 h-6 w-6" /> Financiamento
                </motion.button>
            </div>
        </motion.div>
    );
};

const StepFinancing = ({ formData, handleInputChange, carPrice, tradeInValue }: { formData: FormData, handleInputChange: (path: string, value: any) => void, carPrice: number, tradeInValue: number }) => {
    const entryValue = parseCurrency(formData.financing_details.entry);
    const amountToFinance = Math.max(0, carPrice - tradeInValue - entryValue);

    return (
        <motion.div
            className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
            variants={fadeInUp}
        >
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4">Detalhes do Financiamento</h2>
            
            {tradeInValue > 0 && (
                <div className="mb-4 p-3 bg-zinc-100 rounded-md text-sm">
                    <p>Valor do veículo: <span className="font-semibold">{formatCurrency(carPrice)}</span></p>
                    <p>Valor do carro na troca: <span className="font-semibold text-red-600">- {formatCurrency(tradeInValue)}</span></p>
                    <p className="mt-1 border-t pt-1">Valor restante a negociar: <span className="font-semibold text-zinc-900">{formatCurrency(carPrice - tradeInValue)}</span></p>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <Label htmlFor="entry-value" className="text-zinc-600">
                        {tradeInValue > 0 ? "Valor de Entrada (além da troca)" : "Valor de Entrada *"}
                    </Label>
                    <Input 
                        id="entry-value" 
                        placeholder="R$ 0,00" 
                        value={formData.financing_details.entry} 
                        onChange={e => handleInputChange('financing_details.entry', e.target.value)} 
                        required 
                        className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                    />
                </div>
                <div>
                    <Label className="text-zinc-600">Valor a ser financiado</Label>
                    <Input 
                        value={formatCurrency(amountToFinance)} 
                        readOnly 
                        disabled 
                        className="border-zinc-200 bg-zinc-100 font-bold"
                    />
                </div>
                <div>
                    <Label htmlFor="parcels" className="text-zinc-600">Quantidade de Parcelas *</Label>
                    <Select 
                        onValueChange={value => handleInputChange('financing_details.parcels', value)} 
                        value={formData.financing_details.parcels}
                    >
                        <SelectTrigger className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12">12x</SelectItem>
                            <SelectItem value="24">24x</SelectItem>
                            <SelectItem value="36">36x</SelectItem>
                            <SelectItem value="48">48x</SelectItem>
                            <SelectItem value="60">60x</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </motion.div>
    );
};

const StepLeadState = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
    <motion.div
        className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
        variants={fadeInUp}
    >
        <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-2">Estado do Lead</h2>
        <p className="text-sm text-zinc-600 mb-4">Selecione o estado inicial do cliente no funil de vendas.</p>
        <Select 
            onValueChange={value => handleInputChange('state', value)} 
            value={formData.state}
        >
            <SelectTrigger className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="inicial">Novo Lead</SelectItem>
                <SelectItem value="aguardando_interesse">Aguardando Interesse</SelectItem>
                <SelectItem value="aguardando_escolha_carro">Aguardando Escolha</SelectItem>
                <SelectItem value="finalizado">Atendimento Finalizado</SelectItem>
            </SelectContent>
        </Select>
    </motion.div>
);

const StepSummary = ({ formData, files, dealType, paymentType }: { formData: FormData, files: Files, dealType: string, paymentType: string }) => (
    <motion.div
        className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
        variants={fadeInUp}
    >
        <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4">Resumo e Confirmação</h2>
        <div className="space-y-4 text-sm">
            <div className="p-4 bg-zinc-100 rounded-lg space-y-2">
                <h3 className="font-semibold text-zinc-900">Dados Pessoais</h3>
                <p><span className="text-zinc-600">Nome:</span> {formData.name}</p>
                <p><span className="text-zinc-600">Telefone:</span> {formData.phone}</p>
                {formData.cpf && <p><span className="text-zinc-600">CPF:</span> {formData.cpf}</p>}
            </div>
            <div className="p-4 bg-zinc-100 rounded-lg space-y-2">
                <h3 className="font-semibold text-zinc-900">Detalhes do Negócio</h3>
                <p><span className="text-zinc-600">Tipo:</span> <span className="capitalize">{dealType === 'comum' ? `Venda - ${paymentType}` : dealType}</span></p>
                {formData.interested_vehicles.length > 0 && <p><span className="text-zinc-600">Veículos:</span> {formData.interested_vehicles.map(v => v.nome).join(', ')}</p>}
                {dealType === 'troca' && <p><span className="text-zinc-600">Carro Troca:</span> {formData.trade_in_car.model} ({formData.trade_in_car.year}) - {formData.trade_in_car.value}</p>}
                {dealType === 'visita' && <p><span className="text-zinc-600">Visita:</span> {formData.visit_details.day} às {formData.visit_details.time}</p>}
                {paymentType === 'financiamento' && <p><span className="text-zinc-600">Financiamento:</span> Entrada de {formData.financing_details.entry} em {formData.financing_details.parcels}x</p>}
            </div>
            {(files.documents.length > 0 || files.trade_in_photos.length > 0) && (
                <div className="p-4 bg-zinc-100 rounded-lg space-y-2">
                    <h3 className="font-semibold text-zinc-900">Arquivos Anexados</h3>
                    {files.documents.length > 0 && <p><span className="text-zinc-600">Documentos:</span> {files.documents.length} arquivo(s)</p>}
                    {files.trade_in_photos.length > 0 && <p><span className="text-zinc-600">Fotos da Troca:</span> {files.trade_in_photos.length} arquivo(s)</p>}
                </div>
            )}
        </div>
    </motion.div>
);