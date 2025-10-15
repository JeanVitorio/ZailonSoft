import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { VehicleCatalog } from '@/components/VehicleCatalog';
import { CRMKanban } from '@/components/CRMKanban';
import AddClient from '@/components/AddClient';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { AddVehicle } from '@/components/AddVehicle';
import { StoreSettingsPage } from '@/pages/StoreSettingsPage';

// Componente para pontos de luz animados
const LightDotsBackground = () => {
  const [dots, setDots] = useState([]);

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

// Componente para o fundo animado
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
    <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:14px_24px]"></div>
    <div className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full bg-[radial-gradient(circle_400px_at_50%_300px,#fef3c740,transparent)]"></div>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'catalog':
        return <VehicleCatalog />;
      case 'crm':
        return <CRMKanban />;
      case 'add-client':
        return <AddClient />;
      case 'whatsapp':
        return <WhatsAppConnection />;
      case 'add-vehicle':
        return <AddVehicle />;
      case 'settings':
        return <StoreSettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-white text-zinc-800 font-poppins relative overflow-x-hidden">
      <LightDotsBackground />
      <AnimatedBackground />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="md:ml-64 p-4 md:p-8 mt-16 md:mt-0 relative z-10">
        <motion.div
          key={activeTab}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;