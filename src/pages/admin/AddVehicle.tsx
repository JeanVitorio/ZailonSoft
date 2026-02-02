import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, FileText, Image, Check, ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const AddVehicle = () => {
  const navigate = useNavigate();
  const { addVehicle, store } = useData();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    fuel: 'Gasolina',
    transmission: 'Automático',
    color: '',
    description: '',
    features: [] as string[],
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=90'],
    stock: 1,
    status: 'available' as const,
  });
  const [newFeature, setNewFeature] = useState('');

  const steps = [
    { icon: Car, label: 'Informações', description: 'Dados do veículo' },
    { icon: FileText, label: 'Descrição', description: 'Detalhes e opcionais' },
    { icon: Image, label: 'Mídia', description: 'Fotos e vídeos' },
    { icon: Check, label: 'Revisão', description: 'Confirmar dados' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      handleInputChange('features', [...formData.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    handleInputChange('features', formData.features.filter(f => f !== feature));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.brand || !formData.price) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    addVehicle(formData);
    toast({
      title: 'Veículo cadastrado!',
      description: `${formData.name} foi adicionado ao catálogo`
    });
    navigate('/sistema/catalogo');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.brand && formData.year && formData.price > 0;
      case 1:
        return formData.description.length > 0;
      case 2:
        return formData.images.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-white mb-2"
        >
          Adicionar Veículo
        </motion.h1>
        <p className="text-muted-foreground">Cadastre um novo veículo no catálogo</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                index < currentStep ? 'bg-emerald-500 text-white' :
                index === currentStep ? 'bg-amber-500 text-slate-950' :
                'bg-white/5 text-muted-foreground'
              }`}>
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <p className={`text-xs mt-2 hidden sm:block ${
                index <= currentStep ? 'text-white' : 'text-muted-foreground'
              }`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                index < currentStep ? 'bg-emerald-500' : 'bg-white/10'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card p-6 md:p-8 rounded-2xl"
      >
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Informações do Veículo</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Marca *</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Ex: Porsche"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Modelo *</label>
                <Input
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Ex: 911 Turbo S"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Nome Completo *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Porsche 911 Turbo S"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Ano *</label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Preço (R$) *</label>
                <Input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Km Rodados</label>
                <Input
                  type="number"
                  value={formData.mileage || ''}
                  onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Combustível</label>
                <select
                  value={formData.fuel}
                  onChange={(e) => handleInputChange('fuel', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Gasolina">Gasolina</option>
                  <option value="Etanol">Etanol</option>
                  <option value="Flex">Flex</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Elétrico">Elétrico</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Câmbio</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => handleInputChange('transmission', e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Automático">Automático</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                  <option value="PDK">PDK</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Cor</label>
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Ex: Preto"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Descrição e Opcionais</h2>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Descrição *
                <span className="text-xs ml-2">({formData.description.length}/1000)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value.slice(0, 1000))}
                placeholder="Descreva o veículo em detalhes..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Opcionais</label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Ex: Teto Solar"
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button onClick={addFeature} variant="secondary">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm"
                  >
                    {feature}
                    <button onClick={() => removeFeature(feature)} className="hover:text-amber-200">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Fotos e Vídeos</h2>
            
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-amber-500/30 transition-colors">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Arraste imagens aqui ou clique para enviar</p>
              <p className="text-sm text-muted-foreground">PNG, JPG ou WEBP até 5MB (máx. 10 imagens)</p>
              <p className="text-xs text-amber-400 mt-4">Demo: Usando imagem padrão de demonstração</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs">Principal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Revisar e Publicar</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-video rounded-xl overflow-hidden">
                <img src={formData.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-amber-400 font-medium">{formData.brand} • {formData.year}</p>
                  <h3 className="text-2xl font-bold text-white">{formData.name || 'Nome do veículo'}</h3>
                </div>
                
                <div className="price-tag text-xl">
                  R$ {formData.price.toLocaleString('pt-BR')}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-muted-foreground">Quilometragem</p>
                    <p className="text-sm font-medium text-white">{formData.mileage.toLocaleString()} km</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-muted-foreground">Câmbio</p>
                    <p className="text-sm font-medium text-white">{formData.transmission}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-muted-foreground">Combustível</p>
                    <p className="text-sm font-medium text-white">{formData.fuel}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-xs text-muted-foreground">Cor</p>
                    <p className="text-sm font-medium text-white">{formData.color || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {formData.features.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Opcionais</p>
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span key={index} className="badge-premium">{feature}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate('/sistema/catalogo')}
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep > 0 ? 'Voltar' : 'Cancelar'}
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
          >
            Próximo
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="premium" onClick={handleSubmit}>
            <Check className="w-4 h-4" />
            Publicar Veículo
          </Button>
        )}
      </div>
    </div>
  );
};

export default AddVehicle;
