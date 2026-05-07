import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Calendar, Fuel, Gauge, Palette, Settings2, Play, MessageCircle, Send } from 'lucide-react';
import { formatPrice, formatMileage } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/ui/LeadForm';
import { Vehicle } from '@/data/vehicles';
import { fetchCarDetails, fetchLojaBySlug } from '@/services/api';

const PublicVehicleDetail = () => {
  const { lojaSlug, id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [storeWhatsapp, setStoreWhatsapp] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [car, loja] = await Promise.all([
          fetchCarDetails(id!),
          lojaSlug ? fetchLojaBySlug(lojaSlug) : Promise.resolve(null),
        ]);
        setVehicle({
          id: car.id, name: car.nome || '', brand: car.marca || '', model: car.modelo || '',
          year: car.ano || new Date().getFullYear(), price: Number(car.preco) || 0,
          mileage: car.quilometragem || 0, fuel: car.combustivel || '', transmission: car.cambio || '',
          color: car.cor || '', description: car.descricao || '', features: [], images: car.imagens || [],
          stock: car.estoque || 1, status: (car.status as any) || 'available',
          createdAt: car.created_at, views: 0, likes: 0,
        });
        if (loja) {
          setStoreWhatsapp(loja.whatsapp || '5546991163405');
          setStoreName(loja.nome || '');
        }
      } catch {
        setVehicle(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, lojaSlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <Settings2 className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Veículo não encontrado</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-6">O veículo que você procura não está disponível</p>
          <Button onClick={() => navigate(-1)}>Voltar ao catálogo</Button>
        </motion.div>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no ${vehicle.name} (${vehicle.year}) - ${formatPrice(vehicle.price)}`);
  const whatsappUrl = `https://wa.me/${storeWhatsapp || '5546991163405'}?text=${whatsappMessage}`;

  const specs = [
    { icon: Calendar, label: 'Ano', value: vehicle.year },
    { icon: Gauge, label: 'KM', value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: 'Combustível', value: vehicle.fuel },
    { icon: Settings2, label: 'Câmbio', value: vehicle.transmission },
    { icon: Palette, label: 'Cor', value: vehicle.color },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Voltar</span>
            </button>
            <h1 className="text-sm font-medium text-white truncate max-w-[200px] sm:hidden">{vehicle.name}</h1>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/10 transition-all">
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 md:space-y-4">
            <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden glass-card">
              {showVideo && vehicle.videoUrl ? (
                <video src={vehicle.videoUrl} autoPlay controls playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={vehicle.images[activeImage] || '/placeholder.svg'} alt={vehicle.name} className="w-full h-full object-cover" />
              )}
              {vehicle.videoUrl && (
                <button onClick={() => setShowVideo(!showVideo)}
                  className={`absolute top-3 right-3 md:top-4 md:right-4 px-3 py-1.5 md:px-4 md:py-2 rounded-xl flex items-center gap-1.5 md:gap-2 transition-all ${showVideo ? 'bg-cyan-500 text-slate-950' : 'bg-black/50 backdrop-blur-sm text-white hover:bg-cyan-500/20'}`}>
                  <Play className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-xs md:text-sm font-medium">{showVideo ? 'Fotos' : 'Vídeo'}</span>
                </button>
              )}
              <span className={`absolute top-3 left-3 md:top-4 md:left-4 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-medium ${
                vehicle.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : vehicle.status === 'reserved' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {vehicle.status === 'available' ? 'Disponível' : vehicle.status === 'reserved' ? 'Reservado' : 'Vendido'}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {vehicle.images.map((image, index) => (
                <button key={index} onClick={() => { setActiveImage(index); setShowVideo(false); }}
                  className={`relative w-16 h-12 md:w-20 md:h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                    activeImage === index && !showVideo ? 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-[#050505]' : 'opacity-60 hover:opacity-100'
                  }`}>
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 md:space-y-6">
            <div>
              <p className="text-xs md:text-sm text-cyan-400 font-medium mb-2">{vehicle.brand}</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">{vehicle.name}</h1>
              <div className="price-tag text-lg md:text-2xl">{formatPrice(vehicle.price)}</div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 md:grid md:grid-cols-3 md:gap-3 md:mx-0 md:px-0 md:overflow-visible">
              {specs.map((spec, index) => (
                <div key={index} className="glass-card p-3 md:p-4 rounded-xl flex-shrink-0 w-[130px] md:w-auto">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <spec.icon className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-xs text-muted-foreground">{spec.label}</p>
                      <p className="text-xs md:text-sm font-medium text-white truncate">{spec.value || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-4 md:p-6 rounded-2xl">
              <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Descrição</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{vehicle.description || 'Sem descrição disponível.'}</p>
            </div>

            <div className="hidden md:flex gap-3 pt-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="premium" size="xl" className="w-full">
                  <MessageCircle className="w-5 h-5" /> Tenho interesse
                </Button>
              </a>
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setShowLeadForm(true)}>
                <Send className="w-4 h-4" /> Enviar proposta
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#050505]/90 backdrop-blur-xl border-t border-white/5 z-30 md:hidden">
        <div className="flex gap-3 max-w-lg mx-auto">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="premium" className="w-full h-12"><MessageCircle className="w-4 h-4" /> WhatsApp</Button>
          </a>
          <Button variant="outline" className="flex-1 h-12" onClick={() => setShowLeadForm(true)}>
            <Send className="w-4 h-4" /> Proposta
          </Button>
        </div>
      </div>

      <LeadForm isOpen={showLeadForm} onClose={() => setShowLeadForm(false)} vehicle={vehicle} />
    </div>
  );
};

export default PublicVehicleDetail;
