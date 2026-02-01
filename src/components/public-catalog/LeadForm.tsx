import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface LeadFormProps {
  vehicleId?: string;
  vehicleName?: string;
  onSubmitSuccess?: () => void;
}

export function LeadForm({ vehicleId, vehicleName, onSubmitSuccess }: LeadFormProps) {
  const [step, setStep] = useState<'personal' | 'interest' | 'confirm' | 'success'>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
  });

  const handlePersonalSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Preenchenda todos os campos pessoais');
      return;
    }
    setError(null);
    setStep('interest');
  };

  const handleInterestSubmit = () => {
    if (!formData.interest) {
      setError('Selecione uma opção');
      return;
    }
    setError(null);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get existing leads from localStorage
      const existingLeads = JSON.parse(localStorage.getItem('zailon_leads') || '[]');

      // Create new lead object
      const newLead = {
        id: `lead_${Date.now()}`,
        vehicleId: vehicleId || 'unknown',
        vehicleName: vehicleName || 'Desconhecido',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        interest: formData.interest,
        message: formData.message,
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      existingLeads.push(newLead);
      localStorage.setItem('zailon_leads', JSON.stringify(existingLeads));

      setStep('success');
      onSubmitSuccess?.();

      // Reset form after 3 seconds
      setTimeout(() => {
        setStep('personal');
        setFormData({
          name: '',
          email: '',
          phone: '',
          interest: '',
          message: '',
        });
      }, 3000);
    } catch (err) {
      setError('Erro ao salvar lead. Tente novamente.');
      console.error('Lead form error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['Pessoal', 'Interesse', 'Confirmar', 'Sucesso'];
  const currentStepIndex = steps.indexOf(step.charAt(0).toUpperCase() + step.slice(1));

  return (
    <div className="w-full max-w-md glass-card p-4 rounded-xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex gap-2 mb-4">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i <= currentStepIndex
                  ? 'bg-amber-500'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-slate-400">
          Passo {currentStepIndex + 1} de {steps.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Personal Info Step */}
        {step === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-slate-300">Nome</label>
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Telefone</label>
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-amber-500"
              />
            </div>

            {error && (
              <div className="flex gap-2 p-3 bg-red-950/50 border border-red-900 rounded-lg text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button
              onClick={handlePersonalSubmit}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Interest Step */}
        {step === 'interest' && (
          <motion.div
            key="interest"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-slate-300 mb-3 block">Como você se interessa por este veículo?</label>
              <div className="space-y-2">
                {['Compra', 'Financiamento', 'Permuta', 'Mais informações'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFormData({ ...formData, interest: option });
                      setError(null);
                    }}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      formData.interest === option
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Mensagem (opcional)</label>
              <Textarea
                placeholder="Deixe uma mensagem adicional..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-1 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-amber-500 resize-none"
                rows={3}
              />
            </div>

            {error && (
              <div className="flex gap-2 p-3 bg-red-950/50 border border-red-900 rounded-lg text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('personal');
                  setError(null);
                }}
                className="flex-1 border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-slate-300"
              >
                Voltar
              </Button>
              <Button
                onClick={handleInterestSubmit}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-400">Nome</p>
                <p className="text-slate-200 font-medium">{formData.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-slate-200 font-medium">{formData.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Telefone</p>
                <p className="text-slate-200 font-medium">{formData.phone}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Interesse</p>
                <p className="text-slate-200 font-medium">{formData.interest}</p>
              </div>
              {formData.message && (
                <div>
                  <p className="text-xs text-slate-400">Mensagem</p>
                  <p className="text-slate-200 font-medium text-sm">{formData.message}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('interest');
                  setError(null);
                }}
                className="flex-1 border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-slate-300"
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium disabled:opacity-50"
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-50">Lead enviado!</h3>
              <p className="text-sm text-slate-400 mt-2">
                Entraremos em contato em breve com mais informações sobre este veículo.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
