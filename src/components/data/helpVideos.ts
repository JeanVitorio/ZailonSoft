export interface HelpVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  category: string;
  duration: string;
}

export const helpVideos: HelpVideo[] = [
  // Visão Geral
  {
    id: "v1",
    title: "Introdução ao Sistema",
    description: "Aprenda os conceitos básicos e navegue pela interface principal. Este tutorial cobre todos os fundamentos necessários para começar a usar o sistema com confiança.",
    thumbnailUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    category: "Visão Geral",
    duration: "8:24"
  },
  {
    id: "v2",
    title: "Configuração Inicial",
    description: "Personalize seu ambiente de trabalho e configure as preferências básicas do sistema para uma experiência otimizada.",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    category: "Visão Geral",
    duration: "6:15"
  },
  {
    id: "v3",
    title: "Dashboard e Métricas",
    description: "Entenda como visualizar e interpretar os principais indicadores de desempenho no seu dashboard personalizado.",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    category: "Visão Geral",
    duration: "10:42"
  },
  {
    id: "v4",
    title: "Atalhos e Produtividade",
    description: "Descubra atalhos essenciais e dicas de produtividade para trabalhar de forma mais eficiente.",
    thumbnailUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    category: "Visão Geral",
    duration: "5:30"
  },

  // Funil de Vendas
  {
    id: "f1",
    title: "Criando seu Primeiro Funil",
    description: "Passo a passo completo para criar e configurar seu primeiro funil de vendas, desde o conceito até a implementação.",
    thumbnailUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    category: "Funil de Vendas",
    duration: "12:18"
  },
  {
    id: "f2",
    title: "Automações de Vendas",
    description: "Configure automações inteligentes para nutrir leads e aumentar suas conversões automaticamente.",
    thumbnailUrl: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    category: "Funil de Vendas",
    duration: "9:45"
  },
  {
    id: "f3",
    title: "Análise de Conversão",
    description: "Aprenda a analisar taxas de conversão em cada etapa do funil e identificar pontos de melhoria.",
    thumbnailUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    category: "Funil de Vendas",
    duration: "11:20"
  },
  {
    id: "f4",
    title: "Otimização de Funis",
    description: "Técnicas avançadas para otimizar seu funil de vendas e maximizar resultados.",
    thumbnailUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    category: "Funil de Vendas",
    duration: "14:35"
  },

  // Gestão de Catálogo
  {
    id: "c1",
    title: "Adicionando Produtos",
    description: "Como adicionar, categorizar e gerenciar produtos no seu catálogo de forma eficiente.",
    thumbnailUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    category: "Gestão de Catálogo",
    duration: "7:50"
  },
  {
    id: "c2",
    title: "Gestão de Estoque",
    description: "Controle seu inventário, configure alertas de estoque baixo e gerencie reposições.",
    thumbnailUrl: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    category: "Gestão de Catálogo",
    duration: "10:15"
  },
  {
    id: "c3",
    title: "Precificação Inteligente",
    description: "Estratégias de precificação e como configurar regras automáticas de preços.",
    thumbnailUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
    category: "Gestão de Catálogo",
    duration: "8:40"
  },
  {
    id: "c4",
    title: "Importação em Massa",
    description: "Importe centenas de produtos de uma vez usando planilhas e arquivos CSV.",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    category: "Gestão de Catálogo",
    duration: "6:25"
  },
  {
    id: "c5",
    title: "Categorização Avançada",
    description: "Organize produtos com tags, filtros e categorias hierárquicas para melhor navegação.",
    thumbnailUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=450&fit=crop",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    category: "Gestão de Catálogo",
    duration: "9:10"
  }
];
