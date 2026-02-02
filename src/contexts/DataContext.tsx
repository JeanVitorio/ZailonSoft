import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Vehicle, vehicles as initialVehicles } from '@/data/vehicles';
import { Lead, leads as initialLeads } from '@/data/leads';
import { Store, defaultStore, Seller, sellers as initialSellers } from '@/data/store';

interface DataContextType {
  vehicles: Vehicle[];
  leads: Lead[];
  store: Store;
  sellers: Seller[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'views' | 'likes'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  updateStore: (updates: Partial<Store>) => void;
  addSeller: (seller: Omit<Seller, 'id' | 'salesCount'>) => void;
  deleteSeller: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('autoconnect_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('autoconnect_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [store, setStore] = useState<Store>(() => {
    const saved = localStorage.getItem('autoconnect_store');
    return saved ? JSON.parse(saved) : defaultStore;
  });

  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('autoconnect_sellers');
    return saved ? JSON.parse(saved) : initialSellers;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('autoconnect_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('autoconnect_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('autoconnect_store', JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    localStorage.setItem('autoconnect_sellers', JSON.stringify(sellers));
  }, [sellers]);

  const addVehicle = (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'views' | 'likes'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: `vehicle-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0
    };
    setVehicles(prev => [newVehicle, ...prev]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => 
      l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
    ));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const updateStore = (updates: Partial<Store>) => {
    setStore(prev => ({ ...prev, ...updates }));
  };

  const addSeller = (seller: Omit<Seller, 'id' | 'salesCount'>) => {
    const newSeller: Seller = {
      ...seller,
      id: `seller-${Date.now()}`,
      salesCount: 0
    };
    setSellers(prev => [...prev, newSeller]);
  };

  const deleteSeller = (id: string) => {
    setSellers(prev => prev.filter(s => s.id !== id));
  };

  return (
    <DataContext.Provider value={{
      vehicles,
      leads,
      store,
      sellers,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addLead,
      updateLead,
      deleteLead,
      updateStore,
      addSeller,
      deleteSeller
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
