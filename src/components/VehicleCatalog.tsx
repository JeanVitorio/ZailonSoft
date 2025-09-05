// src/components/VehicleCatalog.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- IMPORTS DOS COMPONENTES UI ---
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Search, Eye, Trash2, Calendar, Car, ArrowLeft, Edit, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Funções da API e Tipos Supabase ---
import { 
  fetchAvailableCars, 
  updateVehicle as updateVehicleInSupabase, 
  deleteVehicle as deleteVehicleInSupabase, 
  deleteVehicleImage as deleteVehicleImageInSupabase, 
  Car as SupabaseCar 
} from '@/services/api'; 

// --- Tipos de Dados ---
interface Vehicle extends SupabaseCar {}

const formatCurrency = (value: string | number): string => {
  const number = Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};

// --- Sub-componente: Detalhes do Veículo (Refatorado) ---
function CarDetailsView({ vehicle, onBack }: { vehicle: Vehicle; onBack: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>(vehicle);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (vehicle) {
      const initialPrice = vehicle.preco ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(Number(vehicle.preco)) : '';
      setFormData({
        ...vehicle,
        preco: initialPrice
      });
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
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
    }).format(numberValue);
    
    setFormData({ ...formData, preco: formattedValue });
  };

  const updateMutation = useMutation({
    mutationFn: ({ carId, updatedData, newImages }: { carId: string, updatedData: Partial<Vehicle>, newImages: File[] }) => updateVehicleInSupabase({ carId, updatedData, newImages }),
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Veículo atualizado." });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsEditing(false);
    },
    onError: (e: Error) => toast({ title: "Erro!", description: e.message, variant: "destructive" }),
  });

  const deleteImageMutation = useMutation({
    mutationFn: ({ carId, imageUrl }: { carId: string, imageUrl: string }) => deleteVehicleImageInSupabase({ carId, imageUrl }),
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Imagem removida." });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (e: Error) => toast({ title: "Erro!", description: e.message, variant: "destructive" }),
  });

  const handleSave = () => {
    const updatedData = {
      name: formData.nome || '',
      year: formData.ano,
      price: String(formData.preco || '').replace(/[^0-9,]/g, '').replace(',', '.'),
      description: formData.descricao || '',
    };
    updateMutation.mutate({ carId: vehicle.id, updatedData, newImages });
  };

  const handleImageRemove = (index: number) => {
    if (confirm('Tem certeza que deseja remover esta imagem?')) {
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
        <h1 className="text-3xl font-bold">{isEditing ? <Input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} /> : formData.nome}</h1>
        <div className="flex gap-2">
          {!isEditing ? (<>
            <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4"/> Fechar</Button>
            <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/> Editar</Button>
          </>) : (<>
            <Button variant="outline" onClick={() => setIsEditing(false)}><X className="mr-2 h-4 w-4"/> Cancelar</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}><Save className="mr-2 h-4 w-4"/> {updateMutation.isPending ? 'Salvando...' : 'Salvar'}</Button>
          </>)}
        </div>
      </div>
      <Card>
        <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden border">
              {currentImages.length > 0 ? <img src={currentImages[currentImageIndex]} alt="Imagem principal" className="w-full h-full object-cover"/> : <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">Sem imagem</div>}
              {currentImages.length > 1 && (<>
                <Button size="icon" variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2" onClick={() => navigateGallery(-1)}><ChevronLeft/></Button>
                <Button size="icon" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => navigateGallery(1)}><ChevronRight/></Button>
              </>)}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {currentImages.map((img, index) => (
                <div key={index} className="relative">
                  <img src={img} onClick={() => setCurrentImageIndex(index)} className={`w-full aspect-square object-cover rounded-md cursor-pointer border-2 ${currentImageIndex === index ? 'border-primary' : 'border-transparent'}`} />
                  {isEditing && <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => handleImageRemove(index)}><Trash2 className="h-3 w-3"/></Button>}
                </div>
              ))}
            </div>
            {isEditing && (
              <div>
                <Label htmlFor="new-images">Adicionar novas imagens</Label>
                <Input id="new-images" type="file" multiple accept="image/*" onChange={e => setNewImages(Array.from(e.target.files || []))} />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preço</Label>
                {isEditing ? (
                  <Input 
                    value={String(formData.preco || '')} 
                    onChange={handlePriceChange}
                    placeholder="0,00"
                    inputMode="numeric"
                  />
                ) : (
                  <p className="text-2xl font-bold text-primary">{formatCurrency(formData.preco || 0)}</p>
                )}
              </div>
              <div><Label>Ano</Label>{isEditing ? <Input type="number" value={String(formData.ano || '')} onChange={e => setFormData({...formData, ano: Number(e.target.value)})} /> : <p className="font-semibold">{formData.ano}</p>}</div>
            </div>
            <div>
              <Label>Descrição</Label>
              {isEditing ? <Textarea value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} rows={8}/> : <p className="text-muted-foreground whitespace-pre-wrap">{formData.descricao}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Componente Principal do Catálogo ---
export function VehicleCatalog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCar, setSelectedCar] = useState<Vehicle | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    onError: (error: Error) => toast({ title: "Erro!", description: error.message, variant: "destructive" }),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Catálogo de Veículos</h1>
          <p className="text-muted-foreground">Gerencie seu estoque de veículos</p>
        </div>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input placeholder="Buscar por nome ou ano..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      {isLoading && <div>Carregando catálogo...</div>}
      {error && <div className="text-destructive">Erro: {(error as Error).message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 group">
            <div className="aspect-video overflow-hidden bg-muted">
              <img src={vehicle.imagens?.[0] ? vehicle.imagens[0] : 'https://placehold.co/400x300/0f1326/e2e8f0?text=Sem+Imagem'} alt={vehicle.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x300/0f1326/e2e8f0?text=Sem+Imagem'; }} />
            </div>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{vehicle.nome}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="w-4 h-4" /> {vehicle.ano}</p>
                  </div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(vehicle.preco)}</div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{vehicle.descricao}</p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedCar(vehicle)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(vehicle.id)} disabled={deleteMutation.isPending && deleteMutation.variables === vehicle.id}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredVehicles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <Car className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum veículo encontrado</h3>
        </div>
      )}

      <Dialog open={!!selectedCar} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedCar(null); } }}>
        <DialogContent className="max-w-4xl max-h-[95vh] p-0">
            {selectedCar && (
              <div className="p-6 overflow-y-auto">
                <CarDetailsView
                    vehicle={selectedCar}
                    onBack={() => setSelectedCar(null)}
                />
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VehicleCatalog;