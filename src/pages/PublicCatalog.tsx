import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, SlidersHorizontal, X, Instagram, MessageCircle, MapPin, Clock, Phone, Mail, Globe, Facebook } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { VehiclePostCard } from '@/components/ui/VehiclePostCard';
import { Vehicle } from '@/data/vehicles';
import { fetchCarsByLojaId, fetchCarsByLojaSlug } from '@/services/api';
import type { LojaDetails } from '@/services/api';
import { useTenant } from '@/contexts/TenantContext';

const PublicCatalog = () => {
  const { lojaSlug } = useParams<{ lojaSlug: string }>();
  const { tenant, isPlatformHost } = useTenant();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loja, setLoja] = useState<LojaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const resolvedLoja = tenant;
    if (!resolvedLoja && !lojaSlug) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      try {
        const result = resolvedLoja
          ? { cars: await fetchCarsByLojaId(resolvedLoja.id), loja: resolvedLoja }
          : await fetchCarsByLojaSlug(lojaSlug!);
        const { cars, loja } = result;
        if (isPlatformHost && lojaSlug && loja.dominio) {
          window.location.replace(`https://${loja.dominio}`);
          return;
        }
        setLoja(loja);
        setVehicles(cars.map(car => ({
          id: car.id,
          name: car.nome || '',
          brand: car.marca || '',
          model: car.modelo || '',
          year: car.ano || new Date().getFullYear(),
          price: Number(car.preco) || 0,
          mileage: car.quilometragem || 0,
          fuel: car.combustivel || '',
          transmission: car.cambio || '',
          color: car.cor || '',
          description: car.descricao || '',
          features: [],
          images: car.imagens || [],
          stock: car.estoque || 1,
          status: (car.status as 'available' | 'reserved' | 'sold') || 'available',
          createdAt: car.created_at || new Date().toISOString(),
          views: 0,
          likes: 0,
        })));
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [isPlatformHost, lojaSlug, tenant]);

  const brands = useMemo(() => [...new Set(vehicles.map(v => v.brand).filter(Boolean))].sort(), [vehicles]);
  const years = useMemo(() => [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a), [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!vehicle.name.toLowerCase().includes(q) && !vehicle.brand.toLowerCase().includes(q) && !vehicle.model.toLowerCase().includes(q)) return false;
      }
      if (selectedBrand && vehicle.brand !== selectedBrand) return false;
      if (selectedYear && vehicle.year.toString() !== selectedYear) return false;
      if (minPrice && vehicle.price < minPrice) return false;
      if (maxPrice && vehicle.price > maxPrice) return false;
      return true;
    });
  }, [vehicles, searchQuery, selectedBrand, selectedYear, minPrice, maxPrice]);

  const hasActiveFilters = selectedBrand || selectedYear || minPrice > 0 || maxPrice > 0;
  const handleResetFilters = () => { setSelectedBrand(''); setSelectedYear(''); setMinPrice(0); setMaxPrice(0); setSearchQuery(''); };

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <img src="/favicon.ico" alt="" className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loja não encontrada</h2>
          <p className="text-muted-foreground mb-6">Verifique o link e tente novamente.</p>
          <Link to="/"><Button>Página inicial</Button></Link>
        </div>
      </div>
    );
  }

  const storeName = loja?.nome || 'Catálogo';
  const storeLogo = loja?.logo_url || '';
  const storeWhatsapp = loja?.whatsapp || loja?.telefone_principal || '';
  const rawWhatsappNumber = storeWhatsapp.replace(/\D/g, '');
  const whatsappNumber = rawWhatsappNumber.length >= 10 && rawWhatsappNumber.length <= 11
    ? `55${rawWhatsappNumber}`
    : rawWhatsappNumber;
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Visitei o catálogo da ${storeName} e gostaria de mais informações.`)}`
    : '#contato';
  const storeDescription = loja?.descricao || '';
  const loc = (loja?.localizacao || {}) as { endereco?: string; cidade?: string; estado?: string; cep?: string };
  const cityLine = [loc.cidade, loc.estado].filter(Boolean).join(' / ');
  const fullAddress = [loc.endereco, cityLine].filter(Boolean).join(' • ');
  const horario = loja?.horario_funcionamento as string | { descricao?: string; texto?: string } | null;
  const horarioText = typeof horario === 'string' ? horario : horario?.descricao || horario?.texto || '';
  const redes = (loja?.redes_sociais || {}) as { instagram?: string; facebook?: string };
  const instagramHandle = redes.instagram?.replace('@', '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '');
  const facebookUrl = redes.facebook?.startsWith('http') ? redes.facebook : redes.facebook ? `https://facebook.com/${redes.facebook}` : '';
  const mapsUrl = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : '';
  const phoneUrl = loja?.telefone_principal ? `tel:${loja.telefone_principal.replace(/\D/g, '')}` : '';

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Faixa superior */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-3 md:h-20">
            <a href="#empresa" className="flex min-w-0 items-center gap-3" aria-label={`Início - ${storeName}`}>
              <img
                src={storeLogo || '/favicon.ico'}
                alt={storeName}
                className="h-10 w-10 flex-shrink-0 rounded-xl border border-white/10 object-cover shadow-glow-md md:h-12 md:w-12"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white sm:text-base md:text-lg">{storeName}</p>
                {cityLine && (
                  <p className="hidden items-center gap-1 text-[10px] text-white/55 sm:flex">
                    <MapPin className="h-3 w-3" /> {cityLine}
                  </p>
                )}
              </div>
            </a>

            <nav className="hidden items-center gap-7 text-sm font-medium text-white/75 md:flex" aria-label="Navegação principal">
              <a href="#estoque" className="transition-colors hover:text-cyan-400">Estoque</a>
              <a href="#empresa" className="transition-colors hover:text-cyan-400">Empresa</a>
              <a href="#contato" className="transition-colors hover:text-cyan-400">Contato</a>
            </nav>

            <a
              href={whatsappUrl}
              target={whatsappNumber ? '_blank' : undefined}
              rel={whatsappNumber ? 'noopener noreferrer' : undefined}
              className="btn-primary-glow inline-flex h-10 flex-shrink-0 items-center gap-2 rounded-full px-3 text-xs font-bold text-slate-950 sm:px-5 sm:text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Fale no WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>

          <nav className="flex h-10 items-center justify-center gap-8 border-t border-white/5 text-xs font-medium text-white/70 md:hidden" aria-label="Navegação principal mobile">
            <a href="#estoque" className="transition-colors hover:text-cyan-400">Estoque</a>
            <a href="#empresa" className="transition-colors hover:text-cyan-400">Empresa</a>
            <a href="#contato" className="transition-colors hover:text-cyan-400">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero com vídeo */}
      <section id="empresa" className="relative flex min-h-[88svh] items-end overflow-hidden pt-28 md:min-h-screen md:pt-20">
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="Veículo premium com os faróis acendendo"
          >
            <source src="/Carro_parado_faróis_acendem_loop_202609021731.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pb-16 pt-24 md:pb-24 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-black/35 px-4 py-2 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Seleção premium</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-7xl">
              Seu próximo carro
              <span className="text-gradient block">começa aqui.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
              {storeDescription || 'Veículos selecionados, atendimento de confiança e as melhores oportunidades para você acelerar seus planos.'}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#estoque"
                className="btn-primary-glow inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-sm font-bold text-slate-950"
              >
                <Search className="h-5 w-5" />
                Explorar estoque
              </a>
              <a
                href={whatsappUrl}
                target={whatsappNumber ? '_blank' : undefined}
                rel={whatsappNumber ? 'noopener noreferrer' : undefined}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-black/25 px-7 text-sm font-semibold text-white backdrop-blur-md transition-all hover:border-cyan-400/60 hover:bg-black/45"
              >
                <MessageCircle className="h-5 w-5 text-emerald-400" />
                Falar com um consultor
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/65">
              <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Veículos selecionados</span>
              {cityLine && <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-cyan-400" /> {cityLine}</span>}
              {horarioText && <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-cyan-400" /> Atendimento personalizado</span>}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 opacity-50 blur-[120px] md:h-[400px] md:w-[800px]" />

        <div className="relative container mx-auto px-4 py-8 md:py-12">

          {/* Search & Filter Bar */}
          <motion.div
            id="estoque"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto scroll-mt-32"
          >
            <div className="relative flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por nome, marca ou modelo..."
                  className="input-premium w-full h-12 md:h-14 pl-12 pr-10 text-sm md:text-base rounded-xl" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`h-12 md:h-14 px-4 md:px-5 rounded-xl flex items-center gap-2 font-semibold transition-all flex-shrink-0 ${
                  showFilters || hasActiveFilters
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_-4px_rgba(34,211,238,0.6)]'
                    : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-500/60'
                }`}>
                <SlidersHorizontal className="w-5 h-5" />
                <span className="text-sm">Filtros</span>
                {hasActiveFilters && !showFilters && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-950 text-cyan-400 text-[10px] font-bold">
                    {(selectedBrand ? 1 : 0) + (selectedYear ? 1 : 0) + (minPrice > 0 || maxPrice > 0 ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Filters */}
            <motion.div initial={false} animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="glass-card rounded-2xl p-4 md:p-5 space-y-4">
                {brands.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Marca</label>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSelectedBrand('')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedBrand ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                        Todas
                      </button>
                      {brands.map(b => (
                        <button key={b} onClick={() => setSelectedBrand(b)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedBrand === b ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {years.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Ano</label>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setSelectedYear('')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedYear ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                        Todos
                      </button>
                      {years.map(y => (
                        <button key={y} onClick={() => setSelectedYear(y.toString())}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedYear === y.toString() ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">Faixa de Preço</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground mb-1 block">Mínimo</span>
                      <input type="number" value={minPrice || ''} onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)} placeholder="R$ 0" className="input-premium w-full h-10 text-sm" />
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground mb-1 block">Máximo</span>
                      <input type="number" value={maxPrice || ''} onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)} placeholder="Sem limite" className="input-premium w-full h-10 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button onClick={handleResetFilters} className="text-xs text-muted-foreground hover:text-cyan-400 transition-colors">Limpar filtros</button>
                  <button onClick={() => setShowFilters(false)} className="text-xs text-cyan-400 font-medium hover:text-cyan-300 transition-colors">Aplicar</button>
                </div>
              </div>
            </motion.div>

            {/* Active filter chips */}
            {hasActiveFilters && !showFilters && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-muted-foreground">Filtros:</span>
                {selectedBrand && <button onClick={() => setSelectedBrand('')} className="badge-premium flex items-center gap-1">{selectedBrand} <X className="w-3 h-3" /></button>}
                {selectedYear && <button onClick={() => setSelectedYear('')} className="badge-premium flex items-center gap-1">{selectedYear} <X className="w-3 h-3" /></button>}
                {(minPrice > 0 || maxPrice > 0) && <button onClick={() => { setMinPrice(0); setMaxPrice(0); }} className="badge-premium flex items-center gap-1">{minPrice > 0 ? formatPrice(minPrice) : 'R$ 0'} - {maxPrice > 0 ? formatPrice(maxPrice) : '∞'} <X className="w-3 h-3" /></button>}
                <button onClick={handleResetFilters} className="text-xs text-cyan-400 hover:text-cyan-300 underline">Limpar</button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>


      {/* Feed */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {isLoading ? (
          <div className="feed-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <Skeleton className="w-full aspect-square" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVehicles.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <p className="text-xs md:text-sm text-muted-foreground">
                {filteredVehicles.length} veículo{filteredVehicles.length !== 1 ? 's' : ''} encontrado{filteredVehicles.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="feed-grid">
              {filteredVehicles.map((vehicle, index) => (
                <VehiclePostCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  index={index}
                  linkPrefix={lojaSlug ? `/loja/${lojaSlug}` : undefined}
                />
              ))}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
              <img src="/favicon.ico" alt="" className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Nenhum veículo encontrado</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md px-4">
              {hasActiveFilters ? 'Tente ajustar seus filtros' : 'Nenhum veículo disponível no momento'}
            </p>
            {hasActiveFilters && <Button variant="outline" onClick={handleResetFilters}>Limpar filtros</Button>}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer id="contato" className="scroll-mt-32 border-t border-white/5 mt-8 md:mt-12">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="grid gap-6 md:grid-cols-3 md:items-start">
            <div className="flex items-center gap-3">
              <img src={storeLogo || '/favicon.ico'} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover" />
              <div>
                <p className="text-xs md:text-sm text-white font-medium">{storeName}</p>
                {cityLine && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {cityLine}</p>}
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              {fullAddress && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 transition-colors hover:text-cyan-400">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> {fullAddress}
                </a>
              )}
              {loja?.telefone_principal && (
                <a href={phoneUrl} className="flex items-center gap-2 transition-colors hover:text-cyan-400">
                  <Phone className="h-3.5 w-3.5" /> {loja.telefone_principal}
                </a>
              )}
              {loja?.email && (
                <a href={`mailto:${loja.email}`} className="flex items-center gap-2 break-all transition-colors hover:text-cyan-400">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" /> {loja.email}
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground md:justify-end">
              {instagramHandle && (
                <a href={`https://instagram.com/${instagramHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-cyan-400">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              )}
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-cyan-400">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              )}
              {loja?.site && (
                <a href={loja.site.startsWith('http') ? loja.site : `https://${loja.site}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-cyan-400">
                  <Globe className="h-4 w-4" /> Site
                </a>
              )}
              <span className="w-full text-muted-foreground/50 md:text-right">Powered by Falcon</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicCatalog;
