import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { VehicleCatalog } from '@/components/VehicleCatalog';
import { CRMKanban } from '@/components/CRMKanban';
import { AddClient } from '@/components/AddClient';
import { WhatsAppConnection } from '@/components/WhatsAppConnection';
import { AddVehicle } from '@/components/AddVehicle';
import { StoreSettingsPage } from '@/pages/StoreSettingsPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-poppins">
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 text-amber-400 focus:outline-none"
        aria-label="Alternar Sidebar"
      >
        {isSidebarOpen ? (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <Sidebar activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} />
      </div>

      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}

      <main className="md:ml-64 p-4 md:p-8 mt-16 md:mt-0">
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