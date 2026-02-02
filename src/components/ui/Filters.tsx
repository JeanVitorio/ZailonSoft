import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { Button } from './button';
import { brands, fuelTypes, years } from '@/data/vehicles';

interface FiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    brand: string;
    fuel: string;
    year: string;
    minPrice: number;
    maxPrice: number;
  };
  onFilterChange: (key: string, value: string | number) => void;
  onReset: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Filter className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Filtros</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Options */}
              <div className="space-y-6">
                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Marca
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onFilterChange('brand', '')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        filters.brand === ''
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Todas
                    </button>
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => onFilterChange('brand', brand)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          filters.brand === brand
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Ano
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onFilterChange('year', '')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        filters.year === ''
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Todos
                    </button>
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => onFilterChange('year', year.toString())}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          filters.year === year.toString()
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Combustível
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onFilterChange('fuel', '')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        filters.fuel === ''
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Todos
                    </button>
                    {fuelTypes.map((fuel) => (
                      <button
                        key={fuel}
                        onClick={() => onFilterChange('fuel', fuel)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          filters.fuel === fuel
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {fuel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3">
                    Faixa de Preço
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">Mínimo</span>
                      <input
                        type="number"
                        value={filters.minPrice || ''}
                        onChange={(e) => onFilterChange('minPrice', parseInt(e.target.value) || 0)}
                        placeholder="R$ 0"
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">Máximo</span>
                      <input
                        type="number"
                        value={filters.maxPrice || ''}
                        onChange={(e) => onFilterChange('maxPrice', parseInt(e.target.value) || 0)}
                        placeholder="Sem limite"
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={onReset}
                  className="flex-1"
                >
                  Limpar
                </Button>
                <Button
                  variant="default"
                  onClick={onClose}
                  className="flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
