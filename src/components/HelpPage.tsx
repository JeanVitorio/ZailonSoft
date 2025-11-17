// app/help/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { HelpCircle, Search, X } from 'lucide-react';
import { helpVideos, HelpVideo } from '@/components/data/helpVideos';
import { VideoShelf } from '@/components/help/VideoShelf';
import { VideoModal } from '@/components/help/VideoModal';
import { cn } from '@/lib/utils';

export default function HelpPage() {
  const [selectedVideo, setSelectedVideo] = useState<HelpVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  const categories = useMemo(() => {
    const set = new Set<string>(helpVideos.map((v) => v.category));
    return ['Todas', ...Array.from(set)];
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredVideos = useMemo(() => {
    const byCategory =
      activeCategory === 'Todas'
        ? helpVideos
        : helpVideos.filter((v) => v.category === activeCategory);

    if (!normalizedQuery) return byCategory;

    return byCategory.filter((v) => {
      const hay = `${v.title} ${v.description ?? ''} ${v.category}`.toLowerCase();
      return hay.includes(normalizedQuery);
    });
  }, [activeCategory, normalizedQuery]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, HelpVideo[]>();
    filteredVideos.forEach((v) => {
      const key = v.category;
      map.set(key, [...(map.get(key) || []), v]);
    });
    // Mantém ordem dos chips
    const order = categories.filter((c) => c !== 'Todas');
    return order.map((c) => ({ category: c, videos: map.get(c) || [] }));
  }, [filteredVideos, categories]);

  const handleVideoClick = (video: HelpVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const getRelatedVideos = (current: HelpVideo) =>
    helpVideos
      .filter((v) => v.category === current.category && v.id !== current.id)
      .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-950 font-poppins">
      {/* HERO */}
      <section className="relative flex items-center justify-center overflow-hidden h-[42vh] min-h-72 max-h-[420px]">
        {/* Gradientes com tema Emerald */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/50 via-transparent to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_10%,rgba(16,185,129,0.12)_0%,transparent_70%)]" />
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 mb-4">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" aria-hidden="true" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-50 leading-tight">
            Central de Ajuda
          </h1>
          <p className="mt-3 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Tutoriais e guias completos para você dominar o sistema
          </p>
        </div>
      </section>

      {/* CONTROLES (Busca + Filtros) */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="max-w-6xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            {/* Busca */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                aria-label="Buscar vídeo de ajuda"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-100 placeholder:text-slate-500"
                placeholder="Buscar por título, descrição ou categoria..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-700"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Filtros (chips) */}
            <div className="flex overflow-x-auto gap-2 pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-3 py-2 rounded-full text-sm border transition-colors whitespace-nowrap',
                    activeCategory === cat
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow' // Ativo
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-700' // Inativo
                  )}
                  aria-pressed={activeCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SHELVES */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-20">
          {/* Estado vazio */}
          {groupedByCategory.every((g) => g.videos.length === 0) ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
              <p className="text-lg font-semibold text-slate-100">Nada encontrado</p>
              <p className="text-sm text-slate-400 mt-1">
                Ajuste os filtros ou tente outros termos de busca.
              </p>
            </div>
          ) : (
            groupedByCategory.map(({ category, videos }) =>
              videos.length ? (
                <VideoShelf
                  key={category}
                  title={category}
                  videos={videos}
                  onVideoClick={handleVideoClick}
                />
              ) : null
            )
          )}
        </div>
      </section>

      {/* MODAL */}
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relatedVideos={selectedVideo ? getRelatedVideos(selectedVideo) : []}
        onVideoClick={handleVideoClick}
      />
    </div>
  );
}