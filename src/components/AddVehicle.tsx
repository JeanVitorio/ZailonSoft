import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Upload,
  DollarSign,
  Check,
  FileText,
  Calendar,
  Trash2,
  Loader2
} from 'lucide-react';
import {
  addVehicle as addVehicleToSupabase,
  fetchStoreDetails
} from '@/services/api';
import { supabase } from '@/supabaseClient';

// Utils de moeda — mantém preço como string (seu schema atual)
const parseCurrency = (value: string | number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const s = String(value ?? '').trim();
  if (!s) return 0;
  const brlLike = s
    .replace(/\s+/g, '')
    .replace(/R\$\s?/gi, '')
    .replace(/\./g, '')
    .replace(/,/, '.');
  const n1 = Number(brlLike);
  if (Number.isFinite(n1)) return n1;
  const digits = s.replace(/\D+/g, '');
  if (!digits) return 0;
  return digits.length >= 3 ? Number(digits) / 100 : Number(digits);
};

const formatCurrency = (value: string | number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(parseCurrency(value));

// Estado inicial do form
const initialFormData = {
  name: '',
  year: '',
  price: '',
  description: ''
};

export function AddVehicle() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lojaId, setLojaId] = useState<string | null>(null);
  const [isLoadingLoja, setIsLoadingLoja] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Header com dados da loja (logo/nome)
  const { data: storeDetails } = useQuery({
    queryKey: ['storeDetails'],
    queryFn: fetchStoreDetails
  });

  // Busca lojaId do usuário atual
  useEffect(() => {
    const fetchLojaData = async () => {
      setIsLoadingLoja(true);
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (user) {
          const { data: lojaData, error } = await supabase
            .from('lojas')
            .select('id')
            .eq('user_id', user.id)
            .single();
          if (error) {
            console.error('Erro ao buscar loja:', error);
            setLojaId(null);
          } else {
            setLojaId(lojaData.id);
          }
        }
      } catch (e) {
        console.error('Erro geral na busca da loja:', e);
      } finally {
        setIsLoadingLoja(false);
      }
    };
    fetchLojaData();
  }, []);

  // Mutação: cadastrar veículo
  const mutation = useMutation({
    mutationFn: async ({
      vehicleData,
      images,
      lojaId
    }: {
      vehicleData: typeof initialFormData;
      images: File[];
      lojaId: string;
    }) => {
      const payload = {
        name: vehicleData.name,
        year: vehicleData.year,
        price: vehicleData.price, // string (mantém sua coluna preco:string)
        description: vehicleData.description
      };
      return addVehicleToSupabase(payload as any, images, lojaId);
    },
    onSuccess: (_data, variables) => {
      toast({
        title: 'Veículo cadastrado com sucesso! 🎉',
        description: 'Adicionado ao catálogo da sua loja.'
      });
      queryClient.invalidateQueries({
        queryKey: ['vehicles', variables.lojaId]
      });
      resetForm();
      setStep(1);
    },
    onError: (error: Error) => {
      console.error('Erro na Mutação:', error);
      toast({
        title: 'Erro ao cadastrar veículo 😕',
        description: error.message,
        variant: 'destructive',
        duration: 8000
      });
    }
  });

  // Compressão das imagens
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
      console.warn('Erro ao comprimir imagem, enviando original:', error);
      return imageFile;
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValidationError(null);
    if (!e.target.files) return;
    const filesToCompress = Array.from(e.target.files);

    setIsCompressing(true);
    toast({
      title: 'Preparando imagens...',
      description: `Comprimindo ${filesToCompress.length} arquivo(s) para upload rápido...`,
      duration: Math.min(10000, filesToCompress.length * 1500)
    });

    try {
      const compressedImages = await Promise.all(
        filesToCompress.map(f => compressImage(f))
      );
      setImages(prev => [...prev, ...compressedImages]);
      toast({
        title: 'Imagens prontas!',
        description: 'Imagens otimizadas e adicionadas.',
        duration: 2500
      });
    } catch {
      toast({
        title: 'Erro ao processar imagens',
        description: 'Algumas imagens podem não ter sido processadas.',
        variant: 'destructive'
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (index: number) =>
    setImages(prev => prev.filter((_, i) => i !== index));

  // Navegação/validação
  const handleInputChange = (
    field: keyof typeof initialFormData,
    value: string
  ) => {
    setValidationError(null);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setImages([]);
    setValidationError(null);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim())
          return !setValidationError('O nome do veículo é obrigatório.');
        break;
      case 2:
        if (!/^\d{4}$/.test(formData.year))
          return !setValidationError(
            'O ano deve ter 4 dígitos, ex: 2024.'
          );
        break;
      case 3:
        if (parseCurrency(formData.price) <= 0)
          return !setValidationError(
            'O preço deve ser maior que zero.'
          );
        break;
      case 5:
        if (images.length === 0)
          return !setValidationError(
            'Selecione pelo menos uma imagem.'
          );
        if (isCompressing)
          return !setValidationError(
            'Aguarde a compressão das imagens.'
          );
        break;
    }
    setValidationError(null);
    return true;
  };

  const nextStep = () => {
    if (!isLoadingLoja && lojaId && validateStep())
      setStep(p => p + 1);
  };
  const prevStep = () => setStep(p => p - 1);

  const handleSubmit = () => {
    if (!validateStep()) return;
    if (isLoadingLoja || !lojaId) {
      toast({
        title: 'Aguarde',
        description:
          'Identificando a sua loja. Tente novamente em instantes.',
        variant: 'destructive'
      });
      return;
    }
    mutation.mutate({ vehicleData: formData, images, lojaId });
  };

  const stepsConfig = [
    { step: 1, title: 'Nome do veículo', icon: Car },
    { step: 2, title: 'Ano do veículo', icon: Calendar },
    { step: 3, title: 'Valor', icon: DollarSign },
    { step: 4, title: 'Descrição', icon: FileText },
    { step: 5, title: 'Fotos do veículo', icon: Upload },
    { step: 6, title: 'Resumo e confirmação', icon: Check }
  ];
  const currentStepInfo = stepsConfig.find(s => s.step === step);
  const progressValue = useMemo(
    () => (step / stepsConfig.length) * 100,
    [step]
  );

  // Loading inicial
  if (isLoadingLoja) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-6 md:p-10 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            {storeDetails?.logo_url ? (
              <img
                src={storeDetails.logo_url}
                alt="Logo"
                className="w-12 h-12 rounded-full object-contain bg-slate-900 shadow border border-slate-800"
              />
            ) : (
              <div className="w-12 h-12 glass-card rounded-full flex items-center justify-center text-amber-400 font-bold text-xl shadow">
                {storeDetails?.nome?.[0] || 'Z'}
              </div>
            )}
            <h1 className="text-xl font-semibold text-slate-50">
              {storeDetails?.nome || 'Zailon'} • carregando dados da loja...
            </h1>
          </div>
          <Progress
            value={25}
            className="w-full h-2 bg-slate-900 [&>div]:bg-yellow-500 animate-pulse"
          />
        </div>
      </div>
    );
  }

  // Sem loja
  if (!lojaId && !isLoadingLoja) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-6 md:p-10 text-center">
          <Car className="mx-auto h-10 w-10 text-red-400" />
          <h1 className="mt-3 text-xl font-semibold text-red-300">
            Acesso negado ou loja não encontrada
          </h1>
          <p className="text-slate-400">
            Verifique seu login ou cadastre sua loja.
          </p>
        </div>
      </div>
    );
  }

  // UI principal
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {storeDetails?.logo_url ? (
              <img
                src={storeDetails.logo_url}
                alt="Logo"
                className="w-14 h-14 rounded-full object-contain glass-card shadow"
              />
            ) : (
              <div className="w-14 h-14 glass-card rounded-full flex items-center justify-center text-amber-400 font-bold text-2xl shadow">
                {storeDetails?.nome?.[0] || 'Z'}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
                Novo veículo •{' '}
                <span className="gradient-text">
                  {storeDetails?.nome || 'Zailon'}
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Cadastre e publique no catálogo da sua loja
              </p>
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-6">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-gradient-to-r from-yellow-500 via-green-500 to-yellow-400 rounded-full transition-all"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          {currentStepInfo && (
            <p className="mt-2 text-xs text-slate-400">
              Etapa {step} de {stepsConfig.length}:{' '}
              <span className="font-medium text-slate-100">
                {currentStepInfo.title}
              </span>
            </p>
          )}
        </div>

        {/* Erro de validação */}
        {validationError && (
          <p className="mb-4 text-sm font-medium text-red-200 bg-red-950/50 border border-red-700/70 p-3 rounded-lg text-center">
            {validationError}
          </p>
        )}

        {/* Cartão da etapa */}
        <Card
          key={step}
          className="glass-card rounded-2xl shadow-xl"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-50">
              <div className="h-1.5 bg-gradient-to-r from-yellow-500 via-green-500 to-yellow-400 rounded-full w-10" />
              {currentStepInfo?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 1. Nome */}
            {step === 1 && (
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-slate-200"
                >
                  Nome / título do anúncio *
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Honda Civic 2.0 EXL Automático"
                  value={formData.name}
                  onChange={e =>
                    handleInputChange('name', e.target.value)
                  }
                  className="border-slate-700 bg-slate-950 text-slate-50 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
            )}

            {/* 2. Ano */}
            {step === 2 && (
              <div className="space-y-2">
                <Label
                  htmlFor="year"
                  className="text-slate-200"
                >
                  Ano de fabricação *
                </Label>
                <Input
                  id="year"
                  placeholder="Ex: 2021"
                  value={formData.year}
                  onChange={e => {
                    const numericValue = e.target.value.replace(
                      /[^0-9]/g,
                      ''
                    );
                    if (numericValue.length <= 4)
                      handleInputChange('year', numericValue);
                  }}
                  type="tel"
                  maxLength={4}
                  className="border-slate-700 bg-slate-950 text-slate-50 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
            )}

            {/* 3. Preço */}
            {step === 3 && (
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-slate-200"
                >
                  Preço *
                </Label>
                <Input
                  id="price"
                  placeholder="R$ 0,00"
                  value={formData.price}
                  onChange={e => {
                    const rawValue = e.target.value.replace(
                      /[^0-9,.]/g,
                      ''
                    );
                    handleInputChange('price', rawValue);
                  }}
                  onBlur={e =>
                    handleInputChange(
                      'price',
                      formatCurrency(e.target.value)
                    )
                  }
                  type="text"
                  inputMode="decimal"
                  className="border-slate-700 bg-slate-950 text-slate-50 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
            )}

            {/* 4. Descrição */}
            {step === 4 && (
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-slate-200"
                >
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descreva opcionais, estado de conservação, etc."
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  rows={5}
                  className="border-slate-700 bg-slate-950 text-slate-50 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
            )}

            {/* 5. Imagens */}
            {step === 5 && (
              <div className="space-y-4">
                <Label
                  htmlFor="image-upload"
                  className="p-6 border-2 border-dashed border-slate-700 rounded-xl text-center cursor-pointer hover:border-yellow-500/60 hover:bg-slate-900/70 transition-colors block"
                  aria-disabled={isCompressing}
                >
                  {isCompressing ? (
                    <Loader2 className="mx-auto h-12 w-12 text-emerald-400 animate-spin" />
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                  )}
                  {isCompressing ? (
                    <p className="mt-2 text-sm font-semibold text-emerald-200">
                      Processando e comprimindo imagens...
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-200">
                      Clique para selecionar ou arraste as imagens
                    </p>
                  )}
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleImageChange}
                  accept="image/*"
                  disabled={isCompressing}
                />

                {images.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((file, index) => (
                      <div
                        key={index}
                        className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600"
                          size="icon"
                          onClick={() => removeImage(index)}
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {isCompressing && (
                      <div className="p-4 flex items-center justify-center glass-card rounded-lg border-2 border-yellow-500/50">
                        <Loader2 className="h-6 w-6 text-yellow-400 animate-spin mr-2" />
                        <span className="text-sm text-yellow-300">
                          Comprimindo...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 6. Resumo */}
            {step === 6 && (
              <div className="space-y-4 text-sm">
                <div className="p-4 bg-slate-900/80 rounded-lg space-y-2 border border-slate-800">
                  <h3 className="font-semibold text-slate-50">
                    Resumo do veículo
                  </h3>
                  <p>
                    <span className="text-slate-100">Nome:</span>{' '}
                    <span className="font-semibold text-slate-50">
                      {formData.name}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-100">Ano:</span>{' '}
                    <span className="text-slate-50">
                      {formData.year}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-100">Preço:</span>{' '}
                    <span className="font-semibold text-lg text-emerald-300">
                      {formatCurrency(formData.price)}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-100">Descrição:</span>{' '}
                    <span className="text-slate-50">
                      {formData.description || 'N/A'}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-100">Imagens:</span>{' '}
                    <span className="text-slate-50">
                      {images.length} foto(s)
                    </span>
                  </p>
                </div>
                <p className="text-xs text-slate-200">
                  Ao clicar em{' '}
                  <strong>"Finalizar cadastro"</strong>, o veículo será
                  enviado para o catálogo da sua loja.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-emerald-400 hover:text-slate-50"
              onClick={prevStep}
              disabled={mutation.isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < stepsConfig.length && (
            <Button
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold disabled:bg-emerald-300"
              onClick={nextStep}
              disabled={
                mutation.isPending || isLoadingLoja || isCompressing
              }
            >
              {isCompressing ? 'Processando fotos...' : 'Avançar'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {step === stepsConfig.length && (
            <Button
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold disabled:bg-emerald-300"
              onClick={handleSubmit}
              disabled={mutation.isPending || !lojaId}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Finalizar cadastro'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddVehicle;
