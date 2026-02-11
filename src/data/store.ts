export interface Store {
  id: string;
  name: string;
  logo?: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  workingHours: string;
  socialMedia: {
    instagram?: string;
    facebook?: string;
  };
}

export const defaultStore: Store = {
  id: "store-1",
  name: "AutoConnect Premium",
  description: "Sua concessionária de veículos de luxo. Especialistas em supercarros e veículos exclusivos desde 2010.",
  email: "contato@autoconnect.com.br",
  phone: "(11) 3456-7890",
  whatsapp: "5546991163405",
  address: "Av. Europa, 1000 - Jardim Europa",
  city: "São Paulo",
  state: "SP",
  workingHours: "Seg-Sex: 9h-19h | Sáb: 9h-14h",
  socialMedia: {
    instagram: "@zailonsoft",
    facebook: "autoconnectpremium"
  }
};

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  salesCount: number;
}

export const sellers: Seller[] = [
  {
    id: "seller-1",
    name: "João Pedro Santos",
    email: "joao.santos@autoconnect.com.br",
    phone: "(11) 98765-4321",
    role: "Consultor Sênior",
    salesCount: 45
  },
  {
    id: "seller-2",
    name: "Maria Fernanda Lima",
    email: "maria.lima@autoconnect.com.br",
    phone: "(11) 98654-3210",
    role: "Consultora de Vendas",
    salesCount: 32
  },
  {
    id: "seller-3",
    name: "Pedro Henrique Costa",
    email: "pedro.costa@autoconnect.com.br",
    phone: "(11) 97543-2109",
    role: "Consultor de Vendas",
    salesCount: 28
  }
];
