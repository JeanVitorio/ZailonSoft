import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, SlidersHorizontal, X, Instagram } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { VehiclePostCard } from '@/components/ui/VehiclePostCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatters';
import { brands, years } from '@/data/vehicles';

const Index = () => {
  const { vehicles, store } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const priceRange = useMemo(() => {
    if (!vehicles.length) return { min: 0, max: 5000000 };
    const prices = vehicles.map(v => v.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          vehicle.name.toLowerCase().includes(query) ||
          vehicle.brand.toLowerCase().includes(query) ||
          vehicle.model.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (selectedBrand && vehicle.brand !== selectedBrand) return false;
      if (selectedYear && vehicle.year.toString() !== selectedYear) return false;
      if (minPrice && vehicle.price < minPrice) return false;
      if (maxPrice && vehicle.price > maxPrice) return false;
      return true;
    });
  }, [vehicles, searchQuery, selectedBrand, selectedYear, minPrice, maxPrice]);

  const hasActiveFilters = selectedBrand || selectedYear || minPrice > 0 || maxPrice > 0;

  const handleResetFilters = () => {
    setSelectedBrand('');
    setSelectedYear('');
    setMinPrice(0);
    setMaxPrice(0);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
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
              <img src="/favicon.ico" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shadow-glow-md" />
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
              <Link to="/">
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

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            {/* Search Input */}
            <div className="relative flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome, marca ou modelo..."
                  className="input-premium w-full h-12 md:h-14 pl-12 pr-10 text-sm md:text-base rounded-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 md:h-14 w-12 md:w-14 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  showFilters || hasActiveFilters
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Inline Filters */}
            <motion.div
              initial={false}
              animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="glass-card rounded-2xl p-4 md:p-5 space-y-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Marca</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedBrand('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        !selectedBrand ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Todas
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedBrand === brand ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Ano</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedYear('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        !selectedYear ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Todos
                    </button>
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year.toString())}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedYear === year.toString() ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Faixa de Preço</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground mb-1 block">Mínimo</span>
                      <input
                        type="number"
                        value={minPrice || ''}
                        onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
                        placeholder="R$ 0"
                        className="input-premium w-full h-10 text-sm"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground mb-1 block">Máximo</span>
                      <input
                        type="number"
                        value={maxPrice || ''}
                        onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
                        placeholder="Sem limite"
                        className="input-premium w-full h-10 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-muted-foreground hover:text-amber-400 transition-colors"
                  >
                    Limpar filtros
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-xs text-amber-400 font-medium hover:text-amber-300 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Active Filters Chips */}
            {hasActiveFilters && !showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-3 flex-wrap"
              >
                <span className="text-xs text-muted-foreground">Filtros:</span>
                {selectedBrand && (
                  <button onClick={() => setSelectedBrand('')} className="badge-premium flex items-center gap-1 hover:border-amber-500/50 transition-colors">
                    {selectedBrand} <X className="w-3 h-3" />
                  </button>
                )}
                {selectedYear && (
                  <button onClick={() => setSelectedYear('')} className="badge-premium flex items-center gap-1 hover:border-amber-500/50 transition-colors">
                    {selectedYear} <X className="w-3 h-3" />
                  </button>
                )}
                {(minPrice > 0 || maxPrice > 0) && (
                  <button onClick={() => { setMinPrice(0); setMaxPrice(0); }} className="badge-premium flex items-center gap-1 hover:border-amber-500/50 transition-colors">
                    {minPrice > 0 ? formatPrice(minPrice) : 'R$ 0'} - {maxPrice > 0 ? formatPrice(maxPrice) : '∞'} <X className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-amber-400 hover:text-amber-300 underline"
                >
                  Limpar
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Feed Grid */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {filteredVehicles.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <p className="text-xs md:text-sm text-muted-foreground">
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
            className="flex flex-col items-center justify-center py-16 md:py-20 text-center"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <img src="/favicon.ico" alt="Logo" className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
              Nenhum veículo encontrado
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md px-4">
              Tente ajustar seus filtros ou termos de busca
            </p>
            <Button variant="outline" onClick={handleResetFilters}>
              Limpar filtros
            </Button>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8 md:mt-12">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/favicon.ico" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl" />
              <span className="text-xs md:text-sm text-muted-foreground">
                {store.name} © {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-muted-foreground hover:text-amber-400 transition-colors">
                WhatsApp
              </a>
              <a href="https://instagram.com/zailonsoft" target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-muted-foreground hover:text-amber-400 transition-colors flex items-center gap-1">
                <Instagram className="w-3 h-3 md:w-4 md:h-4" />
                @zailonsoft
              </a>
              <Link to="/" className="text-xs md:text-sm text-muted-foreground hover:text-amber-400 transition-colors">
                Sobre
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
