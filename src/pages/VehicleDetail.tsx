import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Eye, Calendar, Fuel, Gauge, Palette, Settings2, Play, MessageCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatPrice, formatMileage } from '@/lib/formatters';
import { Button } from '@/components/ui/button';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, store } = useData();
  const [activeImage, setActiveImage] = React.useState(0);
  const [showVideo, setShowVideo] = React.useState(false);

  const vehicle = vehicles.find(v => v.id === id);

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Settings2 className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Veículo não encontrado</h2>
          <p className="text-muted-foreground mb-6">O veículo que você procura não está disponível</p>
          <Button onClick={() => navigate('/')}>
            Voltar ao catálogo
          </Button>
        </motion.div>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no ${vehicle.name} (${vehicle.year}) - ${formatPrice(vehicle.price)}`);
  const whatsappUrl = `https://wa.me/${store.whatsapp}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all">
                <Heart className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Gallery Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image/Video */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-card">
              {showVideo && vehicle.videoUrl ? (
                <video
                  src={vehicle.videoUrl}
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={vehicle.images[activeImage]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Video Toggle */}
              {vehicle.videoUrl && (
                <button
                  onClick={() => setShowVideo(!showVideo)}
                  className={`absolute top-4 right-4 px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                    showVideo 
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-black/50 backdrop-blur-sm text-white hover:bg-amber-500/20'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span className="text-sm font-medium">{showVideo ? 'Ver fotos' : 'Ver vídeo'}</span>
                </button>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {vehicle.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveImage(index);
                    setShowVideo(false);
                  }}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                    activeImage === index && !showVideo
                      ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#050505]'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Badge & Stats */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                vehicle.status === 'available'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : vehicle.status === 'reserved'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {vehicle.status === 'available' ? 'Disponível' : vehicle.status === 'reserved' ? 'Reservado' : 'Vendido'}
              </span>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {vehicle.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {vehicle.likes}
                </span>
              </div>
            </div>

            {/* Title & Price */}
            <div>
              <p className="text-sm text-amber-400 font-medium mb-1">{vehicle.brand}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{vehicle.name}</h1>
              <div className="price-tag text-2xl">
                {formatPrice(vehicle.price)}
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Calendar, label: 'Ano', value: vehicle.year },
                { icon: Gauge, label: 'Quilometragem', value: formatMileage(vehicle.mileage) },
                { icon: Fuel, label: 'Combustível', value: vehicle.fuel },
                { icon: Settings2, label: 'Câmbio', value: vehicle.transmission },
                { icon: Palette, label: 'Cor', value: vehicle.color },
              ].map((spec, index) => (
                <div key={index} className="glass-card p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <spec.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{spec.label}</p>
                      <p className="text-sm font-medium text-white">{spec.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-white mb-3">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Opcionais</h3>
              <div className="flex flex-wrap gap-2">
                {vehicle.features.map((feature, index) => (
                  <span key={index} className="badge-premium">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-4">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="premium" size="xl" className="w-full">
                  <MessageCircle className="w-5 h-5" />
                  Tenho interesse
                </Button>
              </a>
              <Link to={`/form-proposta/${vehicle.id}`}>
                <Button variant="outline" size="lg" className="w-full">
                  Enviar proposta detalhada
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default VehicleDetail;
