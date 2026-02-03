import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Car, Sparkles } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { VehiclePostCard } from '@/components/ui/VehiclePostCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { Filters } from '@/components/ui/Filters';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { vehicles, store } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    brand: '',
    fuel: '',
    year: '',
    minPrice: 0,
    maxPrice: 0
  });

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          vehicle.name.toLowerCase().includes(query) ||
          vehicle.brand.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Brand filter
      if (filters.brand && vehicle.brand !== filters.brand) return false;

      // Year filter
      if (filters.year && vehicle.year.toString() !== filters.year) return false;

      // Fuel filter
      if (filters.fuel && vehicle.fuel !== filters.fuel) return false;

      // Price filter
      if (filters.minPrice && vehicle.price < filters.minPrice) return false;
      if (filters.maxPrice && vehicle.price > filters.maxPrice) return false;

      return true;
    });
  }, [vehicles, searchQuery, filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      brand: '',
      fuel: '',
      year: '',
      minPrice: 0,
      maxPrice: 0
    });
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[300px] md:h-[400px] bg-amber-500/10 rounded-full blur-[120px] opacity-50" />
        
        <div className="relative container mx-auto px-4 py-6 md:py-12">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 md:gap-3"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-glow-md">
                <Car className="w-5 h-5 md:w-6 md:h-6 text-slate-950" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">{store.name}</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground">Catálogo Premium</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 md:gap-3"
            >
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs md:text-sm h-8 md:h-9">
                  Entrar
                </Button>
              </Link>
              <Link to="/home" className="hidden sm:block">
                <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 md:h-9">
                  Saiba mais
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3 md:mb-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-400" />
              <span className="text-xs md:text-sm font-medium text-amber-400">Veículos Exclusivos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Encontre seu próximo
              <span className="text-gradient block mt-1">veículo dos sonhos</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto px-4">
              Navegue pelo nosso catálogo premium de veículos selecionados com curadoria especial
            </p>
          </motion.div>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar por marca, modelo..."
              onFilterClick={() => setFiltersOpen(true)}
            />
          </div>

          {/* Active Filters */}
          {(filters.brand || filters.year || filters.fuel) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mt-4 flex-wrap"
            >
              <span className="text-sm text-muted-foreground">Filtros:</span>
              {filters.brand && (
                <span className="badge-premium">{filters.brand}</span>
              )}
              {filters.year && (
                <span className="badge-premium">{filters.year}</span>
              )}
              {filters.fuel && (
                <span className="badge-premium">{filters.fuel}</span>
              )}
              <button 
                onClick={handleResetFilters}
                className="text-sm text-amber-400 hover:text-amber-300 underline"
              >
                Limpar
              </button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Feed Grid */}
      <main className="container mx-auto px-4 py-8">
        {filteredVehicles.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredVehicles.length} veículo{filteredVehicles.length !== 1 ? 's' : ''} encontrado{filteredVehicles.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="feed-grid">
              {filteredVehicles.map((vehicle, index) => (
                <VehiclePostCard key={vehicle.id} vehicle={vehicle} index={index} />
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Car className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum veículo encontrado
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Tente ajustar seus filtros ou termos de busca para encontrar o veículo ideal
            </p>
            <Button variant="outline" onClick={handleResetFilters}>
              Limpar filtros
            </Button>
          </motion.div>
        )}
      </main>

      {/* Filters Panel */}
      <Filters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Car className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-sm text-muted-foreground">
                {store.name} © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-amber-400 transition-colors">
                WhatsApp
              </a>
              <Link to="/home" className="text-sm text-muted-foreground hover:text-amber-400 transition-colors">
                Sobre
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-amber-400 transition-colors">
                Área do Lojista
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
