// src/pages/PublicVehicleCatalogPage.tsx
// Versão aprimorada: UX/UX, performance, robustez (Tema Dark/Emerald)

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
  'https://placehold.co/800x450/1e293b/cbd5e1?text=Sem+Imagem'; // Cor Slate

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
        <h1 className="text-2xl md:text-3xl font-bold text-slate-50">{vehicle.nome}</h1>
        <motion.button
          type="button"
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-all inline-flex items-center"
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Feather.X className="w-4 h-4 mr-2" />
          Fechar
        </motion.button>
      </div>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Galeria */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-800/80 p-2 rounded-full border border-slate-700 text-emerald-400 hover:bg-slate-700"
                    onClick={() => go(-1)}
                  >
                    <Feather.ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Próxima imagem"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-800/80 p-2 rounded-full border border-slate-700 text-emerald-400 hover:bg-slate-700"
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
                      idx === i ? 'border-emerald-500' : 'border-transparent'
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
                <p className="text-slate-200 font-medium">Preço</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(vehicle.preco || 0)}
                </p>
              </div>
              <div>
                <p className="text-slate-200 font-medium">Ano</p>
                <p className="text-2xl font-semibold text-slate-100">{vehicle.ano ?? '—'}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-200 font-medium">Descrição</p>
              <p className="text-slate-400 whitespace-pre-wrap">
                {vehicle.descricao || 'Nenhuma descrição.'}
              </p>
            </div>

            <div className="pt-4">
              <Link to={`/form-proposta/${vehicle.id}`}>
                <motion.button
                  type="button"
                  className="w-full px-4 py-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition-all inline-flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.4)]"
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
      <div className="min-h-screen bg-black text-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-7 w-64 bg-slate-800 rounded animate-pulse" />
              <div className="h-5 w-96 bg-slate-800 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="h-10 w-full md:w-96 bg-slate-800 rounded animate-pulse" />
            <div className="h-10 w-48 bg-slate-800 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden bg-slate-900 rounded-lg shadow-sm border border-slate-800">
                <div className="aspect-video bg-slate-800 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-2/3 bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-800 rounded animate-pulse" />
                  <div className="h-4 w-full bg-slate-800 rounded animate-pulse" />
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
      <div className="min-h-screen bg-black text-slate-50 p-4 md:p-8">
        <div className="max-w-xl mx-auto bg-slate-900 border border-red-500/30 rounded-xl p-6 text-center shadow-lg">
          <Feather.AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
          <h2 className="mt-3 text-lg font-semibold text-slate-50">Falha ao carregar</h2>
          <p className="text-slate-400">
            Não foi possível carregar o catálogo ou os dados da loja. Tente novamente mais tarde.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 text-emerald-400 font-medium px-3 py-2 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10"
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
      <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 text-center shadow-lg">
          <Feather.Box className="mx-auto h-10 w-10 text-slate-500" />
          <h2 className="mt-3 text-lg font-semibold text-slate-50">Catálogo vazio</h2>
          <p className="text-slate-400">Esta loja ainda não possui veículos cadastrados.</p>
        </div>
      </div>
    );
  }

  // -------------------- UI principal --------------------
  return (
    <div className="min-h-screen bg-black text-slate-50 p-4 md:p-8 space-y-8">
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
            className="w-20 h-20 rounded-full object-cover border-4 border-slate-900 shadow-md"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-2xl font-bold shadow-md">
            {lojaData?.nome?.[0]?.toUpperCase() || 'L'}
          </div>
        )}
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-400 mb-1">
            Catálogo {lojaData?.nome || '—'}
          </h1>
          <p className="text-base md:text-lg text-slate-400">
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
          <Feather.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome, ano ou valor..."
            value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-slate-50 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Ordenar por:</label>
          <select
            value={sortKey}
            onChange={(e) =>
              setSortKey(e.target.value as typeof sortKey)
            }
            className="h-10 rounded-md border border-slate-700 px-3 text-sm bg-slate-800 text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
            className="overflow-hidden bg-slate-900 rounded-lg shadow-lg border border-slate-800 hover:border-emerald-500/50 transition-all group"
          >
            <div className="aspect-video overflow-hidden bg-slate-800">
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
                  <h3 className="text-lg md:text-xl font-bold text-slate-50">{vehicle.nome}</h3>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                    <Feather.Calendar className="w-4 h-4" /> {vehicle.ano}
                  </p>
                </div>
                <div className="text-xl md:text-2xl font-bold text-emerald-400">
                  {formatCurrency(vehicle.preco)}
                </div>
              </div>

              {vehicle.descricao && (
                <p className="text-sm text-slate-400 line-clamp-2">{vehicle.descricao}</p>
              )}

              <div className="flex gap-2 pt-2">
                <motion.button
                  type="button"
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-slate-100 transition-all inline-flex items-center justify-center"
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
                    className="w-full px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition-all inline-flex items-center justify-center"
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
          <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Feather.Search className="w-12 h-12 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-50 mb-2">
            Nenhum veículo encontrado
          </h3>
          <p className="text-slate-400">Tente ajustar sua busca ou a ordenação.</p>
        </motion.div>
      )}

      {/* Dialog */}
      <Dialog
        open={!!selectedCar}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedCar(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-slate-950 border-slate-800 overflow-y-auto">
          {/* O `DialogContent` do Shadcn já inclui um 'X' para fechar, 
              mas mantemos o `onBack` para o botão customizado */}
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