import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, ArrowRight, Car, Upload, DollarSign, Check, FileText, Calendar, Trash2, Loader2 } from 'lucide-react';
import { addVehicle as addVehicleToSupabase } from '@/services/api';
import { supabase } from '@/supabaseClient';

// --- Funções Auxiliares ---
const parseCurrency = (value: string): number => {
    if (!value) return 0;
    // Corrigido para lidar com entradas de usuário (ex: 10000) e valores formatados (ex: R$ 10.000,00)
    const cleaned = String(value).replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    return Number(cleaned) || 0;
};

// 💡 Mantive a lógica de formatação de currency mais simples para usar no onBlur
const formatCurrency = (value: string): string => {
    const num = parseCurrency(value);
    // Garante que o número formatado retorne "R$ 0,00" se for 0, ou o valor formatado
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
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
    const [lojaId, setLojaId] = useState<string | null>(null);
    const [isLoadingLoja, setIsLoadingLoja] = useState(true);

    const { toast } = useToast();
    const queryClient = useQueryClient();

    // 💡 Melhoria: Busca do LojaId com tratamento de loading
    useEffect(() => {
        const fetchLojaData = async () => {
            setIsLoadingLoja(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: lojaData, error } = await supabase
                        .from('lojas')
                        .select('id')
                        .eq('user_id', user.id)
                        .single();

                    if (error) {
                        console.error("Erro ao buscar dados da loja:", error);
                        setLojaId(null);
                    } else if (lojaData) {
                        setLojaId(lojaData.id);
                    } else {
                        toast({
                            title: "Loja Não Encontrada",
                            description: "Você não tem uma loja cadastrada. Não é possível adicionar veículos.",
                            variant: "destructive"
                        });
                    }
                }
            } catch (e) {
                console.error("Erro geral na busca da loja:", e);
            } finally {
                setIsLoadingLoja(false);
            }
        };
        fetchLojaData();
    }, [toast]);

    const mutation = useMutation({
        mutationFn: ({ vehicleData, images, lojaId }: { vehicleData: typeof initialFormData; images: File[]; lojaId: string }) =>
            addVehicleToSupabase(vehicleData, images, lojaId),
        onSuccess: () => {
            toast({
                title: "Veículo cadastrado com sucesso! 🎉",
                description: `Adicionado ao catálogo da sua loja.`,
            });
            queryClient.invalidateQueries({ queryKey: ['availableCars'] });
            resetForm();
        },
        onError: (error: Error) => {
            console.error("Erro na Mutação:", error);
            toast({
                title: "Erro ao cadastrar veículo 😕",
                description: `Falha: ${error.message}. Tente novamente. (Se estiver no celular, o upload de fotos pode ser lento.)`,
                variant: 'destructive',
                duration: 8000,
            });
        },
    });

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
            case 1: 
                if (!formData.name.trim()) return !setValidationError("O nome do veículo é obrigatório."); 
                break;
            case 2: 
                if (!/^\d{4}$/.test(formData.year)) return !setValidationError("O ano deve ter 4 dígitos, ex: 2024."); 
                break;
            case 3: 
                if (parseCurrency(formData.price) <= 0) return !setValidationError("O preço deve ser maior que zero."); 
                break;
            case 5: 
                if (images.length === 0) return !setValidationError("Selecione pelo menos uma imagem."); 
                break;
        }
        setValidationError(null);
        return true;
    };

    const nextStep = () => { 
        if (!isLoadingLoja && lojaId && validateStep()) { 
            setStep(prev => prev + 1); 
        } 
    };
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = () => {
        if (!validateStep()) return;
        if (isLoadingLoja || !lojaId) {
            toast({
                title: "Aguarde",
                description: "Estamos aguardando a identificação da sua loja. Tente novamente em instantes.",
                variant: 'destructive',
            });
            return;
        }
        mutation.mutate({ vehicleData: formData, images: images, lojaId: lojaId });
    };
    
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

    // Renderização de Loading Inicial
    if (isLoadingLoja) {
        return (
            <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-2xl font-poppins text-center mt-20">
                <Loader2 className="mx-auto h-8 w-8 text-amber-500 animate-spin" />
                <h1 className="text-xl font-semibold text-zinc-900">Aguardando dados da sua loja...</h1>
                <p className="text-zinc-600">Verificando sua permissão para cadastrar veículos.</p>
                <Progress value={25} className="w-full h-2 bg-zinc-200 [&>div]:bg-amber-500 animate-pulse" />
            </div>
        );
    }
    
    // Renderização de Erro Fatal
    if (!lojaId && !isLoadingLoja) {
        return (
            <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-2xl font-poppins text-center mt-20">
                <Car className="mx-auto h-8 w-8 text-red-500" />
                <h1 className="text-xl font-semibold text-red-700">Acesso Negado ou Loja Não Encontrada</h1>
                <p className="text-zinc-600">Você não tem permissão ou sua loja não está cadastrada. Por favor, entre em contato com o suporte ou refaça seu login.</p>
            </div>
        );
    }


    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-2xl font-poppins">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-zinc-900">Cadastro de Novo Veículo</h1>
                {currentStepInfo && (
                    <p className="text-zinc-600">Etapa {step} de {stepsConfig.length}: {currentStepInfo.title}</p>
                )}
            </div>
            
            <Progress value={progressValue} className="w-full h-2 bg-zinc-200 [&>div]:bg-amber-500" />
            
            {validationError && <p className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md text-center">{validationError}</p>}
            
            <Card key={step} className="bg-white/70 border-zinc-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-zinc-900">
                        {currentStepInfo?.icon && React.createElement(currentStepInfo.icon, { className: "h-5 w-5" })}
                        {currentStepInfo?.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        {/* ETAPA 1: NOME */}
                        {step === 1 && (
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-zinc-600">Nome / Título do Anúncio *</Label>
                                <Input id="name" placeholder="Ex: Honda Civic 2.0 EXL Automático" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20" />
                            </div>
                        )}
                        
                        {/* ETAPA 2: ANO */}
                        {step === 2 && (
                            <div className="space-y-2">
                                <Label htmlFor="year" className="text-zinc-600">Ano de Fabricação *</Label>
                                <Input
                                    id="year"
                                    placeholder="Ex: 2021"
                                    value={formData.year}
                                    onChange={e => {
                                        const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                        if (numericValue.length <= 4) {
                                            handleInputChange('year', numericValue);
                                        }
                                    }}
                                    type="tel"
                                    maxLength={4}
                                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                                />
                            </div>
                        )}

                        {/* ETAPA 3: PREÇO (CORRIGIDO) */}
                        {step === 3 && (
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-zinc-600">Preço *</Label>
                                <Input
                                    id="price"
                                    placeholder="R$ 0,00"
                                    value={formData.price}
                                    onChange={e => {
                                        // Permite digitação contínua (só números e separadores)
                                        const rawValue = e.target.value.replace(/[^0-9,.]/g, '');
                                        handleInputChange('price', rawValue);
                                    }}
                                    onBlur={e => {
                                        // Aplica a formatação R$ 1.000,00 ao sair do campo
                                        handleInputChange('price', formatCurrency(e.target.value));
                                    }}
                                    type="text"
                                    inputMode="decimal"
                                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                                />
                            </div>
                        )}
                        
                        {/* ETAPA 4: DESCRIÇÃO */}
                        {step === 4 && (
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-zinc-600">Descrição</Label>
                                <Textarea id="description" placeholder="Descreva opcionais, estado de conservação, etc." value={formData.description} onChange={e => handleInputChange('description', e.target.value)} rows={5} className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20" />
                            </div>
                        )}

                        {/* ETAPA 5: UPLOAD DE IMAGENS */}
                        {step === 5 && (
                            <div>
                                <div>
                                    <Label htmlFor="image-upload" className="p-6 border-2 border-dashed border-zinc-200 rounded-lg text-center cursor-pointer hover:border-amber-400/50 transition-colors block">
                                        <Upload className="mx-auto h-12 w-12 text-zinc-400" />
                                        <p className="mt-2 text-sm text-zinc-600">Clique para selecionar ou arraste as imagens</p>
                                    </Label>
                                    <Input id="image-upload" type="file" multiple className="sr-only" onChange={handleImageChange} accept="image/*"/>
                                    {images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {images.map((file, index) => (
                                                <div key={index} className="relative aspect-video">
                                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover rounded-md" />
                                                    <Button className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600" size="icon" onClick={() => removeImage(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ETAPA 6: RESUMO */}
                        {step === 6 && (
                            <div>
                                <div className="space-y-4 text-sm">
                                    <div className="p-4 bg-zinc-100 rounded-lg space-y-2">
                                        <h3 className="font-semibold text-zinc-900">Resumo do Veículo</h3>
                                        <p><span className="text-zinc-600">Nome:</span> **{formData.name}**</p>
                                        <p><span className="text-zinc-600">Ano:</span> {formData.year}</p>
                                        <p><span className="text-zinc-600">Preço:</span> <span className="font-semibold text-lg text-amber-600">{formatCurrency(formData.price)}</span></p>
                                        <p><span className="text-zinc-600">Descrição:</span> {formData.description || "N/A"}</p>
                                        <p><span className="text-zinc-600">Imagens:</span> {images.length} foto(s)</p>
                                    </div>
                                    <p className="text-xs text-zinc-500">Ao clicar em "Finalizar Cadastro", o veículo será enviado para o catálogo da sua loja.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between mt-6">
                {step > 1 ? (
                    <Button className="border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50" variant="outline" onClick={prevStep} disabled={mutation.isPending}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                ) : <div />}
                
                {step > 0 && step < stepsConfig.length && (
                    <Button 
                        className="bg-amber-500 hover:bg-amber-600 text-white disabled:bg-amber-300" 
                        onClick={nextStep}
                        disabled={mutation.isPending || isLoadingLoja}
                    >
                        Avançar <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                
                {step > 0 && step === stepsConfig.length && (
                    <Button 
                        className="bg-amber-500 hover:bg-amber-600 text-white disabled:bg-amber-300" 
                        onClick={handleSubmit} 
                        disabled={mutation.isPending || !lojaId}
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Enviando...
                            </>
                        ) : (
                            'Finalizar Cadastro'
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}