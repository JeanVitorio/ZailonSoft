import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, SlidersHorizontal, X, Instagram, MessageCircle, Play, Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatters';
import { Vehicle } from '@/data/vehicles';

const mockVehicles: Vehicle[] = [
  {
    id: 'demo-1', name: 'BMW X5 M Sport', brand: 'BMW', model: 'X5', year: 2024, price: 489900,
    mileage: 0, fuel: 'Gasolina', transmission: 'Automático', color: 'Preto Safira',
    description: 'SUV premium com pacote M Sport completo, teto solar panorâmico e interior em couro Vernasca.',
    features: ['Teto Solar', 'Bancos em Couro', 'Apple CarPlay', 'Câmera 360°'],
    images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop'],
    stock: 1, status: 'available', createdAt: new Date().toISOString(), views: 342, likes: 89,
  },
  {
    id: 'demo-2', name: 'Mercedes-Benz C300 AMG Line', brand: 'Mercedes-Benz', model: 'C300', year: 2024, price: 379900,
    mileage: 5200, fuel: 'Gasolina', transmission: 'Automático', color: 'Branco Polar',
    description: 'Sedã executivo com pacote AMG Line, sistema MBUX e condução semi-autônoma.',
    features: ['MBUX', 'Faróis Digital Light', 'Suspensão a Ar', 'Assistente de Estacionamento'],
    images: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop'],
    stock: 1, status: 'available', createdAt: new Date().toISOString(), views: 287, likes: 75,
  },
  {
    id: 'demo-3', name: 'Porsche 911 Carrera S', brand: 'Porsche', model: '911', year: 2023, price: 899900,
    mileage: 3400, fuel: 'Gasolina', transmission: 'PDK', color: 'Cinza Quartzo',
    description: 'O ícone dos esportivos com motor boxer 3.0 biturbo de 450cv e sistema PASM.',
    features: ['Sport Chrono', 'Escape Esportivo', 'PASM', 'Bancos Esportivos Plus'],
    images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop'],
    stock: 1, status: 'available', createdAt: new Date().toISOString(), views: 521, likes: 198,
  },
  {
    id: 'demo-4', name: 'Audi RS e-tron GT', brand: 'Audi', model: 'e-tron GT', year: 2024, price: 1189900,
    mileage: 0, fuel: 'Elétrico', transmission: 'Automático', color: 'Verde Tático',
    description: 'Gran Turismo 100% elétrico com 646cv, 0-100 em 3.3s e autonomia de 472km.',
    features: ['Quattro', 'Matrix LED', 'Bang & Olufsen', 'Carregamento Rápido'],
    images: ['https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&h=600&fit=crop'],
    stock: 1, status: 'available', createdAt: new Date().toISOString(), views: 413, likes: 156,
  },
  {
    id: 'demo-5', name: 'Toyota Hilux SRX', brand: 'Toyota', model: 'Hilux', year: 2024, price: 289900,
    mileage: 12000, fuel: 'Diesel', transmission: 'Automático', color: 'Prata Metálico',
    description: 'Pickup líder de mercado com motor 2.8 turbodiesel, tração 4x4 e central multimídia de 8".',
    features: ['4x4', 'Controle de Tração', 'Câmera de Ré', 'Piloto Automático'],
    images: ['https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&h=600&fit=crop'],
    stock: 2, status: 'available', createdAt: new Date().toISOString(), views: 198, likes: 54,
  },
  {
    id: 'demo-6', name: 'Range Rover Sport HSE', brand: 'Land Rover', model: 'Range Rover Sport', year: 2023, price: 749900,
    mileage: 8500, fuel: 'Diesel', transmission: 'Automático', color: 'Azul Byron',
    description: 'SUV de luxo com motor 3.0 inline-6, suspensão pneumática e sistema Terrain Response 2.',
    features: ['Meridian Sound', 'Head-Up Display', 'Ar Condicionado 4 Zonas', 'Teto Panorâmico'],
    images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop'],
    stock: 1, status: 'reserved', createdAt: new Date().toISOString(), views: 356, likes: 112,
  },
];

const DemoCard: React.FC<{ vehicle: Vehicle; index: number }> = ({ vehicle, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1, ease: [0.2, 0, 0, 1] }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group"
  >
    <div className="post-card cursor-pointer" onClick={() => {}}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={vehicle.images[0]} alt={vehicle.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {vehicle.status !== 'available' && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Reservado</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/70 font-medium">{vehicle.brand} • {vehicle.year}</span>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{vehicle.views}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{vehicle.name}</h3>
          <div className="flex items-center justify-between">
            <span className="price-tag text-sm">{formatPrice(vehicle.price)}</span>
            <motion.div initial={{ x: -5, opacity: 0 }} whileHover={{ x: 0, opacity: 1 }} className="flex items-center text-cyan-400 text-sm font-medium">
              Ver detalhes <ChevronRight className="w-4 h-4 ml-1" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const DemoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const brands = useMemo(() => [...new Set(mockVehicles.map(v => v.brand))].sort(), []);

  const filteredVehicles = useMemo(() => {
    return mockVehicles.filter(v => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!v.name.toLowerCase().includes(q) && !v.brand.toLowerCase().includes(q)) return false;
      }
      if (selectedBrand && v.brand !== selectedBrand) return false;
      return true;
    });
  }, [searchQuery, selectedBrand]);

  return (
    <div className="min-h-screen bg-[#050505]">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] bg-cyan-500/10 rounded-full blur-[120px] opacity-50" />

        <div className="relative container mx-auto px-4 py-6 md:py-12">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 md:gap-3">
              <img src="/favicon.ico" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shadow-glow-md" />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">AutoConnect Demo</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground">Exemplo de Catálogo Premium</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="premium" size="sm" className="text-xs md:text-sm h-8 md:h-9">
                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4" /> Quero para minha loja
                </Button>
              </Link>
            </div>
          </div>

          {/* Demo banner */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center">
            <p className="text-sm text-cyan-400 font-medium">
              🎯 Este é um catálogo de demonstração. Tenha o seu por apenas <strong>R$ 99/mês</strong>!
            </p>
            <Link to="/" className="text-xs text-cyan-400/70 hover:text-cyan-300 underline mt-1 inline-block">
              Saiba mais →
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3 md:mb-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
              <span className="text-xs md:text-sm font-medium text-cyan-400">Veículos Exclusivos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Encontre seu próximo
              <span className="text-gradient block mt-1">veículo dos sonhos</span>
            </h2>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto">
            <div className="relative flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por nome ou marca..."
                  className="input-premium w-full h-12 md:h-14 pl-12 pr-10 text-sm md:text-base rounded-xl" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`h-12 md:h-14 w-12 md:w-14 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  showFilters ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 border border-white/10 text-muted-foreground'
                }`}>
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
            {showFilters && (
              <div className="glass-card rounded-2xl p-4 space-y-3 mb-4">
                <label className="block text-xs font-medium text-muted-foreground mb-2">Marca</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedBrand('')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedBrand ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white border border-white/10'}`}>
                    Todas
                  </button>
                  {brands.map(b => (
                    <button key={b} onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedBrand === b ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white border border-white/10'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <p className="text-xs md:text-sm text-muted-foreground">{filteredVehicles.length} veículos encontrados</p>
        </div>
        <div className="feed-grid">
          {filteredVehicles.map((vehicle, index) => (
            <DemoCard key={vehicle.id} vehicle={vehicle} index={index} />
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 mt-8 md:mt-12">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="Logo" className="w-8 h-8 rounded-xl" />
              <span className="text-xs md:text-sm text-muted-foreground">AutoConnect Demo © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <a href="https://instagram.com/nilosistema" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-muted-foreground hover:text-cyan-400 transition-colors flex items-center gap-1">
                <Instagram className="w-3 h-3 md:w-4 md:h-4" /> @nilosistema
              </a>
              <a href="https://wa.me/5546991163405" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-muted-foreground hover:text-cyan-400 transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage;
