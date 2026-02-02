import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Package } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatPrice } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const VehicleCatalog = () => {
  const { vehicles, deleteVehicle } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'year'>('name');

  const filteredVehicles = vehicles
    .filter(v => 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'year') return b.year - a.year;
      return a.name.localeCompare(b.name);
    });

  const statusBadge = (status: string) => {
    const styles = {
      available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      reserved: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      sold: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    const labels = {
      available: 'Disponível',
      reserved: 'Reservado',
      sold: 'Vendido'
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            Catálogo de Veículos
          </motion.h1>
          <p className="text-muted-foreground">{vehicles.length} veículos cadastrados</p>
        </div>

        <Link to="/sistema/adicionar">
          <Button variant="default">
            <Plus className="w-4 h-4" />
            Novo Veículo
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar veículos..."
            className="pl-12"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="name">Ordenar por Nome</option>
          <option value="price">Ordenar por Preço</option>
          <option value="year">Ordenar por Ano</option>
        </select>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-2xl overflow-hidden group"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3">
                  {statusBadge(vehicle.status)}
                </div>
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                    <Package className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-white font-medium">{vehicle.stock}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-amber-400 font-medium mb-1">{vehicle.brand} • {vehicle.year}</p>
                    <h3 className="font-semibold text-white">{vehicle.name}</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="price-tag text-sm">{formatPrice(vehicle.price)}</span>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/veiculo/${vehicle.id}`} target="_blank">
                      <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                    <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteVehicle(vehicle.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhum veículo encontrado
          </h3>
          <p className="text-muted-foreground mb-6">
            Adicione seu primeiro veículo ao catálogo
          </p>
          <Link to="/sistema/adicionar">
            <Button>
              <Plus className="w-4 h-4" />
              Adicionar Veículo
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default VehicleCatalog;
