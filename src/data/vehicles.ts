export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  color: string;
  description: string;
  features: string[];
  images: string[];
  videoUrl?: string;
  stock: number;
  status: 'available' | 'reserved' | 'sold';
  createdAt: string;
  views: number;
  likes: number;
}

// No more mock data - all data comes from Supabase
export const vehicles: Vehicle[] = [];

export const brands: string[] = [];
export const fuelTypes: string[] = [];
export const years: number[] = [];
