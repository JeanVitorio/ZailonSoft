import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Upload, Trash2, MapPin, DollarSign, Car, CalendarDays, User, CreditCard, FileImage, Shield } from 'lucide-react';
import { Vehicle } from '@/data/vehicles';
import { formatPrice, maskPhone } from '@/lib/formatters';
import { useData } from '@/contexts/DataContext';
import { Button } from './button';

interface LeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

type InterestType = 'cash' | 'financing' | 'trade' | 'visit' | null;

interface FormData {
  name: string;
  age: string;
  whatsapp: string;
  interestType: InterestType;
  // Financing
  downPayment: string;
  installments: number;
  // Trade
  tradeBrand: string;
  tradeModel: string;
  tradeYear: string;
  tradeValue: string;
  tradePhotos: File[];
  tradeDifference: 'cash' | 'financing' | null;
  // Visit
  visitDate: string;
  visitTime: string;
  // CNH
  cnhFile: File | null;
  // LGPD
  lgpdConsent: boolean;
}

const initialFormData: FormData = {
  name: '',
  age: '',
  whatsapp: '',
  interestType: null,
  downPayment: '',
  installments: 24,
  tradeBrand: '',
  tradeModel: '',
  tradeYear: '',
  tradeValue: '',
  tradePhotos: [],
  tradeDifference: null,
  visitDate: '',
  visitTime: '',
  cnhFile: null,
  lgpdConsent: false,
};

const INSTALLMENT_OPTIONS = [12, 24, 36, 48, 60];
const TIME_SLOTS = Array.from({ length: 11 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export const LeadForm: React.FC<LeadFormProps> = ({ isOpen, onClose, vehicle }) => {
  const { addLead, store } = useData();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cnhPreview, setCnhPreview] = useState<string | null>(null);

  const totalSteps = useCallback(() => {
    // 0: Welcome, 1: Personal, 2: Interest, 3: dynamic, 4: CNH, 5: Confirm
    let count = 5; // welcome + personal + interest + cnh + confirm
    if (formData.interestType === 'financing') count += 1;
    if (formData.interestType === 'trade') count += 1;
    if (formData.interestType === 'visit') count += 1;
    if (formData.interestType === 'cash') count += 0; // skips to CNH
    if (formData.interestType === 'trade' && formData.tradeDifference === 'financing') count += 1;
    return count;
  }, [formData.interestType, formData.tradeDifference]);

  const progressPercent = Math.min(((step) / (totalSteps() - 1)) * 100, 100);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name || formData.name.length < 3) newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
      const age = parseInt(formData.age);
      if (!formData.age || isNaN(age) || age < 18) newErrors.age = 'Idade mínima: 18 anos';
      const cleanPhone = formData.whatsapp.replace(/\D/g, '');
      if (cleanPhone.length < 10) newErrors.whatsapp = 'WhatsApp inválido';
    }

    if (step === 2) {
      if (!formData.interestType) newErrors.interestType = 'Selecione uma opção';
    }

    // Financing validation
    if (isFinancingStep()) {
      const dp = parseCurrency(formData.downPayment);
      if (dp <= 0) newErrors.downPayment = 'Entrada deve ser maior que R$ 0';
      if (dp > vehicle.price) newErrors.downPayment = 'Entrada não pode ser maior que o valor do veículo';
    }

    // Trade validation
    if (isTradeStep()) {
      if (!formData.tradeBrand) newErrors.tradeBrand = 'Informe a marca';
      if (!formData.tradeModel) newErrors.tradeModel = 'Informe o modelo';
      if (!formData.tradeYear) newErrors.tradeYear = 'Informe o ano';
      if (!formData.tradeValue) newErrors.tradeValue = 'Informe o valor estimado';
    }

    // Trade difference step
    if (isTradeDiffStep()) {
      if (!formData.tradeDifference) newErrors.tradeDifference = 'Selecione uma opção';
    }

    // Visit validation
    if (isVisitStep()) {
      if (!formData.visitDate) newErrors.visitDate = 'Selecione uma data';
      if (!formData.visitTime) newErrors.visitTime = 'Selecione um horário';
      const today = new Date().toISOString().split('T')[0];
      if (formData.visitDate && formData.visitDate <= today) newErrors.visitDate = 'Data deve ser futura';
    }

    // CNH
    if (isCnhStep()) {
      if (!formData.cnhFile) newErrors.cnhFile = 'Upload da CNH é obrigatório';
    }

    // Final
    if (isFinalStep()) {
      if (!formData.lgpdConsent) newErrors.lgpdConsent = 'Autorização LGPD é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseCurrency = (val: string) => {
    const cleaned = val.replace(/[^\d]/g, '');
    return parseInt(cleaned) || 0;
  };

  const formatCurrencyInput = (val: string) => {
    const num = parseCurrency(val);
    if (num === 0) return '';
    return formatPrice(num);
  };

  // Step identification helpers
  const getStepSequence = (): string[] => {
    const steps = ['welcome', 'personal', 'interest'];
    if (formData.interestType === 'financing') steps.push('financing');
    if (formData.interestType === 'trade') {
      steps.push('trade');
      const tradeVal = parseCurrency(formData.tradeValue);
      if (tradeVal < vehicle.price) steps.push('tradeDiff');
      if (formData.tradeDifference === 'financing') steps.push('financing');
    }
    if (formData.interestType === 'visit') steps.push('visit');
    steps.push('cnh', 'final');
    return steps;
  };

  const currentStepName = () => getStepSequence()[step] || 'welcome';
  const isFinancingStep = () => currentStepName() === 'financing';
  const isTradeStep = () => currentStepName() === 'trade';
  const isTradeDiffStep = () => currentStepName() === 'tradeDiff';
  const isVisitStep = () => currentStepName() === 'visit';
  const isCnhStep = () => currentStepName() === 'cnh';
  const isFinalStep = () => currentStepName() === 'final';

  const next = () => {
    if (!validateStep()) return;
    const seq = getStepSequence();
    if (step < seq.length - 1) setStep(step + 1);
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!validateStep()) return;

    addLead({
      name: formData.name,
      email: '',
      phone: formData.whatsapp,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      status: 'new',
      priority: 'medium',
      value: vehicle.price,
      notes: `Tipo: ${formData.interestType}${formData.interestType === 'financing' ? ` | Entrada: ${formData.downPayment} | ${formData.installments}x` : ''}${formData.interestType === 'visit' ? ` | Visita: ${formData.visitDate} ${formData.visitTime}` : ''}`,
      source: 'catalog',
    });

    // Reset & close
    setStep(0);
    setFormData(initialFormData);
    setCnhPreview(null);
    onClose();
  };

  const handleCnhUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors(prev => ({ ...prev, cnhFile: 'Formato inválido. Use JPG, PNG ou WEBP' }));
      return;
    }
    updateField('cnhFile', file);
    const reader = new FileReader();
    reader.onload = (ev) => setCnhPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    setStep(0);
    setFormData(initialFormData);
    setCnhPreview(null);
    setErrors({});
    onClose();
  };

  const interestOptions = [
    { type: 'cash' as const, icon: DollarSign, label: 'À vista', color: 'amber' },
    { type: 'financing' as const, icon: CreditCard, label: 'Financiamento', color: 'emerald' },
    { type: 'trade' as const, icon: Car, label: 'Troca', color: 'blue' },
    { type: 'visit' as const, icon: MapPin, label: 'Visita à loja', color: 'purple' },
  ];

  const dpNum = parseCurrency(formData.downPayment);
  const toFinance = vehicle.price - dpNum;

  const renderStep = () => {
    const name = currentStepName();

    switch (name) {
      case 'welcome':
        return (
          <div className="flex flex-col items-center text-center py-6 md:py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 md:mb-6"
            >
              <span className="text-3xl md:text-4xl">👋</span>
            </motion.div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Oi! Eu sou o Zailon</h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-sm leading-relaxed">
              Assistente da loja. Vou te fazer algumas perguntas rápidas pra te ajudar com esse carro, tudo bem?
            </p>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Seus dados
            </h3>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Nome completo</label>
              <input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Seu nome"
                className={`input-premium w-full h-12 md:h-14 ${errors.name ? 'border-red-500/50 animate-[shake_0.3s_ease-in-out]' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Idade</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                placeholder="Sua idade"
                min={18}
                className={`input-premium w-full h-12 md:h-14 ${errors.age ? 'border-red-500/50 animate-[shake_0.3s_ease-in-out]' : ''}`}
              />
              {errors.age && <p className="text-xs text-red-400 mt-1">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">WhatsApp</label>
              <input
                value={formData.whatsapp}
                onChange={(e) => updateField('whatsapp', maskPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className={`input-premium w-full h-12 md:h-14 ${errors.whatsapp ? 'border-red-500/50 animate-[shake_0.3s_ease-in-out]' : ''}`}
              />
              {errors.whatsapp && <p className="text-xs text-red-400 mt-1">{errors.whatsapp}</p>}
            </div>
          </div>
        );

      case 'interest':
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg md:text-xl font-bold text-white">Como deseja adquirir?</h3>
            {errors.interestType && <p className="text-xs text-red-400">{errors.interestType}</p>}
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map((opt) => (
                <motion.button
                  key={opt.type}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateField('interestType', opt.type)}
                  className={`p-4 md:p-6 rounded-2xl border transition-all text-center ${
                    formData.interestType === opt.type
                      ? 'border-amber-500/50 bg-amber-500/10 glow-amber'
                      : 'border-white/6 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <opt.icon className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                    formData.interestType === opt.type ? 'text-amber-400' : 'text-muted-foreground'
                  }`} />
                  <span className={`text-sm md:text-base font-medium ${
                    formData.interestType === opt.type ? 'text-amber-400' : 'text-white'
                  }`}>
                    {opt.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'financing':
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              Simulação de Financiamento
            </h3>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Valor do veículo</p>
              <p className="text-lg font-bold text-amber-400">{formatPrice(vehicle.price)}</p>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Valor de entrada</label>
              <input
                value={formData.downPayment}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  updateField('downPayment', raw ? formatCurrencyInput(raw) : '');
                }}
                placeholder="R$ 0"
                className={`input-premium w-full h-12 md:h-14 ${errors.downPayment ? 'border-red-500/50' : ''}`}
              />
              {errors.downPayment && <p className="text-xs text-red-400 mt-1">{errors.downPayment}</p>}
              {dpNum > 0 && dpNum < vehicle.price * 0.3 && (
                <p className="text-xs text-amber-400 mt-1">⚠️ Entrada abaixo de 30% pode dificultar aprovação</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Parcelas</label>
              <div className="flex flex-wrap gap-2">
                {INSTALLMENT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => updateField('installments', n)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.installments === n
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {n}x
                  </button>
                ))}
              </div>
            </div>
            {dpNum > 0 && toFinance > 0 && (
              <div className="glass-card rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entrada</span>
                  <span className="text-white font-medium">{formatPrice(dpNum)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">A financiar</span>
                  <span className="text-white font-medium">{formatPrice(toFinance)}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">≈ Parcela</span>
                  <span className="text-amber-400 font-bold">{formatPrice(Math.ceil(toFinance / formData.installments))}/mês</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'trade':
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-amber-400" />
              Dados do veículo de troca
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Marca</label>
                <input
                  value={formData.tradeBrand}
                  onChange={(e) => updateField('tradeBrand', e.target.value)}
                  placeholder="Ex: Honda"
                  className={`input-premium w-full h-12 ${errors.tradeBrand ? 'border-red-500/50' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Modelo</label>
                <input
                  value={formData.tradeModel}
                  onChange={(e) => updateField('tradeModel', e.target.value)}
                  placeholder="Ex: Civic"
                  className={`input-premium w-full h-12 ${errors.tradeModel ? 'border-red-500/50' : ''}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Ano</label>
                <input
                  value={formData.tradeYear}
                  onChange={(e) => updateField('tradeYear', e.target.value)}
                  placeholder="Ex: 2020"
                  className={`input-premium w-full h-12 ${errors.tradeYear ? 'border-red-500/50' : ''}`}
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Valor estimado</label>
                <input
                  value={formData.tradeValue}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    updateField('tradeValue', raw ? formatCurrencyInput(raw) : '');
                  }}
                  placeholder="R$ 0"
                  className={`input-premium w-full h-12 ${errors.tradeValue ? 'border-red-500/50' : ''}`}
                />
              </div>
            </div>
            {Object.keys(errors).some(k => ['tradeBrand', 'tradeModel', 'tradeYear', 'tradeValue'].includes(k) && errors[k]) && (
              <p className="text-xs text-red-400">Preencha todos os campos do veículo de troca</p>
            )}
          </div>
        );

      case 'tradeDiff':
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg md:text-xl font-bold text-white">Como pagar a diferença?</h3>
            <div className="glass-card rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor do veículo</span>
                <span className="text-white">{formatPrice(vehicle.price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor da troca</span>
                <span className="text-white">{formatPrice(parseCurrency(formData.tradeValue))}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Diferença</span>
                <span className="text-amber-400 font-bold">{formatPrice(vehicle.price - parseCurrency(formData.tradeValue))}</span>
              </div>
            </div>
            {errors.tradeDifference && <p className="text-xs text-red-400">{errors.tradeDifference}</p>}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => updateField('tradeDifference', 'cash')}
                className={`p-4 md:p-5 rounded-2xl border transition-all text-center ${
                  formData.tradeDifference === 'cash'
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-white/6 bg-white/[0.02]'
                }`}
              >
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                <span className="text-sm font-medium text-white">À vista</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => updateField('tradeDifference', 'financing')}
                className={`p-4 md:p-5 rounded-2xl border transition-all text-center ${
                  formData.tradeDifference === 'financing'
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-white/6 bg-white/[0.02]'
                }`}
              >
                <CreditCard className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                <span className="text-sm font-medium text-white">Financiar</span>
              </motion.button>
            </div>
          </div>
        );

      case 'visit':
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              Agende sua visita
            </h3>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">Data</label>
              <input
                type="date"
                value={formData.visitDate}
                onChange={(e) => updateField('visitDate', e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className={`input-premium w-full h-12 md:h-14 ${errors.visitDate ? 'border-red-500/50' : ''}`}
              />
              {errors.visitDate && <p className="text-xs text-red-400 mt-1">{errors.visitDate}</p>}
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Horário</label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => updateField('visitTime', t)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      formData.visitTime === t
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {errors.visitTime && <p className="text-xs text-red-400 mt-1">{errors.visitTime}</p>}
            </div>
          </div>
        );

      case 'cnh':
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <FileImage className="w-5 h-5 text-amber-400" />
              Documentação (CNH)
            </h3>
            <p className="text-sm text-muted-foreground">Envie uma foto da sua CNH para agilizar o processo.</p>

            {cnhPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/10">
                <img src={cnhPreview} alt="CNH Preview" className="w-full h-48 md:h-56 object-contain bg-black/50" />
                <button
                  onClick={() => { updateField('cnhFile', null); setCnhPreview(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center p-8 md:p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                errors.cnhFile ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/[0.02] hover:border-amber-500/30 hover:bg-amber-500/5'
              }`}>
                <Upload className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground mb-3" />
                <span className="text-sm text-muted-foreground text-center">
                  Toque para enviar sua CNH
                </span>
                <span className="text-xs text-muted-foreground mt-1">JPG, PNG ou WEBP</span>
                <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleCnhUpload} />
              </label>
            )}
            {errors.cnhFile && <p className="text-xs text-red-400">{errors.cnhFile}</p>}
          </div>
        );

      case 'final':
        return (
          <div className="space-y-4 md:space-y-5">
            <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              Confirmação
            </h3>

            <div className="glass-card rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nome</span>
                <span className="text-white font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">WhatsApp</span>
                <span className="text-white font-medium">{formData.whatsapp}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Negociação</span>
                <span className="text-amber-400 font-medium capitalize">{
                  formData.interestType === 'cash' ? 'À vista' :
                  formData.interestType === 'financing' ? 'Financiamento' :
                  formData.interestType === 'trade' ? 'Troca' : 'Visita'
                }</span>
              </div>
              {formData.interestType === 'financing' && dpNum > 0 && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Entrada</span>
                    <span className="text-white">{formatPrice(dpNum)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Parcelas</span>
                    <span className="text-white">{formData.installments}x de {formatPrice(Math.ceil(toFinance / formData.installments))}</span>
                  </div>
                </>
              )}
              {formData.interestType === 'visit' && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Visita</span>
                  <span className="text-white">{formData.visitDate} às {formData.visitTime}</span>
                </div>
              )}
            </div>

            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              formData.lgpdConsent ? 'border-emerald-500/30 bg-emerald-500/5' : errors.lgpdConsent ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/[0.02]'
            }`}>
              <div className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                formData.lgpdConsent ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
              }`}>
                {formData.lgpdConsent && <Check className="w-3 h-3 text-white" />}
              </div>
              <input type="checkbox" className="hidden" checked={formData.lgpdConsent} onChange={(e) => updateField('lgpdConsent', e.target.checked)} />
              <span className="text-xs text-muted-foreground leading-relaxed">
                <Shield className="w-3 h-3 inline mr-1 text-amber-400" />
                Autorizo o uso dos meus dados conforme a LGPD (Lei Geral de Proteção de Dados) para fins de contato comercial.
              </span>
            </label>
            {errors.lgpdConsent && <p className="text-xs text-red-400">{errors.lgpdConsent}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl overflow-hidden bg-[#0a0a0a] border-0 sm:border border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={vehicle.images[0]} alt={vehicle.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{vehicle.name}</p>
                  <p className="text-xs text-amber-400 font-medium">{formatPrice(vehicle.price)}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Progress */}
              <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-white/5 flex gap-3">
              {step > 0 && (
                <Button variant="ghost" onClick={prev} className="flex-shrink-0">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              )}
              <div className="flex-1" />
              {isFinalStep() ? (
                <Button variant="premium" onClick={handleSubmit} className="min-w-[140px]">
                  Enviar Proposta
                  <Check className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button variant="premium" onClick={next} className="min-w-[120px]">
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
