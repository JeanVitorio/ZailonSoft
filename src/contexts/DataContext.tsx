import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Vehicle, vehicles as initialVehicles } from '@/data/vehicles';
import { Lead, leads as initialLeads } from '@/data/leads';
import { Store, defaultStore, Seller, sellers as initialSellers } from '@/data/store';
import * as apiService from '@/services/api';

interface DataContextType {
  vehicles: Vehicle[];
  leads: Lead[];
  store: Store;
  sellers: Seller[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'views' | 'likes'>, images?: File[]) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateStore: (updates: Partial<Store>) => Promise<void>;
  addSeller: (seller: Omit<Seller, 'id' | 'salesCount'>) => Promise<void>;
  deleteSeller: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helpers
const parsePriceString = (value: any) => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  let s = String(value || '');
  s = s.replace(/[^0-9.,-]/g, '');
  if (!s) return 0;
  if (s.indexOf('.') !== -1 && s.indexOf(',') !== -1) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

const normalizeStateToStatus = (raw: any): Lead['status'] => {
  const s = String(raw || '').toLowerCase();
  if (!s) return 'new';
  if (s.includes('vend') || s.includes('sold') || s.includes('fechad') || s.includes('closed')) return 'closed';
  if (s.includes('perd') || s.includes('lost')) return 'lost';
  if (s.includes('proposta') || s.includes('proposal')) return 'proposal';
  if (s.includes('negoc') || s.includes('negoti')) return 'negotiating';
  if (s.includes('contat') || s.includes('contact') || s.includes('tentativa')) return 'contacted';
  if (s.includes('visita') || s.includes('visit')) return 'contacted';
  if (s.includes('novo') || s.includes('new')) return 'new';
  return 'new';
};

// Helper: converte dados do Supabase para formato local
const mapCarToVehicle = (car: apiService.Car): Vehicle => ({
  id: car.id,
  name: car.nome,
  brand: '',
  model: '',
  year: car.ano || new Date().getFullYear(),
  price: parsePriceString(car.preco),
  mileage: 0,
  fuel: '',
  transmission: '',
  color: '',
  description: car.descricao || '',
  features: [],
  images: car.imagens || [],
  videoUrl: undefined,
  stock: 1,
  status: 'available' as const,
  createdAt: new Date().toISOString(),
  views: 0,
  likes: 0
});

const mapClientToLead = (client: apiService.Client): Lead => {
  const bot = client.bot_data || {};
  const interested = (() => {
    try {
      const arr = Array.isArray(bot.interested_vehicles)
        ? bot.interested_vehicles
        : typeof bot.interested_vehicles === 'string'
        ? JSON.parse(bot.interested_vehicles || '[]')
        : [];
      if (arr.length) return arr[0];
    } catch {}
    return bot.interested_vehicle || null;
  })();

  const vehicleName = interested?.nome || interested?.name || (interested && typeof interested === 'string' ? interested : 'Veículo');

  return {
    id: client.chat_id,
    name: client.name || 'Sem nome',
    email: '',
    phone: client.phone || '',
    vehicleId: interested?.id || '',
    vehicleName: vehicleName,
    value: parsePriceString(bot.financing_details?.entry ?? 0),
    priority: 'medium' as Lead['priority'],
    source: 'catalog' as Lead['source'],
    status: normalizeStateToStatus(client.state || bot.state || client.bot_data?.state),
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    followUpDate: bot.visit_details?.day
  };
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [store, setStore] = useState<Store>(() => {
    const saved = localStorage.getItem('autoconnect_store');
    return saved ? JSON.parse(saved) : defaultStore;
  });
  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('autoconnect_sellers');
    return saved ? JSON.parse(saved) : initialSellers;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const carsData = await apiService.fetchAllCars();
      const vehiclesData = carsData.map(mapCarToVehicle);
      setVehicles(vehiclesData);

      const clientsData = await apiService.fetchClients();
      const leadsData = clientsData.map(mapClientToLead);
      setLeads(leadsData);

      const storeData = await apiService.fetchStoreDetails();
      if (storeData) {
        setStore({
          id: storeData.id,
          name: storeData.nome,
          logo: storeData.logo_url || '',
          address: storeData.endereco || '',
          phone: storeData.telefone || '',
          email: storeData.email || '',
          website: storeData.website || '',
          social: storeData.social || {}
        });
      }

      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar dados do Supabase:', err);
      setError(err?.message || 'Erro ao carregar dados');
      setVehicles(initialVehicles);
      setLeads(initialLeads);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'views' | 'likes'>, images: File[] = []) => {
    try {
      const storeData = await apiService.fetchStoreDetails();
      if (!storeData?.id) throw new Error('Loja não identificada.');

      const result = await apiService.addVehicle({
        name: vehicle.name,
        year: String(vehicle.year),
        price: String(vehicle.price),
        description: vehicle.description
      }, images, storeData.id);

      const newVehicle = mapCarToVehicle(result);
      setVehicles(prev => [newVehicle, ...prev]);
    } catch (err) {
      console.error('Erro ao adicionar veículo:', err);
      throw err;
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    try {
      const dataToSupabase: Record<string, any> = {};
      if (updates.name) dataToSupabase.nome = updates.name;
      if (updates.price !== undefined) dataToSupabase.preco = String(updates.price);
      if (updates.year) dataToSupabase.ano = Number(updates.year);
      if (updates.description) dataToSupabase.descricao = updates.description;

      await apiService.updateVehicle({
        carId: id,
        updatedData: dataToSupabase
      });

      setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
    } catch (err) {
      console.error('Erro ao atualizar veículo:', err);
      throw err;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await apiService.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Erro ao deletar veículo:', err);
      throw err;
    }
  };

  const addLead = async (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Implementar se necessário integração com createClient do apiService
    const now = new Date().toISOString();
    const newLead: Lead = { ...lead, id: `lead-${Date.now()}`, createdAt: now, updatedAt: now };
    setLeads(prev => [newLead, ...prev]);
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      if (updates.status) {
        await apiService.updateClientStatus({ chatId: id, newState: updates.status });
      }
      setLeads(prev => prev.map(l => 
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ));
    } catch (err) {
      console.error('Erro ao atualizar lead:', err);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await apiService.deleteClient(id);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Erro ao deletar lead:', err);
    }
  };

  const updateStore = async (updates: Partial<Store>) => {
    try {
      if (!store.id) return;
      await apiService.updateStoreDetails({
        lojaId: store.id,
        updates: {
          nome: updates.name,
          telefone: updates.phone,
          endereco: updates.address
        }
      });
      setStore(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Erro ao atualizar loja:', err);
    }
  };

  const addSeller = async (seller: Omit<Seller, 'id' | 'salesCount'>) => {
    try {
      const storeData = await apiService.fetchStoreDetails();
      const result = await apiService.createVendedor({
        ...seller,
        loja_id: storeData.id
      });
      setSellers(prev => [...prev, { ...seller, id: result.id, salesCount: 0 }]);
    } catch (err) {
      console.error('Erro ao adicionar vendedor:', err);
    }
  };

  const deleteSeller = async (id: string) => {
    try {
      await apiService.deleteVendedor(id);
      setSellers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erro ao deletar vendedor:', err);
    }
  };

  return (
    <DataContext.Provider value={{
      vehicles, leads, store, sellers, isLoading, error,
      refreshData, addVehicle, updateVehicle, deleteVehicle,
      addLead, updateLead, deleteLead, updateStore, addSeller, deleteSeller
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};