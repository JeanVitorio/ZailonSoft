import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Vehicle, LeadData, InterestType } from '@/types/vehicle';
import { supabase } from '@/services/supabaseClient';

interface LeadFormProps {
  vehicle?: Vehicle;
  vehicleId?: string;
  vehicleName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

type Step = 'personal' | 'interest' | 'cash-confirm' | 'financing-entry' | 'financing-installments' | 'financing-cnh' | 'financing-lgpd' | 'trade-info' | 'trade-difference' | 'visit-schedule' | 'success';

export function LeadForm({ vehicle, vehicleId, vehicleName, isOpen, onClose }: LeadFormProps) {
  const [step, setStep] = useState<Step>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayVehicle = {
    id: vehicle?.id ?? vehicleId ?? '',
    name: vehicle?.name ?? vehicleName ?? 'Veículo',
    price: vehicle?.price ?? 0,
    mainImage: vehicle?.mainImage ?? '',
  } as Vehicle;

  const [leadData, setLeadData] = useState<Partial<LeadData>>({
    vehicleId: displayVehicle.id,
    lgpdConsent: false,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const financingValue = displayVehicle.price - (leadData.downPayment || 0);

  const handleInterestSelect = (type: InterestType) => {
    setLeadData(prev => ({ ...prev, interestType: type }));
    setError(null);
    switch (type) {
      case 'cash':
        setStep('cash-confirm');
        break;
      case 'financing':
        setStep('financing-entry');
        break;
      case 'trade':
        setStep('trade-info');
        break;
      case 'visit':
        setStep('visit-schedule');
        break;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Upload files if present
      let cnhUrl = '';
      let tradeImagesUrls: string[] = [];

      if (leadData.cnhImage) {
        const fileName = `cnh_${Date.now()}_${leadData.cnhImage.name}`;
        const { error: uploadError, data } = await supabase.storage
          .from('leads')
          .upload(fileName, leadData.cnhImage);

        if (uploadError) throw uploadError;
        cnhUrl = data?.path || '';
      }

      if (leadData.tradeImages && leadData.tradeImages.length > 0) {
        for (const img of leadData.tradeImages) {
          const fileName = `trade_${Date.now()}_${Math.random()}_${img.name}`;
          const { error: uploadError, data } = await supabase.storage
            .from('leads')
            .upload(fileName, img);

          if (uploadError) throw uploadError;
          if (data?.path) tradeImagesUrls.push(data.path);
        }
      }

      // Save lead to database
      const leadRecord = {
        vehicle_id: displayVehicle.id,
        vehicle_name: displayVehicle.name,
        vehicle_price: displayVehicle.price,
        name: leadData.name || '',
        age: leadData.age || '',
        phone: leadData.phone || '',
        interest_type: leadData.interestType || 'cash',
        down_payment: leadData.downPayment || 0,
        installments: leadData.installments || 0,
        cnh_image_url: cnhUrl,
        trade_model: leadData.tradeModel || '',
        trade_year: leadData.tradeYear || '',
        trade_value: leadData.tradeValue || 0,
        trade_images_urls: tradeImagesUrls,
        trade_difference: leadData.tradeDifference || '',
        visit_date: leadData.visitDate || '',
        visit_time: leadData.visitTime || '',
        lgpd_consent: leadData.lgpdConsent,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from('leads')
        .insert([leadRecord]);

      if (insertError) throw insertError;

      setStep('success');
      setTimeout(() => {
        onClose?.();
        setStep('personal');
        setLeadData({ vehicleId: displayVehicle.id, lgpdConsent: false });
      }, 3000);
    } catch (err: any) {
      console.error('Erro ao enviar lead:', err);
      setError(err?.message || 'Erro ao enviar. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    switch (step) {
      case 'interest':
        setStep('personal');
        break;
      case 'cash-confirm':
      case 'financing-entry':
      case 'trade-info':
      case 'visit-schedule':
        setStep('interest');
        break;
      case 'financing-installments':
        setStep('financing-entry');
        break;
      case 'financing-cnh':
        setStep('financing-installments');
        break;
      case 'financing-lgpd':
        setStep('financing-cnh');
        break;
      case 'trade-difference':
        setStep('trade-info');
        break;
    }
  };

  if (isOpen === false) return null;

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
        onClick={() => onClose?.()}
      />
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 max-h-[90vh] overflow-y-auto"
      >
        <div className="w-full md:w-[440px] bg-slate-900/90 rounded-t-3xl md:rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={displayVehicle.mainImage} alt={displayVehicle.name} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <p className="font-semibold text-sm text-white">{displayVehicle.name}</p>
                <p className="text-xs text-slate-400">{formatPrice(displayVehicle.price)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onClose?.()} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {step === 'personal' && (
              <motion.div
                key="personal"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center">Seus dados</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Nome completo"
                    value={leadData.name || ''}
                    onChange={(e) => setLeadData(prev => ({ ...prev, name: e.target.value }))}
                    className="py-3 bg-slate-900/50 border-slate-700 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Idade"
                    value={leadData.age || ''}
                    onChange={(e) => setLeadData(prev => ({ ...prev, age: e.target.value }))}
                    className="py-3 bg-slate-900/50 border-slate-700 text-white"
                  />
                  <Input
                    type="tel"
                    placeholder="WhatsApp"
                    value={leadData.phone || ''}
                    onChange={(e) => setLeadData(prev => ({ ...prev, phone: e.target.value }))}
                    className="py-3 bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">{error}</div>}
                <Button
                  onClick={() => {
                    if (!leadData.name || !leadData.age || !leadData.phone) {
                      setError('Preencha todos os campos');
                      return;
                    }
                    setError(null);
                    setStep('interest');
                  }}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 'interest' && (
              <motion.div
                key="interest"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center">Como adquirir?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { t: 'cash' as const, l: 'À Vista', i: '💰' },
                    { t: 'financing' as const, l: 'Financiamento', i: '🏦' },
                    { t: 'trade' as const, l: 'Troca', i: '🔄' },
                    { t: 'visit' as const, l: 'Visitar', i: '📍' },
                  ].map((o) => (
                    <button
                      key={o.t}
                      onClick={() => handleInterestSelect(o.t)}
                      className="p-6 rounded-xl bg-slate-900/30 border border-slate-800 hover:border-yellow-500/50 flex flex-col items-center gap-2"
                    >
                      <span className="text-3xl">{o.i}</span>
                      <span className="text-white text-sm font-medium">{o.l}</span>
                    </button>
                  ))}
                </div>
                <Button variant="ghost" onClick={goBack} className="w-full text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              </motion.div>
            )}

            {step === 'cash-confirm' && (
              <motion.div
                key="cash"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-4xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-white">À Vista</h3>
                <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-400">Veículo</p>
                  <p className="text-xl font-bold text-yellow-500">{formatPrice(displayVehicle.price)}</p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar'} <Check className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="ghost" onClick={goBack} disabled={isSubmitting} className="w-full text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="space-y-6 text-center py-8"
              >
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-12 h-12 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white">Enviado!</h3>
                <p className="text-slate-400">Entraremos em contato via WhatsApp</p>
                <Button onClick={() => onClose?.()} className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                  Voltar
                </Button>
              </motion.div>
            )}

            {step === 'financing-entry' && (
              <motion.div
                key="financing-entry"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center">Entrada</h3>
                <Input
                  type="number"
                  placeholder="Ex: 50000"
                  value={leadData.downPayment || ''}
                  onChange={(e) => setLeadData(prev => ({ ...prev, downPayment: Number(e.target.value) }))}
                  className="py-3 bg-slate-900/50 border-slate-700 text-white text-center text-xl"
                />
                <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Veículo:</span>
                    <span className="text-white">{formatPrice(displayVehicle.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entrada:</span>
                    <span className="text-white">{formatPrice(leadData.downPayment || 0)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between">
                    <span className="text-white">Financiar:</span>
                    <span className="text-yellow-500">{formatPrice(financingValue)}</span>
                  </div>
                </div>
                <Button
                  onClick={() => setStep('financing-installments')}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="ghost" onClick={goBack} className="w-full text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              </motion.div>
            )}

            {step === 'financing-installments' && (
              <motion.div
                key="financing-installments"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center">Parcelas</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[12, 24, 36, 48, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => setLeadData(prev => ({ ...prev, installments: m }))}
                      className={`p-4 rounded-xl border ${
                        leadData.installments === m
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-slate-800 bg-slate-900/30 hover:border-yellow-500/50'
                      }`}
                    >
                      <span className="font-bold text-lg text-white">{m}x</span>
                    </button>
                  ))}
                </div>
                {leadData.installments && (
                  <div className="p-4 bg-slate-900/30 rounded-xl text-center">
                    <p className="text-sm text-slate-400">Parcela</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {formatPrice(financingValue / leadData.installments)}/mês
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => setStep('financing-cnh')}
                  disabled={!leadData.installments}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="ghost" onClick={goBack} className="w-full text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              </motion.div>
            )}

            {step === 'financing-cnh' && (
              <motion.div
                key="financing-cnh"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center">CNH</h3>
                <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-slate-800 hover:border-yellow-500/50 cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-400 mb-3" />
                  <span className="text-slate-300">Clique para enviar</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => setLeadData(prev => ({ ...prev, cnhImage: e.target.files?.[0] || null }))}
                  />
                </label>
                {leadData.cnhImage && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-white truncate">{leadData.cnhImage.name}</span>
                  </div>
                )}
                <Button
                  onClick={() => setStep('financing-lgpd')}
                  disabled={!leadData.cnhImage}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  Continuar <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="ghost" onClick={goBack} className="w-full text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              </motion.div>
            )}

            {step === 'financing-lgpd' && (
              <motion.div
                key="financing-lgpd"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center">Confirme</h3>
                <div className="p-4 bg-slate-900/30 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Veículo:</span>
                    <span className="text-white">{displayVehicle.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entrada:</span>
                    <span className="text-white">{formatPrice(leadData.downPayment || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parcelas:</span>
                    <span className="text-white">{leadData.installments}x</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 border border-slate-800 rounded-xl">
                  <Checkbox
                    id="lgpd"
                    checked={leadData.lgpdConsent}
                    onCheckedChange={(c) => setLeadData(prev => ({ ...prev, lgpdConsent: c as boolean }))}
                  />
                  <label htmlFor="lgpd" className="text-sm text-slate-300 cursor-pointer">
                    Autorizo LGPD
                  </label>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!leadData.lgpdConsent || isSubmitting}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  {isSubmitting ? 'Enviando...' : 'Finalizar'} <Check className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="ghost" onClick={goBack} disabled={isSubmitting} className="w-full text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              </motion.div>
            )}

            {step === 'trade-info' && (
              <motion.div
                key="trade-info"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center">Seu veículo</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Modelo"
                    value={leadData.tradeModel || ''}
                    onChange={(e) => setLeadData(prev => ({ ...prev, tradeModel: e.target.value }))}
                    className="py-3 bg-slate-900/50 border-slate-700 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Ano"
                    value={leadData.tradeYear || ''}
                    onChange={(e) => setLeadData(prev => ({ ...prev, tradeYear: e.target.value }))}
                    className="py-3 bg-slate-900/50 border-slate-700 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Valor (R$)"
                    value={leadData.tradeValue || ''}
                    onChange={(e) => setLeadData(prev => ({ ...prev, tradeValue: Number(e.target.value) }))}
                    className="py-3 bg-slate-900/50 border-slate-700 text-white"
                  />
                  <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-slate-800 hover:border-yellow-500/50 cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-300">Fotos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => setLeadData(prev => ({ ...prev, tradeImages: Array.from(e.target.files || []) }))}
                    />
                  </label>
                </div>
                {(leadData.tradeValue || 0) < displayVehicle.price && leadData.tradeValue && (
                  <div className="p-4 bg-slate-900/30 rounded-xl">
                    <p className="text-sm text-slate-400">Diferença:</p>
                    <p className="text-xl font-bold text-yellow-500">
                      {formatPrice(displayVehicle.price - (leadData.tradeValue || 0))}
                    </p>
                  </div>
                )}
                <Button
                  onClick={() => {
                    if ((leadData.tradeValue || 0) < displayVehicle.price) {
                      setStep('trade-difference');
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={!leadData.tradeModel || !leadData.tradeYear || !leadData.tradeValue || isSubmitting}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  {(leadData.tradeValue || 0) >= displayVehicle.price ? 'Finalizar' : 'Continuar'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="ghost" onClick={goBack} className="w-full text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              </motion.div>
            )}

            {step === 'trade-difference' && (
              <motion.div
                key="trade-difference"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center">Diferença</h3>
                <div className="p-4 bg-slate-900/30 rounded-xl text-center">
                  <p className="text-sm text-slate-400">Diferença a pagar</p>
                  <p className="text-2xl font-bold text-yellow-500">
                    {formatPrice(displayVehicle.price - (leadData.tradeValue || 0))}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setLeadData(prev => ({ ...prev, tradeDifference: 'cash' }));
                      handleSubmit();
                    }}
                    className="p-6 bg-slate-900/30 border border-slate-800 hover:border-yellow-500/50 rounded-xl flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl">💰</span>
                    <span className="text-white">À Vista</span>
                  </button>
                  <button
                    onClick={() => {
                      setLeadData(prev => ({ ...prev, tradeDifference: 'financing' }));
                      setStep('financing-entry');
                    }}
                    className="p-6 bg-slate-900/30 border border-slate-800 hover:border-yellow-500/50 rounded-xl flex flex-col items-center gap-2"
                  >
                    <span className="text-3xl">🏦</span>
                    <span className="text-white">Financiar</span>
                  </button>
                </div>
                <Button variant="ghost" onClick={goBack} className="w-full text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              </motion.div>
            )}

            {step === 'visit-schedule' && (
              <motion.div
                key="visit-schedule"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold text-white text-center">Agendar visita</h3>
                <div className="space-y-4">
                  <Input
                    type="date"
                    value={leadData.visitDate || ''}
                    onChange={(e) => setLeadData(prev => ({ ...prev, visitDate: e.target.value }))}
                    className="py-3 bg-slate-900/50 border-slate-700 text-white"
                  />
                  <Input
                    type="time"
                    value={leadData.visitTime || ''}
                    onChange={(e) => setLeadData(prev => ({ ...prev, visitTime: e.target.value }))}
                    className="py-3 bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
                <div className="p-4 bg-slate-900/30 rounded-xl">
                  <p className="text-sm text-slate-400 mb-2">Endereço:</p>
                  <p className="font-medium text-white">Av. Brasil, 1500 - Centro</p>
                  <p className="text-slate-400 text-sm">São Paulo - SP</p>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!leadData.visitDate || !leadData.visitTime || isSubmitting}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar'} <Check className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="ghost" onClick={goBack} disabled={isSubmitting} className="w-full text-slate-400">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
