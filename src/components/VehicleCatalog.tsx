import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { fetchAvailableCars, updateVehicle as updateVehicleInSupabase, deleteVehicle as deleteVehicleInSupabase, deleteVehicleImage as deleteVehicleImageInSupabase, Car as SupabaseCar } from '@/services/api';
import { useAuth } from '@/auth/AuthContext'; 

interface Vehicle extends SupabaseCar {}

// Funções de conversão (sem alterações)
const parsePrice = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'string') return 0;
  const cleaned = String(value)
    .replace(/R\$\s?/, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const number = parseFloat(cleaned);
  return isNaN(number) ? 0 : number;
};

const formatCurrency = (value: string | number): string => {
  const number = parsePrice(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};

// Animações (sem alterações)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
};

// CarDetailsView Component (sem alterações)
function CarDetailsView({ vehicle, onBack }: { vehicle: Vehicle; onBack: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>(vehicle);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (vehicle) {
      const initialPrice = vehicle.preco ? formatCurrency(vehicle.preco).replace(/R\$\s?/, '') : '';
      setFormData({ ...vehicle, preco: initialPrice });
      setNewImages([]);
      setCurrentImageIndex(0);
    }
  }, [vehicle, isEditing]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly === '') {
      setFormData({ ...formData, preco: '' });
      return;
    }
    const numberValue = Number(digitsOnly) / 100;
    const formattedValue = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(numberValue);
    setFormData({ ...formData, preco: formattedValue });
  };

  const updateMutation = useMutation({
    mutationFn: ({ carId, updatedData, newImages }: { carId: string, updatedData: Partial<Vehicle>, newImages: File[] }) =>
      updateVehicleInSupabase({ carId, updatedData, newImages }),
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Veículo atualizado." });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsEditing(false);
    },
    onError: (e: Error) => {
      console.error('Erro ao atualizar veículo:', e);
      toast({ title: "Erro!", description: e.message || "Falha ao atualizar o veículo.", variant: "destructive" });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ carId, imageUrl }: { carId: string, imageUrl: string }) => deleteVehicleImageInSupabase({ carId, imageUrl }),
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Imagem removida." });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (e: Error) => {
      console.error('Erro ao remover imagem:', e);
      toast({ title: "Erro!", description: e.message || "Falha ao remover a imagem.", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!formData.nome || formData.nome.trim() === '') {
      toast({ title: "Erro!", description: "O nome do veículo é obrigatório.", variant: "destructive" });
      return;
    }
    if (!formData.ano || isNaN(Number(formData.ano))) {
      toast({ title: "Erro!", description: "O ano do veículo é inválido.", variant: "destructive" });
      return;
    }

    const priceNum = parsePrice(String(formData.preco || ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Erro!", description: "O preço do veículo é inválido.", variant: "destructive" });
      return;
    }

    if (!formData.loja_id) {
      toast({ title: "Erro!", description: "O ID da loja é obrigatório.", variant: "destructive" });
      return;
    }

    const updatedData = {
      nome: formData.nome.trim(),
      ano: Number(formData.ano),
      preco: priceNum,
      descricao: formData.descricao || '',
      loja_id: formData.loja_id,
    };

    updateMutation.mutate({ carId: vehicle.id, updatedData, newImages });
  };

  const handleImageRemove = (index: number) => {
    if (window.confirm('Tem certeza que deseja remover esta imagem?')) {
      const imageUrl = formData.imagens?.[index];
      if (imageUrl) {
        deleteImageMutation.mutate({ carId: vehicle.id, imageUrl });
      } else {
        toast({ title: "Erro!", description: "Imagem não encontrada.", variant: "destructive" });
      }
    }
  };

  const navigateGallery = (direction: number) => {
    if (!formData?.imagens) return;
    const newIndex = (currentImageIndex + direction + formData.imagens.length) % formData.imagens.length;
    setCurrentImageIndex(newIndex);
  };

  const currentImages = formData.imagens || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-zinc-900">
          {isEditing ? (
            <Input
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              className="text-3xl font-bold border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
            />
          ) : (
            formData.nome
          )}
        </h1>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <motion.button
                className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Feather.ArrowLeft className="w-4 h-4 mr-2 inline" /> Fechar
              </motion.button>
              <motion.button
                className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all"
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Feather.Edit className="w-4 h-4 mr-2 inline" /> Editar
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
                onClick={() => setIsEditing(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Feather.X className="w-4 h-4 mr-2 inline" /> Cancelar
              </motion.button>
              <motion.button
                className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Feather.Save className="w-4 h-4 mr-2 inline" /> {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </motion.button>
            </>
          )}
        </div>
      </div>
      <div className="bg-white/70 p-6 rounded-lg border border-zinc-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200">
              {currentImages.length > 0 ? (
                <img src={currentImages[currentImageIndex]} alt="Imagem principal" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-600">Sem imagem</div>
              )}
              {currentImages.length > 1 && (
                <>
                  <motion.button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full border border-zinc-200 text-amber-500 hover:bg-zinc-100"
                    onClick={() => navigateGallery(-1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Feather.ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full border border-zinc-200 text-amber-500 hover:bg-zinc-100"
                    onClick={() => navigateGallery(1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Feather.ChevronRight className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {currentImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    onClick={() => setCurrentImageIndex(index)}
                    alt={`Thumbnail ${index+1}`}
                    className={`w-full aspect-square object-cover rounded-md cursor-pointer border-2 ${currentImageIndex === index ? 'border-amber-500' : 'border-transparent'}`}
                  />
                  {isEditing && (
                    <motion.button
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                      onClick={() => handleImageRemove(index)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Feather.Trash2 className="h-3 w-3" />
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <div>
                <Label htmlFor="new-images" className="text-zinc-800 font-medium">Adicionar novas imagens</Label>
                <Input
                  id="new-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => setNewImages(Array.from(e.target.files || []))}
                  className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-800 font-medium">Preço</Label>
                {isEditing ? (
                  <Input
                    value={String(formData.preco || '')}
                    onChange={handlePriceChange}
                    placeholder="0,00"
                    inputMode="numeric"
                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                ) : (
                  <p className="text-2xl font-bold text-amber-500">{formatCurrency(formData.preco || 0)}</p>
                )}
              </div>
              <div>
                <Label className="text-zinc-800 font-medium">Ano</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={String(formData.ano || '')}
                    onChange={e => setFormData({ ...formData, ano: Number(e.target.value) })}
                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                ) : (
                  <p className="font-semibold text-zinc-800">{formData.ano}</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-zinc-800 font-medium">Descrição</Label>
              {isEditing ? (
                <Textarea
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  rows={8}
                  className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                />
              ) : (
                <p className="text-zinc-600 whitespace-pre-wrap">{formData.descricao}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// VehicleCatalog Component (Componente Principal)
export function VehicleCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Pega o usuário logado (que é o objeto 'loja')

  const { data: vehicles = [], isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: fetchAvailableCars,
  });

  useEffect(() => {
    if (selectedCar) {
      const updatedCarInList = vehicles.find(v => v.id === selectedCar.id);
      if (updatedCarInList) {
        setSelectedCar(updatedCarInList);
      } else {
        setSelectedCar(null);
      }
    }
  }, [vehicles, selectedCar]);

  const deleteMutation = useMutation({
    mutationFn: deleteVehicleInSupabase,
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Veículo removido do catálogo." });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao remover veículo:', error);
      toast({ title: "Erro!", description: error.message || "Falha ao remover o veículo.", variant: "destructive" });
    },
  });

  const handleDelete = (vehicleId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
      deleteMutation.mutate(vehicleId);
    }
  };

  const filteredVehicles = useMemo(() =>
    vehicles.filter(vehicle =>
      vehicle.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.ano.toString().includes(searchTerm)
    ), [vehicles, searchTerm]);

  // --- [FUNÇÃO CORRIGIDA] ---
  // Pega o ID da loja do primeiro carro da lista, que é o ID correto.
  const handleCopyPublicLink = () => {
    let lojaIdToUse: string | undefined = undefined;

    // 1. Tenta pegar o ID da loja a partir do primeiro veículo na lista
    //    (Este ID é o que comprovadamente funciona na página de formulário)
    if (vehicles.length > 0) {
        lojaIdToUse = vehicles[0].loja_id;
    } 
    // 2. Se não houver veículos, usa o ID da loja do usuário logado como fallback
    else if (user && user.id) {
        lojaIdToUse = user.id;
    }

    // 3. Se nenhum ID foi encontrado, mostra um erro
    if (!lojaIdToUse) {
        toast({ 
            title: "Erro!", 
            description: "Não foi possível encontrar o ID da loja. Adicione um veículo ao catálogo primeiro.", 
            variant: "destructive" 
        });
        return;
    }

    // Usa a URL correta do seu App.tsx: /catalogo-loja/
    const publicUrl = `${window.location.origin}/catalogo-loja/${lojaIdToUse}`;

    navigator.clipboard.writeText(publicUrl).then(() => {
        toast({ title: "Link Copiado!", description: "O link do catálogo público foi copiado." });
    }).catch(err => {
        console.error('Falha ao copiar link: ', err);
        toast({ title: "Erro", description: "Falha ao copiar o link.", variant: "destructive" });
    });
  };
  // --- [FIM DA CORREÇÃO] ---

  return (
    <div className="space-y-6 p-6 relative z-10">
      <motion.div
        className="flex items-center justify-between"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Catálogo de Veículos</h1>
          <p className="text-zinc-600">Gerencie seu estoque de veículos</p>
        </div>
        
        <motion.button
          onClick={handleCopyPublicLink}
          className="flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-all group shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Feather.Copy className="w-4 h-4 mr-2" />
          Copiar Link do Catálogo
        </motion.button>
        
      </motion.div>
      <motion.div
        className="relative max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <Feather.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-600 w-4 h-4" />
        <Input
          placeholder="Buscar por nome ou ano..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
        />
      </motion.div>

      {isLoading && (
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="text-zinc-800">Carregando catálogo...</div>
        </motion.div>
      )}
      {error && (
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="text-red-500">Erro: {(error as Error).message}</div>
        </motion.div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        {filteredVehicles.map((vehicle) => (
          <motion.div key={vehicle.id} variants={fadeInUp}>
            <div className="overflow-hidden bg-white/70 rounded-lg border border-zinc-200 shadow-sm hover:border-amber-400/50 transition-all group">
              <div className="aspect-video overflow-hidden bg-zinc-100">
                <img
                  src={vehicle.imagens?.[0] ? vehicle.imagens[0] : 'https://placehold.co/400x300/e4e4e7/3f3f46?text=Sem+Imagem'}
                  alt={vehicle.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x300/e4e4e7/3f3f46?text=Sem+Imagem'; }}
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">{vehicle.nome}</h3>
                    <p className="text-sm text-zinc-600 mt-1 flex items-center gap-1">
                      <Feather.Calendar className="w-4 h-4" /> {vehicle.ano}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-amber-500">{formatCurrency(vehicle.preco)}</div>
                </div>
                <p className="text-sm text-zinc-600 line-clamp-2">{vehicle.descricao}</p>
                <div className="flex gap-2 pt-2">
                  <motion.button
                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
                    onClick={() => setSelectedCar(vehicle)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Feather.Eye className="w-4 h-4 mr-2 inline" /> Ver Detalhes
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all"
                    onClick={() => {
                      // Este é o link do FORMULÁRIO PÚBLICO (individual)
                      const publicLink = `${window.location.origin}/form-proposta/${vehicle.id}`;
                      navigator.clipboard.writeText(publicLink);
                      toast({
                        title: "Link Copiado!",
                        description: "Link do formulário público copiado. Envie ao cliente!",
                        className: "bg-blue-500 text-white"
                      });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Feather.Link className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 rounded-lg border border-zinc-200 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                    onClick={() => handleDelete(vehicle.id)}
                    disabled={deleteMutation.isPending && deleteMutation.variables === vehicle.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Feather.Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      {filteredVehicles.length === 0 && !isLoading && (
        <motion.div
          className="text-center py-12"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="w-24 h-24 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Feather.Truck className="w-12 h-12 text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">Nenhum veículo encontrado</h3>
        </motion.div>
      )}

      <Dialog open={!!selectedCar} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedCar(null); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white/70 border border-zinc-200 overflow-y-auto">
          {selectedCar && (
            <div className="p-6">
              <CarDetailsView vehicle={selectedCar} onBack={() => setSelectedCar(null)} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VehicleCatalog;