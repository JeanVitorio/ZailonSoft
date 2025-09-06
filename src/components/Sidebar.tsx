import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import * as Feather from 'react-feather';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/auth/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Feather.BarChart2 },
  { id: 'catalog', label: 'Catálogo', icon: Feather.Truck },
  { id: 'crm', label: 'CRM', icon: Feather.Users },
  { id: 'add-client', label: 'Novo Cliente', icon: Feather.UserPlus },
  { id: 'whatsapp', label: 'WhatsApp', icon: Feather.MessageSquare },
  { id: 'add-vehicle', label: 'Novo Veículo', icon: Feather.Plus },
  { id: 'settings', label: 'Configurações', icon: Feather.Settings },
];

function MenuContent({ activeTab, onTabChange, closeMenu }: { activeTab: string; onTabChange: (tab: string) => void; closeMenu?: () => void; }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      console.log('Tentando fazer logout...');
      await logout();
      console.log('Logout bem-sucedido');
      if (closeMenu) closeMenu();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (closeMenu) closeMenu();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                "hover:bg-zinc-100 hover:border-amber-400/50 hover:shadow-sm",
                activeTab === item.id
                  ? "bg-amber-500 text-white shadow-md"
                  : "text-zinc-800 border border-transparent"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-amber-500")} />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>
      <motion.button
        className="w-full flex items-center justify-start gap-3 px-4 py-3 mt-4 text-zinc-800 hover:bg-zinc-100 hover:border-amber-400/50 transition-all rounded-lg"
        onClick={handleLogout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Feather.LogOut className="w-5 h-5 text-amber-500" />
        <span className="font-medium">Sair</span>
      </motion.button>
    </div>
  );
}

function MainSidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-zinc-200 shadow-sm hidden md:flex flex-col z-40">
      <div className="p-6 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <Feather.BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Zailon<span className="text-amber-500">Soft</span>
            </h1>
            <p className="text-sm text-zinc-600">CRM Automotivo</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <MenuContent activeTab={activeTab} onTabChange={onTabChange} />
      </ScrollArea>
    </aside>
  );
}

function MobileSidebar({ activeTab, onTabChange }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <div className="md:hidden fixed top-4 left-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <motion.button
            className="p-2 rounded-lg border border-zinc-200 bg-white text-amber-500 hover:bg-zinc-100 hover:border-amber-400/50 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Feather.Menu className="h-6 w-6" />
          </motion.button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-4/5 max-w-[280px] h-full p-0 bg-white border-r border-zinc-200 flex flex-col z-50"
          overlayClassName="bg-black/60"
        >
          <div className="flex items-center gap-3 p-6 border-b border-zinc-200">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Feather.BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">
                Zailon<span className="text-amber-500">Soft</span>
              </h1>
              <p className="text-sm text-zinc-600">CRM Automotivo</p>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <MenuContent activeTab={activeTab} onTabChange={onTabChange} closeMenu={closeMenu} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <>
      <MainSidebar activeTab={activeTab} onTabChange={onTabChange} />
      <MobileSidebar activeTab={activeTab} onTabChange={onTabChange} />
    </>
  );
}