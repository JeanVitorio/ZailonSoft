import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InputMask from 'react-input-mask';
import { supabase } from '@/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Importe seus componentes UI (ex: shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, ArrowRight, UserPlus, Car as CarIcon, DollarSign, Check, Upload, Trash2, Calendar, ShoppingCart, RefreshCcw, FileText } from 'lucide-react';

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
const parseCurrency = (value: string): number => {
    if (!value) return 0;
    return Number(String(value).replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
};

const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

    // Fetch loja_id for the authenticated user
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

    // --- Lógica de Fluxo Dinâmico ---
    const flowSteps = useMemo(() => {
        const personal = { id: 'personal', title: 'Dados Pessoais', icon: UserPlus };
        const documents = { id: 'documents', title: 'Documentos (RG/CPF)', icon: FileText };
        const interest = { id: 'interest', title: 'Veículo de Interesse', icon: CarIcon };
        const state = { id: 'state', title: 'Estado do Lead', icon: Check };
        const summary = { id: 'summary', title: 'Resumo e Confirmação', icon: Check };

        switch (dealType) {
            case 'troca':
                const tradeSteps = [ personal, documents, { id: 'trade_details', title: 'Detalhes da Troca', icon: RefreshCcw }, { id: 'trade_photos', title: 'Fotos da Troca', icon: Upload }, interest, state ];
                const tradeInValue = parseCurrency(formData.trade_in_car.value);
                const interestedCarPrice = formData.interested_vehicles[0] ? parseCurrency(formData.interested_vehicles[0].preco) : 0;
                if (formData.interested_vehicles.length > 0 && interestedCarPrice > tradeInValue) {
                    tradeSteps.push({ id: 'troca_payment_type', title: 'Pagamento da Diferença', icon: DollarSign });
                    if (paymentType === 'financiamento') {
                        tradeSteps.push({ id: 'financing', title: 'Financiamento da Diferença', icon: DollarSign });
                    }
                }
                return [...tradeSteps, summary];

            case 'visita':
                return [
                    personal, { id: 'visit_details', title: 'Agendar Visita', icon: Calendar }, interest, state, summary
                ];

            case 'comum':
                const commonFlow = [personal, documents, interest, { id: 'payment_type', title: 'Forma de Pagamento', icon: DollarSign }];
                if (paymentType === 'a_vista') {
                    commonFlow.push(state, summary);
                } else if (paymentType === 'financiamento') {
                    commonFlow.push({ id: 'financing', title: 'Detalhes do Financiamento', icon: DollarSign }, state, summary);
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

    // --- Handlers ---
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
            ...formData,
            deal_type: finalDealType,
            payment_method: paymentType,
            interested_vehicles: formData.interested_vehicles.map(({ id, nome }) => ({ id, nome })),
            bot_data: {
                state: formData.state,
                deal_type: finalDealType,
                interested_vehicles: formData.interested_vehicles.map(({ id, nome }) => ({ id, nome })),
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
                return <StepFinancing formData={formData} handleInputChange={handleInputChange} carPrice={carForFinancing ? parseCurrency(carForFinancing.preco) : 0} />;
            case 'state': return <StepLeadState formData={formData} handleInputChange={handleInputChange} />;
            case 'summary': return <StepSummary formData={formData} files={files} dealType={dealType} paymentType={paymentType} />;
            default: return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Cadastro de Novo Cliente</h1>
                {step > 0 && flowSteps[step - 1] && (
                    <p className="text-muted-foreground">Passo {step} de {flowSteps.length}: {flowSteps[step - 1].title}</p>
                )}
            </div>

            {step > 0 && <Progress value={((step) / flowSteps.length) * 100} className="w-full" />}

            {validationError && <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">{validationError}</p>}

            <div>{renderCurrentStep()}</div>

            <div className="flex justify-between mt-6">
                {step > 0 ? (
                    <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
                ) : <div />}

                {step > 0 && step < flowSteps.length && (
                    <Button onClick={nextStep}>Avançar <ArrowRight className="ml-2 h-4 w-4" /></Button>
                )}

                {step > 0 && step === flowSteps.length && (
                    <Button onClick={handleSubmit} disabled={mutation.isPending || !lojaId}>
                        {mutation.isPending ? 'Salvando...' : 'Finalizar Cadastro'}
                    </Button>
                )}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTES PARA CADA PASSO ---

const StepDealType = ({ setDealType, nextStep }: { setDealType: (type: 'comum' | 'troca' | 'visita') => void, nextStep: () => void }) => {
    const handleSelect = (type: 'comum' | 'troca' | 'visita') => { setDealType(type); nextStep(); };
    return (
        <Card>
            <CardHeader><CardTitle>Selecione o Tipo de Negócio</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
                <Button size="lg" variant="outline" onClick={() => handleSelect('comum')} className="h-24 text-lg"><ShoppingCart className="mr-2" /> Venda</Button>
                <Button size="lg" variant="outline" onClick={() => handleSelect('troca')} className="h-24 text-lg"><RefreshCcw className="mr-2" /> Troca</Button>
                <Button size="lg" variant="outline" onClick={() => handleSelect('visita')} className="h-24 text-lg"><Calendar className="mr-2" /> Visita</Button>
            </CardContent>
        </Card>
    );
};

const StepPersonalData = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
    <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus />Dados Pessoais</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="phone">Telefone *</Label>
                    <InputMask mask="(99) 99999-9999" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)}>
                        {(inputProps: any) => <Input {...inputProps} type="tel" id="phone" required />}
                    </InputMask>
                </div>
                <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <InputMask mask="999.999.999-99" value={formData.cpf} onChange={e => handleInputChange('cpf', e.target.value)}>
                        {(inputProps: any) => <Input {...inputProps} type="text" id="cpf" />}
                    </InputMask>
                </div>
            </div>
            <div>
                <Label htmlFor="job">Ocupação</Label>
                <Input id="job" value={formData.job} onChange={e => handleInputChange('job', e.target.value)} />
            </div>
        </CardContent>
    </Card>
);

const StepFileUpload = ({ fileKey, files, handleFileChange, description }: { fileKey: keyof Files, files: File[], handleFileChange: (key: keyof Files, list: FileList | null) => void, description: string }) => {
    const removeFile = (index: number) => {
        const dataTransfer = new DataTransfer();
        files.filter((_, i) => i !== index).forEach(file => dataTransfer.items.add(file));
        handleFileChange(fileKey, dataTransfer.files);
    };
    return (
        <Card>
            <CardHeader><CardTitle>Envio de Arquivos</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
            <CardContent>
                <Label htmlFor={`file-upload-${fileKey}`} className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary transition-colors block">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-muted-foreground">Clique para selecionar ou arraste os arquivos</p>
                </Label>
                <Input id={`file-upload-${fileKey}`} type="file" multiple className="sr-only" onChange={(e) => handleFileChange(fileKey, e.target.files)} />
                {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="font-semibold text-sm">Arquivos Selecionados:</p>
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                                <span className="truncate pr-2">{file.name}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
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
        <Card>
            <CardHeader>
                <CardTitle>Veículo(s) de Interesse</CardTitle>
                <CardDescription>{singleSelection ? "Selecione o veículo desejado." : "Selecione um ou mais veículos."}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {!cars ? <p>Carregando...</p> : cars.map(car => (
                    <div key={car.id} onClick={() => handleCarSelection(car)} className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer ${formData.interested_vehicles.some(v => v.id === car.id) ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}>
                        <img src={car.imagens[0]} alt={car.nome} className="w-20 h-16 object-cover rounded-md bg-muted" />
                        <div className="flex-1">
                            <p className="font-semibold">{car.nome}</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(parseCurrency(car.preco))}</p>
                        </div>
                        {formData.interested_vehicles.some(v => v.id === car.id) && <Check className="text-primary" />}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const StepTradeDetails = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
    <Card>
        <CardHeader><CardTitle>Detalhes do Veículo da Troca</CardTitle></CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="trade-model">Modelo e Versão *</Label>
                <Input id="trade-model" value={formData.trade_in_car.model} onChange={e => handleInputChange('trade_in_car.model', e.target.value)} required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="trade-year">Ano (4 dígitos) *</Label>
                    <InputMask mask="9999" value={formData.trade_in_car.year} onChange={e => handleInputChange('trade_in_car.year', e.target.value)}>
                        {(inputProps: any) => <Input {...inputProps} type="text" id="trade-year" required />}
                    </InputMask>
                </div>
                <div>
                    <Label htmlFor="trade-value">Valor Pretendido</Label>
                    <Input id="trade-value" placeholder="R$ 0,00" value={formData.trade_in_car.value} onChange={e => handleInputChange('trade_in_car.value', e.target.value)} />
                </div>
            </div>
        </CardContent>
    </Card>
);

const StepVisitDetails = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
    <Card>
        <CardHeader><CardTitle>Agendamento da Visita</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="visit-day">Data da Visita *</Label>
                <Input id="visit-day" type="date" value={formData.visit_details.day} onChange={e => handleInputChange('visit_details.day', e.target.value)} required />
            </div>
            <div>
                <Label htmlFor="visit-time">Horário da Visita *</Label>
                <Input id="visit-time" type="time" value={formData.visit_details.time} onChange={e => handleInputChange('visit_details.time', e.target.value)} required />
            </div>
        </CardContent>
    </Card>
);

const StepPaymentType = ({ setPaymentType, nextStep, title }: { setPaymentType: (type: 'a_vista' | 'financiamento') => void, nextStep: () => void, title?: string }) => {
    const handleSelect = (type: 'a_vista' | 'financiamento') => { setPaymentType(type); nextStep(); };
    return (
        <Card>
            <CardHeader><CardTitle>{title || 'Qual a forma de pagamento?'}</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <Button size="lg" variant="outline" onClick={() => handleSelect('a_vista')} className="h-24 text-lg"><DollarSign className="mr-2" /> À Vista</Button>
                <Button size="lg" variant="outline" onClick={() => handleSelect('financiamento')} className="h-24 text-lg"><FileText className="mr-2" /> Financiamento</Button>
            </CardContent>
        </Card>
    );
};

const StepFinancing = ({ formData, handleInputChange, carPrice }: { formData: FormData, handleInputChange: (path: string, value: any) => void, carPrice: number }) => {
    const entryValue = parseCurrency(formData.financing_details.entry);
    const amountToFinance = carPrice > entryValue ? carPrice - entryValue : 0;
    return (
        <Card>
            <CardHeader><CardTitle>Detalhes do Financiamento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="entry-value">Valor de Entrada *</Label>
                    <Input id="entry-value" placeholder="R$ 0,00" value={formData.financing_details.entry} onChange={e => handleInputChange('financing_details.entry', e.target.value)} required />
                </div>
                <div>
                    <Label>Valor a ser financiado</Label>
                    <Input value={formatCurrency(amountToFinance)} readOnly disabled />
                </div>
                <div>
                    <Label htmlFor="parcels">Quantidade de Parcelas *</Label>
                    <Select onValueChange={value => handleInputChange('financing_details.parcels', value)} value={formData.financing_details.parcels}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12">12x</SelectItem>
                            <SelectItem value="24">24x</SelectItem>
                            <SelectItem value="36">36x</SelectItem>
                            <SelectItem value="48">48x</SelectItem>
                            <SelectItem value="60">60x</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
};

const StepLeadState = ({ formData, handleInputChange }: { formData: FormData, handleInputChange: (path: string, value: any) => void }) => (
    <Card>
        <CardHeader><CardTitle>Estado do Lead</CardTitle><CardDescription>Selecione o estado inicial do cliente no funil de vendas.</CardDescription></CardHeader>
        <CardContent>
            <Select onValueChange={value => handleInputChange('state', value)} value={formData.state}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="inicial">Novo Lead</SelectItem>
                    <SelectItem value="aguardando_interesse">Aguardando Interesse</SelectItem>
                    <SelectItem value="aguardando_escolha_carro">Aguardando Escolha</SelectItem>
                    <SelectItem value="finalizado">Atendimento Finalizado</SelectItem>
                </SelectContent>
            </Select>
        </CardContent>
    </Card>
);

const StepSummary = ({ formData, files, dealType, paymentType }: { formData: FormData, files: Files, dealType: string, paymentType: string }) => (
    <Card>
        <CardHeader><CardTitle>Resumo e Confirmação</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm">
            <div className="p-4 bg-muted rounded-lg space-y-2">
                <h3 className="font-semibold">Dados Pessoais</h3>
                <p><span className="text-muted-foreground">Nome:</span> {formData.name}</p>
                <p><span className="text-muted-foreground">Telefone:</span> {formData.phone}</p>
                {formData.cpf && <p><span className="text-muted-foreground">CPF:</span> {formData.cpf}</p>}
            </div>
            <div className="p-4 bg-muted rounded-lg space-y-2">
                <h3 className="font-semibold">Detalhes do Negócio</h3>
                <p><span className="text-muted-foreground">Tipo:</span> <span className="capitalize">{dealType === 'comum' ? `Venda - ${paymentType}` : dealType}</span></p>
                {formData.interested_vehicles.length > 0 && <p><span className="text-muted-foreground">Veículos:</span> {formData.interested_vehicles.map(v => v.nome).join(', ')}</p>}
                {dealType === 'troca' && <p><span className="text-muted-foreground">Carro Troca:</span> {formData.trade_in_car.model} ({formData.trade_in_car.year}) - {formData.trade_in_car.value}</p>}
                {dealType === 'visita' && <p><span className="text-muted-foreground">Visita:</span> {formData.visit_details.day} às {formData.visit_details.time}</p>}
                {paymentType === 'financiamento' && <p><span className="text-muted-foreground">Financiamento:</span> Entrada de {formData.financing_details.entry} em {formData.financing_details.parcels}x</p>}
            </div>
            {(files.documents.length > 0 || files.trade_in_photos.length > 0) &&
                <div className="p-4 bg-muted rounded-lg space-y-2">
                    <h3 className="font-semibold">Arquivos Anexados</h3>
                    {files.documents.length > 0 && <p><span className="text-muted-foreground">Documentos:</span> {files.documents.length} arquivo(s)</p>}
                    {files.trade_in_photos.length > 0 && <p><span className="text-muted-foreground">Fotos da Troca:</span> {files.trade_in_photos.length} arquivo(s)</p>}
                </div>
            }
        </CardContent>
    </Card>
);