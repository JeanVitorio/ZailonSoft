import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit, Trash2, Eye, Package, Link2, X, Save, AlertTriangle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatPrice } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Vehicle } from '@/data/vehicles';
import { useAuth } from '@/contexts/AuthContext';

const VehicleCatalog = () => {
  const { vehicles, deleteVehicle, updateVehicle } = useData();
  const { lojaSlug } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'year'>('name');
  const [viewVehicle, setViewVehicle] = useState<Vehicle | null>(null);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editMileage, setEditMileage] = useState('');
  const [editFuel, setEditFuel] = useState('');
  const [editTransmission, setEditTransmission] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editStatus, setEditStatus] = useState<'available' | 'reserved' | 'sold'>('available');

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
    const styles: Record<string, string> = {
      available: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      reserved: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      sold: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    const labels: Record<string, string> = {
      available: 'Disponível',
      reserved: 'Reservado',
      sold: 'Vendido'
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${styles[status] || styles.available}`}>
        {labels[status] || 'Disponível'}
      </span>
    );
  };

  const handleExportUrl = () => {
    const url = `${window.location.origin}/demo`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copiada!",
      description: "Link do catálogo copiado para a área de transferência.",
    });
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setEditName(vehicle.name);
    setEditBrand(vehicle.brand || '');
    setEditModel(vehicle.model || '');
    setEditPrice(vehicle.price.toString());
    setEditYear(vehicle.year.toString());
    setEditMileage((vehicle.mileage || 0).toString());
    setEditFuel(vehicle.fuel || '');
    setEditTransmission(vehicle.transmission || '');
    setEditColor(vehicle.color || '');
    setEditDescription(vehicle.description);
    setEditStock(vehicle.stock.toString());
    setEditStatus(vehicle.status);
  };

  const handleSaveEdit = () => {
    if (editVehicle) {
      updateVehicle(editVehicle.id, {
        name: editName,
        brand: editBrand,
        model: editModel,
        price: parseFloat(editPrice) || 0,
        year: parseInt(editYear) || new Date().getFullYear(),
        mileage: parseInt(editMileage) || 0,
        fuel: editFuel,
        transmission: editTransmission,
        color: editColor,
        description: editDescription,
        stock: parseInt(editStock) || 1,
        status: editStatus
      });
      setEditVehicle(null);
      toast({
        title: "Veículo atualizado!",
        description: "As informações foram salvas com sucesso.",
      });
    }
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteVehicle(deleteTarget.id);
      toast({
        title: "Veículo excluído",
        description: `${deleteTarget.name} foi removido do catálogo.`,
      });
      setDeleteTarget(null);
    }
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
          <p className="text-muted-foreground text-sm md:text-base">{vehicles.length} veículos cadastrados</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportUrl} className="flex-1 sm:flex-none">
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar URL</span>
            <span className="sm:hidden">URL</span>
          </Button>
          <Link to={`/${lojaSlug}/adicionar`} className="flex-1 sm:flex-none">
            <Button className="w-full">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Veículo</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar veículos..."
            className="pl-12 h-12"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 text-sm"
        >
          <option value="name">Nome</option>
          <option value="price">Preço</option>
          <option value="year">Ano</option>
        </select>
      </div>

      {/* Vehicle Grid */}
      {filteredVehicles.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
                  src={vehicle.images[0] || '/placeholder.svg'}
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
              <div className="p-3 md:p-4">
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <div className="min-w-0">
                    <p className="text-xs text-amber-400 font-medium mb-1">{vehicle.brand} • {vehicle.year}</p>
                    <h3 className="font-semibold text-white text-sm md:text-base truncate">{vehicle.name}</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="price-tag text-xs md:text-sm">{formatPrice(vehicle.price)}</span>
                  
                  <div className="flex items-center gap-1 md:gap-2">
                    <button 
                      onClick={() => setViewVehicle(vehicle)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openEditModal(vehicle)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteTarget(vehicle)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="Excluir"
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
          className="flex flex-col items-center justify-center py-16 md:py-20 text-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 md:w-10 md:h-10 text-amber-400" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-white mb-2">
            Nenhum veículo encontrado
          </h3>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
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

      {/* View Modal */}
      <AnimatePresence>
        {viewVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewVehicle(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-card rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Detalhes do Veículo</h3>
                <button
                  onClick={() => setViewVehicle(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <img 
                  src={viewVehicle.images[0] || '/placeholder.svg'} 
                  alt={viewVehicle.name}
                  className="w-full aspect-video object-cover rounded-xl mb-4"
                />
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-amber-400 font-medium">{viewVehicle.brand} • {viewVehicle.year}</p>
                    <h2 className="text-xl font-bold text-white">{viewVehicle.name}</h2>
                  </div>
                  <p className="text-2xl font-bold text-amber-400">{formatPrice(viewVehicle.price)}</p>
                  <div className="flex items-center gap-2">
                    {statusBadge(viewVehicle.status)}
                    <span className="text-sm text-muted-foreground">Estoque: {viewVehicle.stock}</span>
                  </div>
                  <p className="text-muted-foreground">{viewVehicle.description}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-xs text-muted-foreground">Combustível</p>
                      <p className="text-sm text-white font-medium">{viewVehicle.fuel || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-xs text-muted-foreground">Transmissão</p>
                      <p className="text-sm text-white font-medium">{viewVehicle.transmission || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-xs text-muted-foreground">Km</p>
                      <p className="text-sm text-white font-medium">{viewVehicle.mileage?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                      <p className="text-xs text-muted-foreground">Cor</p>
                      <p className="text-sm text-white font-medium">{viewVehicle.color || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-2 p-4 border-t border-white/5">
                <Button variant="outline" onClick={() => setViewVehicle(null)} className="flex-1">
                  Fechar
                </Button>
                <Link to={`/veiculo/${viewVehicle.id}`} target="_blank" className="flex-1">
                  <Button className="w-full">
                    <Eye className="w-4 h-4" />
                    Ver Público
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditVehicle(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Editar Veículo</h3>
                <button
                  onClick={() => setEditVehicle(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Nome</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-12" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Marca</label>
                    <Input value={editBrand} onChange={(e) => setEditBrand(e.target.value)} className="h-12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Modelo</label>
                    <Input value={editModel} onChange={(e) => setEditModel(e.target.value)} className="h-12" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Preço</label>
                    <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="h-12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Ano</label>
                    <Input type="number" value={editYear} onChange={(e) => setEditYear(e.target.value)} className="h-12" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Km</label>
                    <Input type="number" value={editMileage} onChange={(e) => setEditMileage(e.target.value)} className="h-12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Combustível</label>
                    <select value={editFuel} onChange={(e) => setEditFuel(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 text-sm">
                      <option value="">Selecionar</option>
                      <option value="Gasolina">Gasolina</option>
                      <option value="Etanol">Etanol</option>
                      <option value="Flex">Flex</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Elétrico">Elétrico</option>
                      <option value="Híbrido">Híbrido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Câmbio</label>
                    <select value={editTransmission} onChange={(e) => setEditTransmission(e.target.value)} className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 text-sm">
                      <option value="">Selecionar</option>
                      <option value="Automático">Automático</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Cor</label>
                    <Input value={editColor} onChange={(e) => setEditColor(e.target.value)} className="h-12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Estoque</label>
                    <Input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="h-12" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as typeof editStatus)} className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 text-sm">
                      <option value="available">Disponível</option>
                      <option value="reserved">Reservado</option>
                      <option value="sold">Vendido</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Descrição</label>
                  <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={4} className="resize-none" />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-2 p-4 border-t border-white/5">
                <Button variant="outline" onClick={() => setEditVehicle(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  <Save className="w-4 h-4" />
                  Salvar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md glass-card rounded-2xl overflow-hidden"
            >
              {/* Red accent bar */}
              <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
              
              <div className="p-6 text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Excluir Veículo</h3>
                <p className="text-muted-foreground mb-1">
                  Tem certeza que deseja excluir
                </p>
                <p className="text-white font-semibold text-lg mb-1">"{deleteTarget.name}"</p>
                <p className="text-xs text-muted-foreground mb-6">
                  Esta ação não pode ser desfeita.
                </p>

                {/* Vehicle preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-6">
                  <img 
                    src={deleteTarget.images[0] || '/placeholder.svg'} 
                    alt={deleteTarget.name}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                  <div className="text-left min-w-0">
                    <p className="text-sm text-white font-medium truncate">{deleteTarget.name}</p>
                    <p className="text-xs text-muted-foreground">{deleteTarget.brand} • {deleteTarget.year}</p>
                  </div>
                  <span className="text-sm font-semibold text-amber-400 ml-auto flex-shrink-0">{formatPrice(deleteTarget.price)}</span>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete} 
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleCatalog;
