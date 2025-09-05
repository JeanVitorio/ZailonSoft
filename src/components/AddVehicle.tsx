// src/components/AddVehicle.tsx

// <<< ALTERAÇÃO AQUI: Adicionado useEffect e useState
import React, { useState, useEffect } from 'react'; 
import { useMutation, useQueryClient } from '@tanstack/react-query';
import InputMask from 'react-input-mask';

// Importe seus componentes UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, ArrowRight, Car, Upload, DollarSign, Check, FileText, Calendar, Trash2 } from 'lucide-react';

// Importe a função de serviço
import { addVehicle as addVehicleToSupabase } from '@/services/api';

// <<< ALTERAÇÃO AQUI: Importe seu cliente Supabase
import { supabase } from '@/supabaseClient'; // Verifique se este é o caminho correto para seu cliente supabase

// --- Funções Auxiliares ---
const parseCurrency = (value: string): number => {
    if (!value) return 0;
    return Number(String(value).replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
};
const formatCurrency = (value: string): string => {
    const num = parseCurrency(value);
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// --- Estado Inicial ---
const initialFormData = {
    name: '',
    year: '',
    price: '',
    description: '',
};

// --- Componente Principal ---
export function AddVehicle() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [images, setImages] = useState<File[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);

    // <<< ALTERAÇÃO AQUI: Criamos um estado para armazenar o lojaId
    const [lojaId, setLojaId] = useState<string | null>(null);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // <<< ALTERAÇÃO AQUI: Usamos o useEffect para buscar os dados da loja quando o componente carregar
    useEffect(() => {
        const fetchLojaData = async () => {
            // 1. Pega o usuário logado
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // 2. Busca na tabela 'lojas' a loja que pertence a esse usuário
                const { data: lojaData, error } = await supabase
                    .from('lojas')
                    .select('id')
                    .eq('user_id', user.id)
                    .single(); // .single() pega apenas um resultado

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
    }, [toast]); // O toast é uma dependência para poder ser usado dentro do useEffect

    const mutation = useMutation({
        mutationFn: ({ vehicleData, images, lojaId }: { vehicleData: typeof initialFormData; images: File[]; lojaId: string }) => 
            addVehicleToSupabase(vehicleData, images, lojaId),
        onSuccess: (data) => {
            toast({
                title: "Veículo cadastrado com sucesso!",
                description: `Adicionado ao catálogo.`,
            });
            queryClient.invalidateQueries({ queryKey: ['availableCars'] });
            resetForm();
        },
        onError: (error: Error) => {
            toast({
                title: "Erro ao cadastrar veículo",
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // --- Handlers (sem alterações aqui) ---
    const handleInputChange = (field: keyof typeof initialFormData, value: string) => {
        setValidationError(null);
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValidationError(null);
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };
    const resetForm = () => {
        setStep(1);
        setFormData(initialFormData);
        setImages([]);
    };
    const validateStep = (): boolean => {
        switch (step) {
            case 1: if (!formData.name.trim()) return !setValidationError("O nome do veículo é obrigatório."); break;
            case 2: if (!/^\d{4}$/.test(formData.year)) return !setValidationError("O ano deve ter 4 dígitos."); break;
            case 3: if (parseCurrency(formData.price) <= 0) return !setValidationError("O preço deve ser maior que zero."); break;
            case 5: if (images.length === 0) return !setValidationError("Selecione pelo menos uma imagem."); break;
        }
        return true;
    };
    const nextStep = () => { if (validateStep()) { setStep(prev => prev + 1); } };
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

        mutation.mutate({ vehicleData: formData, images: images, lojaId: lojaId });
    };
    
    // O resto do componente continua igual...
    const stepsConfig = [
        { step: 1, title: 'Nome do Veículo', icon: Car },
        { step: 2, title: 'Ano do Veículo', icon: Calendar },
        { step: 3, title: 'Valor', icon: DollarSign },
        { step: 4, title: 'Descrição', icon: FileText },
        { step: 5, title: 'Fotos do Veículo', icon: Upload },
        { step: 6, title: 'Resumo e Confirmação', icon: Check },
    ];

    const currentStepInfo = stepsConfig.find(s => s.step === step);
    const progressValue = (step / stepsConfig.length) * 100;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-2xl">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Cadastro de Novo Veículo</h1>
                {currentStepInfo && (
                    <p className="text-muted-foreground">Etapa {step} de {stepsConfig.length}: {currentStepInfo.title}</p>
                )}
            </div>
            
            <Progress value={progressValue} className="w-full" />
            
            {validationError && <p className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">{validationError}</p>}
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {currentStepInfo?.icon && React.createElement(currentStepInfo.icon, { className: "h-5 w-5" })}
                        {currentStepInfo?.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {step === 1 && ( <div className="space-y-2"><Label htmlFor="name">Nome / Título do Anúncio *</Label><Input id="name" placeholder="Ex: Honda Civic 2.0 EXL Automático" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} /></div> )}
                    {step === 2 && ( <div className="space-y-2"><Label htmlFor="year">Ano de Fabricação *</Label><InputMask mask="9999" value={formData.year} onChange={e => handleInputChange('year', e.target.value)}>{(inputProps: any) => <Input {...inputProps} id="year" placeholder="Ex: 2021" />}</InputMask></div> )}
                    {step === 3 && ( <div className="space-y-2"><Label htmlFor="price">Preço *</Label><Input id="price" placeholder="R$ 0,00" value={formData.price} onChange={e => handleInputChange('price', e.target.value)} /></div> )}
                    {step === 4 && ( <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Textarea id="description" placeholder="Descreva opcionais, estado de conservação, etc." value={formData.description} onChange={e => handleInputChange('description', e.target.value)} rows={5} /></div> )}
                    {step === 5 && ( <div><Label htmlFor="image-upload" className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary transition-colors block"><Upload className="mx-auto h-12 w-12 text-gray-400" /><p className="mt-2 text-sm text-muted-foreground">Clique para selecionar ou arraste as imagens</p></Label><Input id="image-upload" type="file" multiple className="sr-only" onChange={handleImageChange} accept="image/*"/>{images.length > 0 && ( <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">{images.map((file, index) => ( <div key={index} className="relative aspect-video"><img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(index)}><Trash2 className="h-4 w-4" /></Button></div> ))}</div>)}</div> )}
                    {step === 6 && ( <div className="space-y-4 text-sm"><div className="p-4 bg-muted rounded-lg space-y-2"><h3 className="font-semibold">Resumo do Veículo</h3><p><span className="text-muted-foreground">Nome:</span> {formData.name}</p><p><span className="text-muted-foreground">Ano:</span> {formData.year}</p><p><span className="text-muted-foreground">Preço:</span> {formData.price}</p><p><span className="text-muted-foreground">Descrição:</span> {formData.description || "N/A"}</p><p><span className="text-muted-foreground">Imagens:</span> {images.length} foto(s)</p></div></div> )}
                </CardContent>
            </Card>

            <div className="flex justify-between mt-6">
                {step > 1 ? (<Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>) : <div />}
                {step > 0 && step < stepsConfig.length && (<Button onClick={nextStep}>Avançar <ArrowRight className="ml-2 h-4 w-4" /></Button>)}
                {step > 0 && step === stepsConfig.length && (<Button onClick={handleSubmit} disabled={mutation.isPending || !lojaId}>{mutation.isPending ? 'Salvando...' : 'Finalizar Cadastro'}</Button>)}
            </div>
        </div>
    );
}