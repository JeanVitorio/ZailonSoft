import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  fetchAvailableCars,
  updateVehicle as updateVehicleInSupabase,
  deleteVehicle as deleteVehicleInSupabase,
  fetchStoreDetails,
  Car as SupabaseCar,
} from '@/services/api';
import { useAuth } from '@/auth/AuthContext';

interface Vehicle extends SupabaseCar {}

/* ================= Helpers de normalização ================= */
const getName = (c: Partial<Vehicle>) => (c as any)?.nome ?? (c as any)?.name ?? '';
const getDesc = (c: Partial<Vehicle>) => (c as any)?.descricao ?? (c as any)?.description ?? '';
const getYear = (c: Partial<Vehicle>) => (c as any)?.ano ?? (c as any)?.year ?? '';
const getPriceRaw = (c: Partial<Vehicle>) => (c as any)?.preco ?? (c as any)?.price ?? 0;
const getImages = (c: Partial<Vehicle>) => (c as any)?.imagens ?? (c as any)?.images ?? [];

/* parse/format de preço robusto */
const parsePrice = (v: any) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const s = String(v ?? '').trim();
  if (!s) return 0;
  const brlLike = s
    .replace(/\s+/g, '')
    .replace(/R\$\s?/gi, '')
    .replace(/\./g, '')
    .replace(/,/, '.');
  const n = Number(brlLike);
  if (Number.isFinite(n)) return n;
  const digits = s.replace(/\D+/g, '');
  return digits ? (digits.length >= 3 ? Number(digits) / 100 : Number(digits)) : 0;
};

const formatCurrency = (v: any) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(parsePrice(v));

const sl = (s: any) => String(s ?? '').toLowerCase();

const fade = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* ================= DETALHES ================= */
function CarDetailsView({ vehicle, onBack }: { vehicle: Vehicle; onBack: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [edit, setEdit] = useState(false);

  // estado local sempre com campos PT/EN espelhados
  const [data, setData] = useState<Partial<Vehicle>>({
    ...vehicle,
    nome: getName(vehicle),
    name: getName(vehicle),
    descricao: getDesc(vehicle),
    description: getDesc(vehicle),
    ano: getYear(vehicle) as any,
    year: getYear(vehicle) as any,
    preco: formatCurrency(getPriceRaw(vehicle)).replace('R$ ', ''), // sem R$ no input
    price: formatCurrency(getPriceRaw(vehicle)).replace('R$ ', ''),
    imagens: getImages(vehicle) as any,
    images: getImages(vehicle) as any,
  });

  const [imgs, setImgs] = useState<File[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setData({
      ...vehicle,
      nome: getName(vehicle),
      name: getName(vehicle),
      descricao: getDesc(vehicle),
      description: getDesc(vehicle),
      ano: getYear(vehicle) as any,
      year: getYear(vehicle) as any,
      preco: formatCurrency(getPriceRaw(vehicle)).replace('R$ ', ''),
      price: formatCurrency(getPriceRaw(vehicle)).replace('R$ ', ''),
      imagens: getImages(vehicle) as any,
      images: getImages(vehicle) as any,
    });
    setIdx(0);
  }, [vehicle]);

  const priceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    const formatted = v
      ? (Number(v) / 100)
          .toFixed(2)
          .replace('.', ',')
          .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : '';
    setData((prev) => ({ ...prev, preco: formatted, price: formatted }));
  };

  const validateData = (): boolean => {
    if (!getName(data).trim()) {
      toast({ title: 'Erro', description: 'O nome é obrigatório.', variant: 'destructive' });
      return false;
    }
    const yearNum = parseInt(getYear(data) as string, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      toast({ title: 'Erro', description: 'Ano inválido.', variant: 'destructive' });
      return false;
    }
    if (parsePrice(getPriceRaw(data)) <= 0) {
      toast({ title: 'Erro', description: 'Preço deve ser maior que zero.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const save = useMutation({
    mutationFn: () =>
      updateVehicleInSupabase({
        carId: (vehicle as any).id,
        updatedData: {
          nome: getName(data),
          descricao: getDesc(data),
          ano: Number(getYear(data)),
          preco: (data as any).preco,
        },
        newImages: imgs,
      }),
    onSuccess: () => {
      toast({ title: 'Salvo!' });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      setEdit(false);
      setImgs([]);
    },
    onError: (error: any) => {
      console.error('Erro ao salvar edição:', error);
      toast({
        title: 'Erro ao salvar',
        description: error?.message || 'Falha ao atualizar o veículo. Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const imgList = getImages(data) as string[];

  return (
    <div className="bg-slate-950 text-slate-50">
      {/* Header do modal */}
      <div className="p-6 md:p-8 border-b border-slate-800">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-300 rounded-full mb-4" />
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
            {edit ? (
              <Input
                autoFocus
                value={getName(data)}
                onChange={(e) =>
                  setData((p) => ({ ...p, nome: e.target.value, name: e.target.value }))
                }
                className="text-2xl md:text-3xl font-bold bg-slate-900 border-slate-700 text-slate-50"
              />
            ) : (
              getName(data) || 'Sem título'
            )}
          </h1>
          <div className="flex gap-2">
            {edit ? (
              <>
                <button
                  onClick={() => setEdit(false)}
                  className="px-4 py-2 text-slate-300 rounded-lg hover:bg-slate-900/70 border border-slate-700/60 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (validateData()) save.mutate();
                  }}
                  disabled={save.isPending}
                  className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl shadow hover:bg-amber-400 transition disabled:opacity-50 text-sm font-semibold"
                >
                  {save.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-slate-200 rounded-lg hover:bg-slate-900/70 border border-slate-800 flex items-center gap-2 text-sm"
                >
                  <Feather.ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <button
                  onClick={() => setEdit(true)}
                  className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl shadow hover:bg-amber-400 transition flex items-center gap-2 text-sm font-semibold"
                >
                  <Feather.Edit className="w-4 h-4" /> Editar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Corpo */}
      <div className="p-6 md:p-8 grid lg:grid-cols-2 gap-10">
        {/* Galeria */}
        <div className="space-y-4">
          <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            {imgList?.[idx] ? (
              <img src={imgList[idx]} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Sem foto
              </div>
            )}
            {imgList && imgList.length > 1 && (
              <>
                <button
                  onClick={() => setIdx((i) => (i - 1 + imgList.length) % imgList.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-slate-900/80 backdrop-blur p-2 rounded-full shadow border border-slate-700"
                >
                  <Feather.ChevronLeft className="text-slate-100" />
                </button>
                <button
                  onClick={() => setIdx((i) => (i + 1) % imgList.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900/80 backdrop-blur p-2 rounded-full shadow border border-slate-700"
                >
                  <Feather.ChevronRight className="text-slate-100" />
                </button>
              </>
            )}
          </div>
          <div className="grid grid-cols-6 gap-2">
            {imgList?.map((img, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`aspect-square rounded-xl border overflow-hidden ${
                  i === idx ? 'border-amber-400' : 'border-slate-800'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {edit && (
            <div className="space-y-1">
              <Label className="text-xs text-slate-300">Nova(s) foto(s)</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImgs(Array.from(e.target.files || []))}
                className="mt-1 bg-slate-900 border-slate-700 text-slate-100"
              />
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="text-xs text-slate-300">Preço</Label>
              {edit ? (
                <Input
                  value={String((data as any).preco ?? (data as any).price ?? '')}
                  onChange={priceInput}
                  placeholder="00,00"
                  className="text-2xl font-bold mt-1 bg-slate-900 border-slate-700 text-slate-50"
                />
              ) : (
                <p className="text-3xl font-bold text-amber-400 mt-1">
                  {formatCurrency(getPriceRaw(vehicle))}
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-slate-300">Ano</Label>
              {edit ? (
                <Input
                  type="number"
                  value={String(getYear(data) ?? '')}
                  onChange={(e) =>
                    setData((p) => ({
                      ...p,
                      ano: Number(e.target.value),
                      year: Number(e.target.value),
                    }))
                  }
                  className="text-2xl font-bold mt-1 bg-slate-900 border-slate-700 text-slate-50"
                />
              ) : (
                <p className="text-3xl font-bold text-slate-100 mt-1">
                  {getYear(vehicle) || '—'}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs text-slate-300">Descrição</Label>
            {edit ? (
              <Textarea
                value={getDesc(data)}
                onChange={(e) =>
                  setData((p) => ({ ...p, descricao: e.target.value, description: e.target.value }))
                }
                rows={6}
                className="mt-2 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            ) : (
              <p className="text-slate-300 mt-2 text-sm leading-relaxed">
                {getDesc(vehicle) || 'Sem descrição.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= CATÁLOGO ================= */
export function VehicleCatalog() {
  const [search, setSearch] = useState('');
  const [car, setCar] = useState<Vehicle | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { lojaId, isLoading: authLoad } = useAuth();

  // Dados da loja
  const { data: storeDetails } = useQuery({
    queryKey: ['storeDetails'],
    queryFn: fetchStoreDetails,
  });

  const { data: cars = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', lojaId],
    queryFn: () => (lojaId ? fetchAvailableCars(lojaId) : Promise.resolve([])),
    enabled: !!lojaId && !authLoad,
  });

  const del = useMutation({
    mutationFn: deleteVehicleInSupabase,
    onSuccess: () => {
      toast({ title: 'Excluído!' });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  // filtro com campos PT/EN
  const filtered = useMemo(() => {
    const q = sl(search);
    return cars.filter((c) => {
      const name = sl(getName(c));
      const year = String(getYear(c) ?? '');
      const priceStr = sl(formatCurrency(getPriceRaw(c)));
      return name.includes(q) || year.includes(search) || priceStr.includes(q);
    });
  }, [cars, search]);

  const copyCat = () => {
    const url = `${window.location.origin}/catalogo-loja/${lojaId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Copiado!', description: 'Link do catálogo' });
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {storeDetails?.logo_url ? (
              <img
                src={storeDetails.logo_url}
                alt="Logo da loja"
                className="w-14 h-14 rounded-full object-contain bg-slate-900 border border-slate-700 shadow-lg"
              />
            ) : (
              <div className="w-14 h-14 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-amber-400 font-bold text-2xl shadow-lg">
                {storeDetails?.nome?.[0] || 'Z'}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
                Catálogo{' '}
                <span className="text-amber-400">
                  {storeDetails?.nome || 'Zailon'}
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Gerencie seu estoque com visual premium em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={copyCat}
            className="px-5 py-3 bg-amber-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-400 transition flex items-center gap-2 text-sm font-semibold whitespace-nowrap"
          >
            <Feather.Link className="w-5 h-5" />
            Copiar link do catálogo
          </button>
        </div>

        {/* BUSCA */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-xl">
            <Feather.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <Input
              placeholder="Buscar por nome, ano ou preço"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/70 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:ring-0"
            />
          </div>
        </div>

        {/* LOADING */}
        {(isLoading || authLoad) && (
          <div className="text-center py-20">
            <Feather.Loader className="w-10 h-10 mx-auto animate-spin text-amber-400" />
            <p className="text-slate-400 mt-4">Carregando veículos...</p>
          </div>
        )}

        {/* GRID */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={fade}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((c) => {
            const title = getName(c) || 'Sem título';
            const year = getYear(c) || '—';
            const price = getPriceRaw(c);
            const desc = getDesc(c) || 'Sem descrição';
            const img0 =
              (getImages(c) as string[])?.[0] ||
              'https://placehold.co/600x400/020617/64748b?text=Sem+Foto';

            return (
              <motion.div
                key={(c as any).id}
                className="bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-[0_18px_45px_rgba(15,23,42,0.9)] hover:shadow-[0_22px_55px_rgba(15,23,42,1)] hover:border-amber-400/60 transition-all backdrop-blur"
                whileHover={{ y: -6 }}
              >
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400" />
                <div className="aspect-video bg-slate-900">
                  <img src={img0} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-50 text-lg leading-tight">
                        {title}
                      </h3>
                      <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                        <Feather.Calendar className="w-4 h-4" /> {year}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-amber-400 whitespace-nowrap">
                      {formatCurrency(price)}
                    </p>
                  </div>

                  <p className="text-sm text-slate-400 line-clamp-2">{desc}</p>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setCar(c)}
                      className="flex-1 py-2 border border-amber-400 text-amber-300 rounded-lg hover:bg-amber-400/10 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Feather.Eye className="w-4 h-4" /> Ver
                    </button>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/form-proposta/${(c as any).id}`;
                        navigator.clipboard.writeText(url);
                        toast({ title: 'Copiado!', description: 'Link do formulário' });
                      }}
                      className="p-2 border border-slate-700 rounded-lg hover:bg-slate-900"
                      title="Copiar link do formulário"
                    >
                      <Feather.Link className="w-4 h-4 text-slate-300" />
                    </button>
                    <button
                      onClick={() => confirm('Excluir este veículo?') && del.mutate((c as any).id)}
                      className="p-2 border border-slate-800 rounded-lg hover:bg-red-950/50"
                      title="Excluir"
                    >
                      <Feather.Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* VAZIO */}
        {filtered.length === 0 && !isLoading && !authLoad && (
          <div className="text-center py-20">
            <Feather.Truck className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Nenhum veículo encontrado</p>
          </div>
        )}

        {/* MODAL */}
        <Dialog open={!!car} onOpenChange={(o) => !o && setCar(null)}>
          <DialogContent className="max-w-6xl p-0 overflow-hidden rounded-2xl bg-slate-950 border border-slate-800">
            <DialogTitle className="sr-only">Detalhes do Veículo</DialogTitle>
            {car && <CarDetailsView vehicle={car} onBack={() => setCar(null)} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default VehicleCatalog;
