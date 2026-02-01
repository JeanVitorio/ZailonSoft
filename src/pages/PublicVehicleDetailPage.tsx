import { useState } from 'react';
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
  const [isFormOpen, setIsFormOpen] = useState(false);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-primary animate-pulse">Carregando veículo...</p>
      </div>
    );
  }

  if (!vehicle || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Veículo não encontrado</h1>
          <Link to="/" className="text-primary hover:underline">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: any) => {
    const cleaned = String(price || '0')
      .replace(/R\$\s?/gi, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const num = parseFloat(cleaned) || 0;

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatMileage = (km: any) =>
    new Intl.NumberFormat('pt-BR').format(parseInt(String(km || 0), 10)) + ' km';

  const typeLabels: Record<string, string> = {
    sedan: 'Sedan',
    hatch: 'Hatch',
    suv: 'SUV',
    pickup: 'Pickup',
    coupe: 'Coupé',
    convertible: 'Conversível',
  };

  const mappedVehicle = {
    images: vehicle.imagens || [],
    videos: vehicle.videos || [],
    name: vehicle.nome,
    brand: vehicle.marca,
    year: vehicle.ano,
    mileage: vehicle.quilometragem,
    type: vehicle.tipo || 'sedan',
    price: vehicle.preco,
    description: vehicle.descricao,
    features: vehicle.features || [],
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao catálogo</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <ImageGallery images={mappedVehicle.images} name={mappedVehicle.name} />

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                    {mappedVehicle.brand}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-display font-bold">
                    {mappedVehicle.name}
                  </h1>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{mappedVehicle.year}</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                  <Gauge className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {formatMileage(mappedVehicle.mileage)}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                  <Car className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {typeLabels[mappedVehicle.type] || mappedVehicle.type}
                  </span>
                </div>
              </div>

              <p className="text-3xl md:text-4xl font-display font-bold gradient-text">
                {formatPrice(mappedVehicle.price)}
              </p>

              <div className="p-4 rounded-xl glass-card">
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {mappedVehicle.description}
                </p>
              </div>

              {mappedVehicle.features.length > 0 && (
                <div className="p-4 rounded-xl glass-card">
                  <h3 className="font-semibold mb-3">Destaques</h3>
                  <div className="flex flex-wrap gap-2">
                    {mappedVehicle.features.map((feature: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <VideoReels videos={mappedVehicle.videos} />

            <div className="hidden md:block mt-6">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="w-full py-6 btn-primary text-lg font-semibold animate-pulse-glow"
              >
                Tenho interesse
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-4 glass-card border-t border-border md:hidden z-40"
      >
        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full py-6 btn-primary text-lg font-semibold"
        >
          Tenho interesse
        </Button>
      </motion.div>

      <LeadForm
        vehicle={mappedVehicle}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default PublicVehicleDetailPage;
