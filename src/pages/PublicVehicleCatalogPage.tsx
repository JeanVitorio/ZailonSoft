// src/pages/PublicVehicleCatalogPage.tsx
// (Versão completa e corrigida)

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';

// --- [IMPORTAÇÕES CORRIGIDAS] ---
import { 
    fetchCarsByLojaId, 
    fetchLojaDetails,
    Car,
    LojaDetails // Importa a nova interface
} from '@/services/api'; 
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
// --- [FIM DAS IMPORTAÇÕES] ---


// --- [FUNÇÕES AUXILIARES] ---
const parsePrice = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (!value || typeof value !== 'string') return 0;
    const cleaned = String(value).replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
};
const formatCurrency = (value: string | number): string => {
    const number = parsePrice(value);
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};
const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } } };

// --- [COMPONENTE: O DIALOG DE DETALHES] ---
function PublicCarDetailsView({ vehicle, onBack }: { vehicle: Car; onBack: () => void }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const currentImages = vehicle.imagens || [];

    const navigateGallery = (direction: number) => {
        if (!currentImages.length) return;
        const newIndex = (currentImageIndex + direction + currentImages.length) % currentImages.length;
        setCurrentImageIndex(newIndex);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-zinc-900">{vehicle.nome}</h1>
                <motion.button
                    className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 transition-all"
                    onClick={onBack}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Feather.X className="w-4 h-4 mr-2 inline" /> Fechar
                </motion.button>
            </div>
            
            <div className="bg-white/70 p-6 rounded-lg border border-zinc-200 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Galeria de Imagens */}
                    <div className="space-y-4">
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200">
                            {currentImages.length > 0 ? (
                                <img src={currentImages[currentImageIndex]} alt="Imagem principal" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-600">Sem imagem</div>
                            )}
                            {currentImages.length > 1 && (
                                <>
                                    <motion.button
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full border border-zinc-200 text-amber-500 hover:bg-zinc-100"
                                        onClick={() => navigateGallery(-1)}
                                    >
                                        <Feather.ChevronLeft className="w-5 h-5" />
                                    </motion.button>
                                    <motion.button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full border border-zinc-200 text-amber-500 hover:bg-zinc-100"
                                        onClick={() => navigateGallery(1)}
                                    >
                                        <Feather.ChevronRight className="w-5 h-5" />
                                    </motion.button>
                                </>
                            )}
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {currentImages.map((img, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={img}
                                        onClick={() => setCurrentImageIndex(index)}
                                        alt={`Thumbnail ${index + 1}`}
                                        className={`w-full aspect-square object-cover rounded-md cursor-pointer border-2 ${currentImageIndex === index ? 'border-amber-500' : 'border-transparent'}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Informações */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-zinc-800 font-medium">Preço</p>
                                <p className="text-2xl font-bold text-amber-500">{formatCurrency(vehicle.preco || 0)}</p>
                            </div>
                            <div>
                                <p className="text-zinc-800 font-medium">Ano</p>
                                <p className="font-semibold text-zinc-800 text-2xl">{vehicle.ano}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-zinc-800 font-medium">Descrição</p>
                            <p className="text-zinc-600 whitespace-pre-wrap">{vehicle.descricao || 'Nenhuma descrição.'}</p>
                        </div>
                        <div className="pt-4">
                            <Link to={`/form-proposta/${vehicle.id}`}>
                                <motion.button
                                    className="w-full px-4 py-3 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Feather.FileText className="w-4 h-4 mr-2 inline" /> Enviar Proposta
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
// --- [FIM DO COMPONENTE DIALOG] ---


// --- [COMPONENTE PRINCIPAL DA PÁGINA] ---
export function PublicVehicleCatalogPage() {
    const { lojaId } = useParams<{ lojaId: string }>();

    // --- [NOVOS ESTADOS] ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    // --- [FIM DOS NOVOS ESTADOS] ---

    // Query para buscar os veículos
    const { data: vehicles = [], isLoading: isLoadingVehicles, error: errorVehicles } = useQuery<Car[]>({
        queryKey: ['publicVehicles', lojaId],
        queryFn: () => fetchCarsByLojaId(lojaId!), 
        enabled: !!lojaId,
    });

    // --- [QUERY CORRIGIDA] ---
    // Query para buscar os dados da loja (nome, logo)
    const { data: lojaData, isLoading: isLoadingLoja } = useQuery<LojaDetails>({ // Usa a interface 'LojaDetails'
        queryKey: ['lojaDetails', lojaId],
        queryFn: () => fetchLojaDetails(lojaId!),
        enabled: !!lojaId,
    });
    // --- [FIM DA QUERY CORRIGIDA] ---

    // --- [LÓGICA DE FILTRO] ---
    const filteredVehicles = useMemo(() => {
        const term = searchTerm.toLowerCase();
        if (!term) return vehicles;

        return vehicles.filter(vehicle =>
            vehicle.nome.toLowerCase().includes(term) ||
            vehicle.ano.toString().includes(term) ||
            formatCurrency(vehicle.preco).replace("R$", "").trim().includes(term)
        );
    }, [vehicles, searchTerm]);
    // --- [FIM DA LÓGICA DE FILTRO] ---

    const isLoading = isLoadingVehicles || isLoadingLoja;

    if (isLoading) return <div className="text-center py-20 text-zinc-600">Carregando catálogo da loja...</div>;
    
    if (errorVehicles || (vehicles.length === 0 && !isLoadingVehicles)) return (
        <div className="text-center py-20 bg-white/80 p-6 rounded-lg m-8 border border-zinc-200 max-w-lg mx-auto shadow-lg">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Catálogo Não Encontrado ou Vazio</h1>
            <p className="text-zinc-600">O ID da loja é inválido, ou esta loja não possui veículos cadastrados.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 p-4 md:p-8 space-y-8">
            {/* --- [CABEÇALHO CORRIGIDO] --- */}
            <motion.div 
                initial="hidden" 
                animate="visible" 
                variants={fadeInUp} 
                className="max-w-7xl mx-auto flex items-center gap-4"
            >
                {lojaData?.logo_url && (
                    <img 
                        src={lojaData.logo_url} 
                        alt={`Logo ${lojaData.nome}`} // <-- CORRIGIDO
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                    />
                )}
                <div>
                    <h1 className="text-4xl font-extrabold text-amber-600 mb-2">
                        Catálogo {lojaData?.nome || '...'} {/* <-- CORRIGIDO */}
                    </h1>
                    <p className="text-xl text-zinc-700">Explore os veículos disponíveis e envie sua proposta.</p>
                </div>
            </motion.div>
            {/* --- [FIM DO CABEÇALHO] --- */}

            {/* --- [BARRA DE PESQUISA] --- */}
            <motion.div
                className="relative max-w-md mx-auto"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
            >
                <Feather.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-600 w-4 h-4" />
                <Input
                    placeholder="Buscar por nome, ano ou valor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                />
            </motion.div>
            {/* --- [FIM DA BARRA DE PESQUISA] --- */}

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{ visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            >
                {/* --- [CARDS ATUALIZADOS] --- */}
                {filteredVehicles.map((vehicle) => (
                    <motion.div 
                        key={vehicle.id} 
                        variants={fadeInUp}
                        className="overflow-hidden bg-white rounded-lg shadow-xl border border-zinc-200 hover:border-amber-400/50 transition-all group"
                    >
                        <div className="aspect-video overflow-hidden bg-zinc-100">
                            <img 
                                src={vehicle.imagens?.[0] || 'https://placehold.co/400x300/e4e4e7/3f3f46?text=Sem+Imagem'}
                                alt={vehicle.nome}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x300/e4e4e7/3f3f46?text=Sem+Imagem'; }}
                            />
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900">{vehicle.nome}</h3>
                                    <p className="text-sm text-zinc-600 mt-1 flex items-center gap-1">
                                        <Feather.Calendar className="w-4 h-4" /> {vehicle.ano}
                                    </p>
                                </div>
                                <div className="text-2xl font-bold text-amber-500">{formatCurrency(vehicle.preco)}</div>
                            </div>
                            <p className="text-sm text-zinc-600 line-clamp-2">{vehicle.descricao}</p>
                            <div className="flex gap-2 pt-2">
                                <motion.button
                                    className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
                                    onClick={() => setSelectedCar(vehicle)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Feather.Eye className="w-4 h-4 mr-2 inline" /> Ver Detalhes
                                </motion.button>
                                <Link to={`/form-proposta/${vehicle.id}`} className="flex-1">
                                    <motion.button
                                        className="w-full px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Feather.FileText className="w-4 h-4 mr-2 inline" /> Proposta
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
            
            {/* Mensagem de "Nenhum veículo encontrado" */}
            {filteredVehicles.length === 0 && !isLoading && (
                <motion.div
                    className="text-center py-12"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                >
                    <div className="w-24 h-24 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                        <Feather.Search className="w-12 h-12 text-zinc-600" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">Nenhum veículo encontrado</h3>
                    <p className="text-zinc-600">Tente ajustar sua busca ou verifique mais tarde.</p>
                </motion.div>
            )}

            {/* --- [DIALOG] --- */}
            <Dialog open={!!selectedCar} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedCar(null); } }}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white/70 border border-zinc-200 overflow-y-auto">
                    {selectedCar && (
                        <div className="p-6">
                            <PublicCarDetailsView vehicle={selectedCar} onBack={() => setSelectedCar(null)} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* --- [FIM DO DIALOG] --- */}
        </div>
    );
}

export default PublicVehicleCatalogPage;