// src/components/AddClient.tsx

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Feather from 'react-feather';
import InputMask from 'react-input-mask';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

// Importe seus componentes UI (ex: shadcn/ui)
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// O nome da função no seu api.ts é 'fetchCarDetails'.
import { fetchCarDetails } from '@/services/api';

// --- Tipos e Interfaces ---
export interface Car {
    id: string;
    nome: string;
    ano: number;
    preco: string;
    descricao: string;
    imagens: string[];
    loja_id: string;
}

export interface FormData {
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

export interface Files {
    documents: File[];
    trade_in_photos: File[];
}

// --- Funções Auxiliares ---
export const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value || typeof value !== 'string') return 0;
    const cleaned = String(value)
        .replace(/R\$\s?/, '')
        .replace(/\./g, '')
        .replace(',', '.');
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
};

// --- [CORREÇÃO AQUI] ---
// Renomeando de volta para 'formatCurrency' para corrigir o erro de importação.
export const formatCurrency = (value: string | number): string => {
    const number = parseCurrency(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};


// --- Animações ---
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
};

// --- SUB-COMPONENTES PARA CADA PASSO (TODOS INCLUÍDOS AQUI) ---

export const StepDealType = ({ setDealType }: { setDealType: (type: 'comum' | 'troca' | 'visita') => void }) => {
    const handleSelect = (type: 'comum' | 'troca' | 'visita') => { setDealType(type); };
    return (
        <motion.div
            className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
            variants={fadeInUp}
        >
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4">Selecione o Tipo de Negócio</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <motion.button type="button" className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center" onClick={() => handleSelect('comum')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Feather.ShoppingCart className="mr-2 h-6 w-6" /> Venda
                </motion.button>
                <motion.button type="button" className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center" onClick={() => handleSelect('troca')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Feather.RefreshCw className="mr-2 h-6 w-6" /> Troca
                </motion.button>
                <motion.button type="button" className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center" onClick={() => handleSelect('visita')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Feather.Calendar className="mr-2 h-6 w-6" /> Visita
                </motion.button>
            </div>
        </motion.div>
    );
};

export const StepPersonalData = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
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

export const StepFileUpload = ({ fileKey, files, handleFileChange, description }: { fileKey: keyof Files, files: File[], handleFileChange: (key: keyof Files, list: FileList | null) => void, description: string }) => {
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

export const StepTradeDetails = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
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

export const StepVisitDetails = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
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

export const StepPaymentType = ({ setPaymentType, title }: { setPaymentType: (type: 'a_vista' | 'financiamento') => void, title?: string }) => {
    const handleSelect = (type: 'a_vista' | 'financiamento') => { setPaymentType(type); };
    return (
        <motion.div
            className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm font-poppins"
            variants={fadeInUp}
        >
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900 mb-4">{title || 'Qual a forma de pagamento?'}</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <motion.button type="button" className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center" onClick={() => handleSelect('a_vista')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Feather.DollarSign className="mr-2 h-6 w-6" /> À Vista
                </motion.button>
                <motion.button type="button" className="h-24 text-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg flex items-center justify-center" onClick={() => handleSelect('financiamento')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Feather.FileText className="mr-2 h-6 w-6" /> Financiamento
                </motion.button>
            </div>
        </motion.div>
    );
};

export const StepFinancing = ({ formData, handleInputChange, carPrice, tradeInValue }: { formData: FormData, handleInputChange: (path: string, value: any) => void, carPrice: number, tradeInValue: number }) => {
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

export const StepSummary = ({ formData, files, dealType, paymentType }: { formData: FormData, files: Files, dealType: string, paymentType: string }) => (
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
                {formData.interested_vehicles.length > 0 && <p><span className="text-zinc-600">Veículo:</span> {formData.interested_vehicles[0].nome} ({formatCurrency(formData.interested_vehicles[0].preco)})</p>}
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


// --- Componente Principal ---
const AddClient = () => {
    const { vehicleId } = useParams<{ vehicleId: string }>();

    const { data: car, isLoading, error } = useQuery<Car>({
        queryKey: ['vehicle', vehicleId],
        queryFn: () => {
            if (!vehicleId) throw new Error("ID do veículo não fornecido.");
            return fetchCarDetails(vehicleId);
        },
        enabled: !!vehicleId,
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [dealType, setDealType] = useState<'comum' | 'troca' | 'visita' | null>(null);
    const [paymentType, setPaymentType] = useState<'a_vista' | 'financiamento' | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [formData, setFormData] = useState<FormData>({
        name: '', phone: '', cpf: '', job: '', state: '',
        interested_vehicles: car ? [car] : [],
        trade_in_car: { model: '', year: '', value: '' },
        financing_details: { entry: '', parcels: '' },
        visit_details: { day: '', time: '' },
    });

    const [files, setFiles] = useState<Files>({
        documents: [],
        trade_in_photos: [],
    });
    
    React.useEffect(() => {
        if (car) {
            setFormData(prev => ({ ...prev, interested_vehicles: [car] }));
        }
    }, [car]);

    const navigateGallery = (direction: number) => {
        if (!car?.imagens) return;
        const newIndex = (currentImageIndex + direction + car.imagens.length) % car.imagens.length;
        setCurrentImageIndex(newIndex);
    };

    const handleInputChange = (path: string, value: any) => {
        setFormData(prev => {
            const keys = path.split('.');
            if (keys.length === 1) return { ...prev, [keys[0]]: value };
            const newFormData = JSON.parse(JSON.stringify(prev));
            let current: any = newFormData;
            keys.slice(0, -1).forEach(key => { current = current[key]; });
            current[keys[keys.length - 1]] = value;
            return newFormData;
        });
    };

    const handleFileChange = (key: keyof Files, fileList: FileList | null) => {
        if (fileList) {
            setFiles(prev => ({ ...prev, [key]: Array.from(fileList) }));
        }
    };

    const stepConfig = useMemo(() => ([
        { id: 'dealType', title: 'Tipo de Negócio', isSkipped: () => false },
        { id: 'personalData', title: 'Dados Pessoais', isSkipped: () => false },
        { id: 'tradeInDetails', title: 'Detalhes da Troca', isSkipped: () => dealType !== 'troca' },
        { id: 'tradeInPhotos', title: 'Fotos da Troca', isSkipped: () => dealType !== 'troca' },
        { id: 'paymentType', title: 'Pagamento', isSkipped: () => dealType === 'visita' },
        { id: 'financingDetails', title: 'Financiamento', isSkipped: () => paymentType !== 'financiamento' },
        { id: 'visitDetails', title: 'Agendar Visita', isSkipped: () => dealType !== 'visita' },
        { id: 'summary', title: 'Revisão e Envio', isSkipped: () => false },
    ]), [dealType, paymentType]);

    const activeSteps = useMemo(() => stepConfig.filter(step => !step.isSkipped()), [stepConfig]);
    const totalSteps = activeSteps.length;
    const currentStepConfig = activeSteps[currentStep];

    const handleNextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Formulário enviado!", { formData, files, dealType, paymentType });
        alert('Proposta enviada com sucesso!');
    };

    const renderStepContent = () => {
        if (!currentStepConfig) return <div>Passo não encontrado.</div>;
        const carPrice = parseCurrency(formData.interested_vehicles[0]?.preco || '0');
        const tradeInValue = dealType === 'troca' ? parseCurrency(formData.trade_in_car.value) : 0;

        switch (currentStepConfig.id) {
            case 'dealType':
                return <StepDealType setDealType={(type) => { setDealType(type); handleNextStep(); }} />;
            case 'personalData':
                return <StepPersonalData formData={formData} handleInputChange={handleInputChange} />;
            case 'tradeInDetails':
                return <StepTradeDetails formData={formData} handleInputChange={handleInputChange} />;
            case 'tradeInPhotos':
                return <StepFileUpload fileKey="trade_in_photos" files={files.trade_in_photos} handleFileChange={handleFileChange} description="Envie fotos do seu veículo para avaliação." />;
            case 'paymentType':
                return <StepPaymentType setPaymentType={(type) => { setPaymentType(type); handleNextStep(); }} title={dealType === 'troca' ? 'Como será pago o valor restante (diferença)?' : 'Qual a forma de pagamento?'} />;
            case 'financingDetails':
                return <StepFinancing formData={formData} handleInputChange={handleInputChange} carPrice={carPrice} tradeInValue={tradeInValue} />;
            case 'visitDetails':
                return <StepVisitDetails formData={formData} handleInputChange={handleInputChange} />;
            case 'summary':
                return <StepSummary formData={formData} files={files} dealType={dealType || ''} paymentType={paymentType || ''} />;
            default:
                return <div>Passo desconhecido.</div>;
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-zinc-600">
                <Feather.Loader className="animate-spin h-8 w-8 mb-4" />
                <p>Carregando informações do veículo...</p>
            </div>
        );
    }

    if (error || !car) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-600">
                <Feather.AlertTriangle className="h-8 w-8 mb-4" />
                <p>Erro ao carregar o veículo ou veículo não encontrado.</p>
                <p className="text-sm text-zinc-500 mt-2">Por favor, verifique o link ou tente novamente.</p>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 p-4 md:p-8">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                 <h1 className="text-3xl font-bold text-zinc-900 text-center mb-2">Proposta de Interesse</h1>
                 <p className="text-zinc-600 text-center mb-8">Preencha os passos abaixo para enviar sua proposta para o veículo.</p>
            </motion.div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                    {currentStep === 0 && (
                        <motion.div
                            className="bg-white/70 p-4 md:p-6 rounded-lg border border-zinc-200 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, border: 0, overflow: 'hidden' }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">{car.nome}</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Galeria de Imagens */}
                                <div className="space-y-3">
                                    <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200 group">
                                         <AnimatePresence initial={false}>
                                            <motion.img
                                                key={currentImageIndex}
                                                src={car.imagens?.[currentImageIndex] || 'https://placehold.co/400x300/e4e4e7/3f3f46?text=Sem+Imagem'}
                                                alt={`Imagem ${currentImageIndex + 1} de ${car.nome}`}
                                                className="w-full h-full object-cover"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </AnimatePresence>
                                        {car.imagens && car.imagens.length > 1 && (
                                            <>
                                                <motion.button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full border border-zinc-200 text-amber-500 hover:bg-white" onClick={() => navigateGallery(-1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Feather.ChevronLeft className="w-5 h-5" />
                                                </motion.button>
                                                <motion.button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full border border-zinc-200 text-amber-500 hover:bg-white" onClick={() => navigateGallery(1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Feather.ChevronRight className="w-5 h-5" />
                                                </motion.button>
                                            </>
                                        )}
                                    </div>
                                    {car.imagens && car.imagens.length > 1 && (
                                       <div className="grid grid-cols-5 gap-2">
                                           {car.imagens.map((img, index) => (
                                               <img
                                                   key={index}
                                                   src={img}
                                                   onClick={() => setCurrentImageIndex(index)}
                                                   className={`w-full aspect-square object-cover rounded-md cursor-pointer border-2 transition-all ${currentImageIndex === index ? 'border-amber-500' : 'border-transparent hover:border-zinc-300'}`}
                                               />
                                           ))}
                                       </div>
                                    )}
                                </div>
                                {/* Detalhes do Veículo */}
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div>
                                            <Label className="text-zinc-800 font-medium">Ano</Label>
                                            <p className="font-semibold text-zinc-800 text-lg">{car.ano}</p>
                                        </div>
                                        <div className="sm:text-right">
                                            <Label className="text-zinc-800 font-medium">Preço</Label>
                                            <p className="text-2xl font-bold text-amber-500">{formatCurrency(car.preco)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-zinc-800 font-medium">Descrição</Label>
                                        <p className="text-zinc-600 whitespace-pre-wrap text-sm leading-relaxed">{car.descricao || "Nenhuma descrição disponível."}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <div className="mb-6">
                    <p className="text-sm text-zinc-600 font-medium">Passo {currentStep + 1} de {totalSteps}: {currentStepConfig?.title}</p>
                    <div className="w-full bg-zinc-200 rounded-full h-2 mt-1">
                        <motion.div
                            className="bg-amber-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep) / (totalSteps - 1)) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-6">
                    {currentStep > 0 ? (
                        <Button type="button" variant="outline" onClick={handlePrevStep}>
                            <Feather.ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                        </Button>
                    ) : <div />}
                    
                    {currentStepConfig?.id !== 'dealType' && currentStepConfig?.id !== 'paymentType' && currentStep < totalSteps - 1 && (
                        <Button type="button" onClick={handleNextStep}>
                            Avançar <Feather.ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    
                    {currentStep === totalSteps - 1 && (
                        <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                            <Feather.Check className="mr-2 h-4 w-4" /> Enviar Proposta
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddClient;