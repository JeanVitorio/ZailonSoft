export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  description: string;
  mainImage: string;
  images: string[];
  features: string[];
}

export interface LeadData {
  vehicleId: string;
  name: string;
  age: string;
  phone: string;
  interestType: 'cash' | 'financing' | 'trade' | 'visit';
  // Financing specific
  downPayment?: number;
  installments?: number;
  cnhImage?: File | null;
  // Trade specific
  tradeModel?: string;
  tradeYear?: string;
  tradeValue?: number;
  tradeImages?: File[];
  tradeDifference?: 'cash' | 'financing';
  // Visit specific
  visitDate?: string;
  visitTime?: string;
  // LGPD
  lgpdConsent: boolean;
  // Metadata
  createdAt?: string;
}

export type InterestType = 'cash' | 'financing' | 'trade' | 'visit';
