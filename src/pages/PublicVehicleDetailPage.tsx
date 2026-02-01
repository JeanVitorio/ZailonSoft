import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Gauge, Car, Tag, Heart, Share2 } from 'lucide-react';
import { Header } from '@/components/public-catalog/Header';
import { ImageGallery } from '@/components/public-catalog/ImageGallery';
import { VideoReels } from '@/components/public-catalog/VideoReels';
import { LeadForm } from '@/components/public-catalog/LeadForm';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { fetchCarDetails } from '@/services/api';

const PublicVehicleDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      if (!id) throw new Error('ID ausente');
      return await fetchCarDetails(id);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-amber-400">Carregando veículo...</p>
      </div>
    );
  }

  if (!vehicle || error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-slate-50">Veículo não encontrado</h1>
          <Link to="/catalogo/1" className="text-amber-400 hover:text-amber-300">Voltar ao catálogo</Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: any) => {
    // Accept numbers or localized strings like "R$ 12.000,00"
    const parsePrice = (p: any) => {
      if (typeof p === 'number') return p;
      if (typeof p === 'string') {
        const cleaned = p.replace(/R\$\s?/gi, '').replace(/\./g, '').replace(/,/, '.');
        const v = parseFloat(cleaned);
        return Number.isFinite(v) ? v : 0;
      }
      return 0;
    };

    const num = parsePrice(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatMileage = (km: any) => {
    const num = typeof km === 'number' ? km : parseInt(String(km || 0), 10);
    return new Intl.NumberFormat('pt-BR').format(num) + ' km';
  };

  const images = (vehicle.imagens || []).filter((img: any) => !!img);
  const videos = ((vehicle as any).videos || []).filter((vid: any) => !!vid);
  const nome = vehicle.nome || 'Veículo';
  const marca = (vehicle as any).marca || '';
  const ano = vehicle.ano || '';
  const preco = vehicle.preco || 0;
  const quilometragem = (vehicle as any).quilometragem || 0;
  const descricao = vehicle.descricao || '';
  const features = (vehicle as any).features || [];

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-8">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link to="/catalogo/1" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {images.length > 0 && <ImageGallery images={images} alt={nome} />}

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">{marca}</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-50">{nome}</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400"><Heart className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-slate-400"><Share2 className="w-5 h-5" /></Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"><Calendar className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium text-slate-300">{ano}</span></div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"><Gauge className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium text-slate-300">{formatMileage(quilometragem)}</span></div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800"><Car className="w-4 h-4 text-amber-400" /><span className="text-sm font-medium text-slate-300">Veículo</span></div>
              </div>

              <p className="text-3xl md:text-4xl font-display font-bold gradient-text">{formatPrice(preco as any)}</p>

              {descricao && (
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <h3 className="font-semibold text-slate-50 mb-2">Descrição</h3>
                  <p className="text-slate-400 leading-relaxed">{descricao}</p>
                </div>
              )}

              {features.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <h3 className="font-semibold text-slate-50 mb-3">Destaques</h3>
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-sm border border-amber-500/20">
                        <Tag className="w-3 h-3" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            {videos.length > 0 && <VideoReels videos={videos} />}

            <div className="hidden md:block mt-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-50 mb-4">Tenho Interesse</h3>
                <LeadForm vehicleId={id} vehicleName={nome} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 border-t border-slate-800 md:hidden z-40 backdrop-blur">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-lg font-bold text-slate-50 mb-4">Tenho Interesse</h3>
            <LeadForm vehicleId={id} vehicleName={nome} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicVehicleDetailPage;
