import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/public-catalog/Header';
import { SearchBar } from '@/components/public-catalog/SearchBar';
import { Filters } from '@/components/public-catalog/Filters';
import VehicleCard from '@/components/ui/VehicleCard';
import { useQuery } from '@tanstack/react-query';
import { fetchAvailableCars } from '@/services/api';
import * as Feather from 'react-feather';

const PublicCatalogPage = () => {
  const { lojaId } = useParams<{ lojaId: string }>();
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles', lojaId],
    queryFn: () => fetchAvailableCars(lojaId || ''),
  });

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    yearMin: 2015,
    yearMax: new Date().getFullYear() + 1,
    priceMin: 0,
    priceMax: 2000000,
    brand: '',
    type: '',
  });

  const parsePrice = (p: any) => {
    if (typeof p === 'number') return p;
    if (typeof p === 'string') {
      const cleaned = p.replace(/R\$\s?/gi, '').replace(/\./g, '').replace(/,/, '.');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle: any) => {
      if (lojaId && vehicle.loja_id && vehicle.loja_id !== lojaId) return false;

      const searchLower = search.toLowerCase();
      const nome = (vehicle.nome || '').toLowerCase();
      const marca = ((vehicle as any).marca || '').toLowerCase();
      const ano = String(vehicle.ano || '');

      const matchesSearch =
        nome.includes(searchLower) ||
        marca.includes(searchLower) ||
        ano.includes(search);

      const preco = parsePrice(vehicle.preco || 0);
      const yearNum = parseInt(ano, 10) || 0;

      const matchesYear = yearNum >= filters.yearMin && yearNum <= filters.yearMax;
      const matchesPrice = preco >= filters.priceMin && preco <= filters.priceMax;

      return matchesSearch && matchesYear && matchesPrice;
    });
  }, [vehicles, search, filters, lojaId]);

  return (
    <div className="min-h-screen bg-black text-slate-50">
      <Header />

      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-400/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-50">
              Catálogo de <span className="text-amber-400">Veículos</span>
            </h1>
            <p className="text-lg text-slate-400">
              Navegue pelo nosso estoque exclusivo e encontre seu próximo veículo
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <SearchBar value={search} onChange={setSearch} />
          </motion.div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10 gap-4 flex-col sm:flex-row">
            <div>
              <h2 className="text-3xl font-bold text-slate-50">Estoque</h2>
              <p className="text-slate-400 text-sm mt-1">{filteredVehicles.length} veículos encontrados</p>
            </div>
            <Filters filters={filters} onFiltersChange={setFilters} />
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <Feather.Loader className="w-10 h-10 mx-auto animate-spin text-amber-400" />
              <p className="text-slate-400 mt-4">Carregando veículos...</p>
            </div>
          ) : filteredVehicles.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredVehicles.map((vehicle: any, index: number) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} catalogMode={true} />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Feather.Truck className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Nenhum veículo encontrado com esses filtros.</p>
            </motion.div>
          )}
        </div>
      </section>

      <footer className="py-8 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2024 ZailonAuto. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicCatalogPage;
