// src/pages/PublicVehicleCatalogPage.tsx
// Versão aprimorada: UX/UX, performance, robustez

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';

import {
  fetchCarsByLojaId,
  fetchLojaDetails,
  Car,
  LojaDetails,
} from '@/services/api';

import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';

// -------------------- Helpers --------------------
const PLACEHOLDER =
  'https://placehold.co/800x450/e4e4e7/3f3f46?text=Sem+Imagem';

const parsePrice = (value: string | number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const s = String(value ?? '').trim();
  if (!s) return 0;
  const cleaned = s.replace(/R\$\s?/gi, '').replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const formatCurrency = (value: string | number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parsePrice(value),
  );

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

// -------------------- Detalhe do veículo (no Dialog) --------------------
function PublicCarDetailsView({
  vehicle,
  onBack,
}: {
  vehicle: Car;
  onBack: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const images = vehicle.imagens || [];
  const hasImages = images.length > 0;

  const go = (dir: number) => {
    if (!hasImages) return;
    const next = (idx + dir + images.length) % images.length;
    setIdx(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">{vehicle.nome}</h1>
        <motion.button
          type="button"
          className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 transition-all inline-flex items-center"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Feather.X className="w-4 h-4 mr-2" />
          Fechar
        </motion.button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Galeria */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
              <img
                src={hasImages ? images[idx] : PLACEHOLDER}
                alt={`Imagem ${idx + 1} do veículo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                }}
                loading="eager"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Imagem anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full border border-zinc-200 text-amber-600 hover:bg-white"
                    onClick={() => go(-1)}
                  >
                    <Feather.ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima imagem"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full border border-zinc-200 text-amber-600 hover:bg-white"
                    onClick={() => go(1)}
                  >
                    <Feather.ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdx(i)}
                    className={`relative rounded-md overflow-hidden border-2 ${
                      idx === i ? 'border-amber-500' : 'border-transparent'
                    }`}
                    aria-label={`Miniatura ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${i + 1}`}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-zinc-800 font-medium">Preço</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(vehicle.preco || 0)}
                </p>
              </div>
              <div>
                <p className="text-zinc-800 font-medium">Ano</p>
                <p className="text-2xl font-semibold text-zinc-800">{vehicle.ano ?? '—'}</p>
              </div>
            </div>

            <div>
              <p className="text-zinc-800 font-medium">Descrição</p>
              <p className="text-zinc-600 whitespace-pre-wrap">
                {vehicle.descricao || 'Nenhuma descrição.'}
              </p>
            </div>

            <div className="pt-4">
              <Link to={`/form-proposta/${vehicle.id}`}>
                <motion.button
                  type="button"
                  className="w-full px-4 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all inline-flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Feather.FileText className="w-4 h-4 mr-2" /> Enviar Proposta
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Página principal --------------------
export function PublicVehicleCatalogPage() {
  const { lojaId } = useParams<{ lojaId: string }>();

  // Busca catálogo
  const {
    data: vehicles = [],
    isLoading: isLoadingVehicles,
    error: errorVehicles,
  } = useQuery<Car[]>({
    queryKey: ['publicVehicles', lojaId],
    queryFn: () => fetchCarsByLojaId(lojaId!),
    enabled: !!lojaId,
  });

  // Dados públicos da loja
  const {
    data: lojaData,
    isLoading: isLoadingLoja,
    error: errorLoja,
  } = useQuery<LojaDetails>({
    queryKey: ['lojaDetails', lojaId],
    queryFn: () => fetchLojaDetails(lojaId!),
    enabled: !!lojaId,
  });

  // Filtros/ordenação
  const [rawSearch, setRawSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // com debounce
  const [sortKey, setSortKey] = useState<'recent' | 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc'>('recent');

  // Debounce da busca (300ms)
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setSearchTerm(rawSearch.trim().toLowerCase());
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [rawSearch]);

  // Card selecionado (Dialog)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Normaliza e filtra
  const filteredVehicles = useMemo(() => {
    const list = [...vehicles];

    // Ordenação
    list.sort((a, b) => {
      const pa = parsePrice(a.preco);
      const pb = parsePrice(b.preco);
      const ya = Number(a.ano) || 0;
      const yb = Number(b.ano) || 0;

      switch (sortKey) {
        case 'price_asc':
          return pa - pb;
        case 'price_desc':
          return pb - pa;
        case 'year_desc':
          return yb - ya;
        case 'year_asc':
          return ya - yb;
        case 'recent':
        default:
          // como não temos created_at no tipo, mantemos ordem original (pode ser substituído por created_at se existir)
          return 0;
      }
    });

    if (!searchTerm) return list;

    return list.filter((v) => {
      const nome = (v.nome || '').toLowerCase();
      const ano = String(v.ano || '');
      const precoNum = formatCurrency(v.preco).replace('R$', '').trim().toLowerCase();
      return (
        nome.includes(searchTerm) ||
        ano.includes(searchTerm) ||
        precoNum.includes(searchTerm)
      );
    });
  }, [vehicles, searchTerm, sortKey]);

  const isLoading = isLoadingVehicles || isLoadingLoja;

  // -------------------- Estados de carregamento/erro --------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-zinc-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-64 bg-zinc-200 rounded animate-pulse" />
              <div className="h-5 w-96 bg-zinc-200 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="h-10 w-full md:w-96 bg-zinc-200 rounded animate-pulse" />
            <div className="h-10 w-48 bg-zinc-200 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden bg-white rounded-lg shadow-sm border border-zinc-200">
                <div className="aspect-video bg-zinc-200 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-2/3 bg-zinc-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-zinc-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-zinc-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (errorVehicles || errorLoja) {
    return (
      <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
        <div className="max-w-xl mx-auto bg-white border border-red-200 rounded-xl p-6 text-center shadow-sm">
          <Feather.AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-900">Falha ao carregar</h2>
          <p className="text-zinc-600">
            Não foi possível carregar o catálogo ou os dados da loja. Tente novamente mais tarde.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 text-amber-700 font-medium px-3 py-2 rounded-lg border border-amber-300 hover:bg-amber-50"
          >
            <Feather.Home className="w-4 h-4" />
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 p-4 md:p-8">
        <div className="max-w-xl mx-auto bg-white border border-zinc-200 rounded-xl p-6 text-center shadow-sm">
          <Feather.Box className="mx-auto h-10 w-10 text-zinc-500" />
          <h2 className="mt-3 text-lg font-semibold text-zinc-900">Catálogo vazio</h2>
          <p className="text-zinc-600">Esta loja ainda não possui veículos cadastrados.</p>
        </div>
      </div>
    );
  }

  // -------------------- UI principal --------------------
  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 space-y-8">
      {/* Cabeçalho */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="max-w-7xl mx-auto flex items-center gap-4"
      >
        {lojaData?.logo_url ? (
          <img
            src={lojaData.logo_url}
            alt={`Logo ${lojaData.nome}`}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-amber-500 text-white flex items-center justify-center text-2xl font-bold shadow-md">
            {lojaData?.nome?.[0]?.toUpperCase() || 'L'}
          </div>
        )}
        <div>
          <h1 className="text-4xl font-extrabold text-amber-600 mb-1">
            Catálogo {lojaData?.nome || '—'}
          </h1>
          <p className="text-base md:text-lg text-zinc-700">
            Explore os veículos disponíveis e envie sua proposta.
          </p>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 md:items-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="relative w-full md:w-96">
          <Feather.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
          <Input
            placeholder="Buscar por nome, ano ou valor..."
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className="pl-10 border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-700">Ordenar por:</label>
          <select
            value={sortKey}
            onChange={(e) =>
              setSortKey(e.target.value as typeof sortKey)
            }
            className="h-10 rounded-md border border-zinc-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="recent">Mais recente</option>
            <option value="price_asc">Preço (menor → maior)</option>
            <option value="price_desc">Preço (maior → menor)</option>
            <option value="year_desc">Ano (mais novo → mais velho)</option>
            <option value="year_asc">Ano (mais velho → mais novo)</option>
          </select>
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={{ visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
      >
        {filteredVehicles.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            variants={fadeInUp}
            className="overflow-hidden bg-white rounded-lg shadow-sm border border-zinc-200 hover:border-amber-400/50 transition-all group"
          >
            <div className="aspect-video overflow-hidden bg-zinc-100">
              <img
                src={vehicle.imagens?.[0] || PLACEHOLDER}
                alt={vehicle.nome}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                }}
                loading="lazy"
              />
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-zinc-900">{vehicle.nome}</h3>
                  <p className="text-sm text-zinc-600 mt-1 flex items-center gap-1">
                    <Feather.Calendar className="w-4 h-4" /> {vehicle.ano}
                  </p>
                </div>
                <div className="text-xl md:text-2xl font-bold text-amber-600">
                  {formatCurrency(vehicle.preco)}
                </div>
              </div>

              {vehicle.descricao && (
                <p className="text-sm text-zinc-600 line-clamp-2">{vehicle.descricao}</p>
              )}

              <div className="flex gap-2 pt-2">
                <motion.button
                  type="button"
                  className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all inline-flex items-center justify-center"
                  onClick={() => setSelectedCar(vehicle)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Feather.Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </motion.button>

                <Link to={`/form-proposta/${vehicle.id}`} className="flex-1">
                  <motion.button
                    type="button"
                    className="w-full px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all inline-flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Feather.FileText className="w-4 h-4 mr-2" />
                    Proposta
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Nenhum resultado após filtro */}
      {filteredVehicles.length === 0 && vehicles.length > 0 && (
        <motion.div
          className="text-center py-12"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="w-24 h-24 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Feather.Search className="w-12 h-12 text-zinc-600" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            Nenhum veículo encontrado
          </h3>
          <p className="text-zinc-600">Tente ajustar sua busca ou a ordenação.</p>
        </motion.div>
      )}

      {/* Dialog */}
      <Dialog
        open={!!selectedCar}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedCar(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white border border-zinc-200 overflow-y-auto">
          {selectedCar && (
            <div className="p-6">
              <PublicCarDetailsView vehicle={selectedCar} onBack={() => setSelectedCar(null)} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PublicVehicleCatalogPage;
