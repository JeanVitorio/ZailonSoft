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

export const vehicles: Vehicle[] = [
  {
    id: "1",
    name: "Porsche 911 Turbo S",
    brand: "Porsche",
    model: "911 Turbo S",
    year: 2024,
    price: 1890000,
    mileage: 0,
    fuel: "Gasolina",
    transmission: "PDK",
    color: "GT Silver",
    description: "O ápice da engenharia alemã. Motor biturbo de 650cv, 0-100 em 2.7s. Interior exclusivo em couro Nappa preto com detalhes em alumínio escovado.",
    features: ["Sport Chrono", "PASM", "Teto Solar", "Burmester", "Faróis Matrix LED", "Câmera 360°"],
    images: [
      "https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?w=1200&q=90",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=90",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=90"
    ],
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    stock: 1,
    status: "available",
    createdAt: "2024-01-15",
    views: 1250,
    likes: 89
  },
  {
    id: "2",
    name: "Ferrari F8 Tributo",
    brand: "Ferrari",
    model: "F8 Tributo",
    year: 2023,
    price: 3200000,
    mileage: 2500,
    fuel: "Gasolina",
    transmission: "F1 DCT",
    color: "Rosso Corsa",
    description: "A homenagem da Ferrari aos motores V8 mais poderosos da história. 720cv de pura emoção italiana em cada curva.",
    features: ["Manettino", "Carbono Exterior", "Sedili Racing", "Telemetria", "Escape Esportivo"],
    images: [
      "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=1200&q=90",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=90",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=90"
    ],
    stock: 1,
    status: "available",
    createdAt: "2024-01-10",
    views: 2100,
    likes: 156
  },
  {
    id: "3",
    name: "Lamborghini Huracán EVO",
    brand: "Lamborghini",
    model: "Huracán EVO",
    year: 2024,
    price: 2750000,
    mileage: 0,
    fuel: "Gasolina",
    transmission: "LDF",
    color: "Verde Mantis",
    description: "Design italiano agressivo combinado com tecnologia de ponta. V10 atmosférico de 640cv que canta até os 8.500rpm.",
    features: ["LDVI", "ALA 2.0", "Interior Alcantara", "Sistema Sensonum", "Freios Carbono-Cerâmicos"],
    images: [
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200&q=90",
      "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=1200&q=90"
    ],
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    stock: 2,
    status: "available",
    createdAt: "2024-01-20",
    views: 1890,
    likes: 134
  },
  {
    id: "4",
    name: "Mercedes-AMG GT Black Series",
    brand: "Mercedes-AMG",
    model: "GT Black Series",
    year: 2023,
    price: 2400000,
    mileage: 1200,
    fuel: "Gasolina",
    transmission: "AMG SPEEDSHIFT",
    color: "Magno Grey",
    description: "O AMG GT mais extremo já produzido. 730cv, aerodinâmica ativa e tecnologia derivada da F1.",
    features: ["AMG Track Pace", "Carbono Forjado", "Coilover Ajustável", "Modo Drift"],
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=90",
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=90"
    ],
    stock: 1,
    status: "reserved",
    createdAt: "2024-01-05",
    views: 980,
    likes: 67
  },
  {
    id: "5",
    name: "BMW M4 Competition",
    brand: "BMW",
    model: "M4 Competition",
    year: 2024,
    price: 890000,
    mileage: 0,
    fuel: "Gasolina",
    transmission: "M Steptronic",
    color: "Frozen Black",
    description: "A nova geração do cupê esportivo mais icônico da BMW. 510cv, tração integral M xDrive e tecnologia de última geração.",
    features: ["M Drive Professional", "Harman Kardon", "Teto Carbono", "Head-Up Display", "Assistente de Estacionamento Plus"],
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=90",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1200&q=90"
    ],
    stock: 3,
    status: "available",
    createdAt: "2024-01-25",
    views: 756,
    likes: 45
  },
  {
    id: "6",
    name: "Audi RS e-tron GT",
    brand: "Audi",
    model: "RS e-tron GT",
    year: 2024,
    price: 1250000,
    mileage: 0,
    fuel: "Elétrico",
    transmission: "2 Marchas",
    color: "Tactical Green",
    description: "O futuro da performance é elétrico. 646cv, 0-100 em 3.3s e autonomia de 472km. O Gran Turismo sustentável.",
    features: ["Matriz LED Laser", "Bang & Olufsen 3D", "Air Suspension Plus", "Carregamento 270kW"],
    images: [
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=90",
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=1200&q=90"
    ],
    stock: 2,
    status: "available",
    createdAt: "2024-01-28",
    views: 620,
    likes: 38
  }
];

export const brands = [...new Set(vehicles.map(v => v.brand))];
export const fuelTypes = [...new Set(vehicles.map(v => v.fuel))];
export const years = [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a);
