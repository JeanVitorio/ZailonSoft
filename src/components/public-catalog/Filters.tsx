import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface FiltersProps {
  filters: {
    yearMin: number;
    yearMax: number;
    priceMin: number;
    priceMax: number;
    brand: string;
    model?: string;
    type: string;
  };
  onFiltersChange: (filters: FiltersProps['filters']) => void;
}

export function Filters({ filters, onFiltersChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const resetFilters = () => {
    onFiltersChange({
      yearMin: 2015,
      yearMax: new Date().getFullYear() + 1,
      priceMin: 0,
      priceMax: 2000000,
      brand: '',
      type: '',
    });
  };

  const activeFiltersCount = [
    filters.brand,
    filters.type,
    filters.yearMin !== 2015 || filters.yearMax !== new Date().getFullYear() + 1,
    filters.priceMin !== 0 || filters.priceMax !== 2000000,
  ].filter(Boolean).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-slate-700 bg-slate-900/70 hover:bg-slate-900 text-slate-200"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="ml-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-bold">{activeFiltersCount}</span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-[calc(100vw-2rem)] md:w-96 p-5 bg-slate-900/95 rounded-xl z-50 shadow-xl border border-slate-800"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg text-slate-50">Filtros</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-400 hover:text-slate-200 text-xs">Limpar</Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="md:hidden"><X className="w-5 h-5" /></Button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Marca</label>
                  <input
                    type="text"
                    value={filters.brand}
                    onChange={(e) => onFiltersChange({ ...filters, brand: e.target.value })}
                    placeholder="Ex: Fiat, Toyota"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Modelo</label>
                  <input
                    type="text"
                    value={filters.model || ''}
                    onChange={(e) => onFiltersChange({ ...filters, model: e.target.value })}
                    placeholder="Ex: Corolla, Gol"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-3 block">Ano: {filters.yearMin} - {filters.yearMax}</label>
                  <Slider
                    min={2010}
                    max={new Date().getFullYear() + 1}
                    step={1}
                    value={[filters.yearMin, filters.yearMax]}
                    onValueChange={([min, max]) => onFiltersChange({ ...filters, yearMin: min, yearMax: max })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-3 block">Preço: {formatPrice(filters.priceMin)} - {formatPrice(filters.priceMax)}</label>
                  <Slider
                    min={0}
                    max={2000000}
                    step={50000}
                    value={[filters.priceMin, filters.priceMax]}
                    onValueChange={([min, max]) => onFiltersChange({ ...filters, priceMin: min, priceMax: max })}
                    className="mt-2"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
