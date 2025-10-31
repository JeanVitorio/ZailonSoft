import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';

// --- CORREÇÃO APLICADA AQUI: Lazy Loading de Componentes Nomeados (Exports com {}) ---
// Componentes que DEVEM estar em src/components/
const Dashboard = lazy(() => import('@/components/Dashboard').then(module => ({ default: module.Dashboard })));
const VehicleCatalog = lazy(() => import('@/components/VehicleCatalog').then(module => ({ default: module.VehicleCatalog })));
const CRMKanban = lazy(() => import('@/components/CRMKanban').then(module => ({ default: module.CRMKanban })));
const AddVehicle = lazy(() => import('@/components/AddVehicle').then(module => ({ default: module.AddVehicle })));
// Componente que DEVE estar em src/pages/
const StoreSettingsPage = lazy(() => import('@/pages/StoreSettingsPage').then(module => ({ default: module.StoreSettingsPage })));

// --- Componentes de Fundo (Seu Código Original) ---
const LightDotsBackground = () => {
    const [dots, setDots] = useState([]);
    // Código LightDotsBackground... (sem alteração)
    React.useEffect(() => {
        const generateDots = () => {
            const newDots = Array.from({ length: 70 }).map(() => ({
                id: Math.random(),
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 8 + 8}s`,
                animationDelay: `${Math.random() * 8}s`,
                size: `${Math.random() * 2 + 1}px`,
                opacity: `${Math.random() * 0.4 + 0.3}`,
            }));
            setDots(newDots);
        };
        generateDots();
    }, []);

    return (
        <>
            <style>
                {`
                @keyframes move-dots {
                    from { transform: translateY(0px); }
                    to { transform: translateY(-1500px); }
                }
                .light-dot {
                    animation: move-dots linear infinite;
                    position: absolute;
                    background-color: #a1a1aa;
                    border-radius: 50%;
                    z-index: -20;
                }
                `}
            </style>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                {dots.map(dot => (
                    <div
                        key={dot.id}
                        className="light-dot"
                        style={{
                            top: dot.top,
                            left: dot.left,
                            animationDuration: dot.animationDuration,
                            animationDelay: dot.animationDelay,
                            width: dot.size,
                            height: dot.size,
                            opacity: dot.opacity,
                        }}
                    />
                ))}
            </div>
        </>
    );
};
const AnimatedBackground = () => (
    <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fef3c740,transparent)]"></div>
    </div>
);


// --- Layout Principal (Mantido) ---
const MainLayout = () => {
    const location = useLocation();
    const contentVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    };

    return (
        <div className="min-h-screen bg-white text-zinc-800 font-poppins relative overflow-x-hidden">
            <LightDotsBackground />
            <AnimatedBackground />

            <Sidebar />

            <main className="md:ml-64 p-4 md:p-8 mt-16 md:mt-0 relative z-10">
                <motion.div
                    key={location.pathname}
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Suspense fallback={<div className="p-6">Carregando...</div>}>
                        <Outlet />
                    </Suspense>
                </motion.div>
            </main>
        </div>
    );
};


// --- Index: O componente que gerencia as Rotas Filhas ---
const Index = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>

                {/* Rota Padrão: /sistema -> redireciona para /sistema/dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />

                {/* ROTAS PRINCIPAIS */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="catalog" element={<VehicleCatalog />} />
                <Route path="crm" element={<CRMKanban />} />

                {/* ROTAS DE FORMULÁRIO */}
                <Route path="add-vehicle" element={<AddVehicle />} />
                
                {/* ROTA DE CONFIGURAÇÕES (em src/pages/) */}
                <Route path="settings" element={<StoreSettingsPage />} />

                {/* Rota 'Catch-all' */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
        </Routes>
    );
};

export default Index;