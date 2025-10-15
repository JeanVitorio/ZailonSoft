import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import * as Feather from 'react-feather';
// Você precisará garantir que estas importações e funções existam
import { fetchCarsByLojaId, Car } from '@/services/api'; 

// Funções Auxiliares (duplicadas ou importadas)
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


export function PublicVehicleCatalogPage() {
    const { lojaId } = useParams<{ lojaId: string }>();

    // fetchCarsByLojaId deve ser implementada em services/api.ts para buscar veículos pelo lojaId
    const { data: vehicles = [], isLoading, error } = useQuery<Car[]>({
        queryKey: ['publicVehicles', lojaId],
        queryFn: () => fetchCarsByLojaId(lojaId!), 
        enabled: !!lojaId,
    });

    if (isLoading) return <div className="text-center py-20 text-zinc-600">Carregando catálogo da loja...</div>;
    if (error || (vehicles.length === 0 && !isLoading)) return (
        <div className="text-center py-20 bg-white/80 p-6 rounded-lg m-8 border border-zinc-200 max-w-lg mx-auto shadow-lg">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Catálogo Não Encontrado ou Vazio</h1>
            <p className="text-zinc-600">O ID da loja é inválido, ou esta loja não possui veículos cadastrados.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 p-4 md:p-8 space-y-8">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-amber-600 mb-2">Catálogo Oficial da Loja</h1>
                <p className="text-xl text-zinc-700">Explore os veículos disponíveis e envie sua proposta para análise.</p>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{ visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            >
                {vehicles.map((vehicle) => (
                    <motion.div key={vehicle.id} variants={fadeInUp}>
                        <Link to={`/form-proposta/${vehicle.id}`}>
                            <div className="overflow-hidden bg-white rounded-lg shadow-xl border border-zinc-200 hover:shadow-amber-500/30 transition-all group">
                                <div className="aspect-video overflow-hidden bg-zinc-100">
                                    <img 
                                        src={vehicle.imagens?.[0] || 'https://placehold.co/400x300/e4e4e7/3f3f46?text=Sem+Imagem'}
                                        alt={vehicle.nome}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x300/e4e4e7/3f3f46?text=Sem+Imagem'; }}
                                    />
                                </div>
                                <div className="p-6 space-y-3">
                                    <h3 className="text-2xl font-bold text-zinc-900 group-hover:text-amber-600 transition-colors">{vehicle.nome}</h3>
                                    <p className="text-3xl font-extrabold text-amber-500">{formatCurrency(vehicle.preco)}</p>
                                    <p className="text-sm text-zinc-600 line-clamp-2">{vehicle.descricao}</p>
                                    <div className="pt-2 text-center">
                                        <button className="w-full py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all">
                                            <Feather.FileText className="w-4 h-4 mr-2 inline" /> Enviar Proposta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export default PublicVehicleCatalogPage;