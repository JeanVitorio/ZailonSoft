import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import * as Feather from 'react-feather';
import { motion } from 'framer-motion';
// Importar Title e Description
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/auth/AuthContext'; // Assumindo que este hook está correto

// --- Dados do Menu (Path é o segmento da rota DENTRO de /sistema/) ---
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Feather.BarChart2, path: 'dashboard' },
  { id: 'catalog', label: 'Catálogo', icon: Feather.Truck, path: 'catalog' },
  { id: 'crm', label: 'CRM', icon: Feather.Users, path: 'crm' },
  { id: 'add-vehicle', label: 'Novo Veículo', icon: Feather.Plus, path: 'add-vehicle' },
  { id: 'settings', label: 'Configurações', icon: Feather.Settings, path: 'settings' },
];

// --- Componente de Conteúdo do Menu (Compartilhado) ---
function MenuContent({ closeMenu }: { closeMenu?: () => void; }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Deriva a aba ativa da URL
  // O último segmento da URL (ex: "catalog" em "/sistema/catalog")
  const pathParts = location.pathname.split('/');
  const lastSegment = pathParts.at(-1) || 'dashboard'; 
  
  // Encontra o item ativo pelo path
  const activeItem = menuItems.find(item => item.path === lastSegment);
  const activeTab = activeItem ? activeItem.id : 'dashboard'; 

  const handleLogout = async () => {
    try {
      await logout();
      if (closeMenu) closeMenu();
      navigate('/login'); // Redireciona para a página de login após o logout
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isCurrentActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => {
                // CORREÇÃO ESSENCIAL: O caminho base agora é /sistema/{path}
                const navigationPath = `/sistema/${item.path}`;
                navigate(navigationPath);
                if (closeMenu) closeMenu();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                "hover:bg-amber-500/10 hover:border-amber-400/50",
                isCurrentActive
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50 font-semibold"
                  : "text-zinc-700 border border-transparent font-medium"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={cn("w-5 h-5 transition-colors", isCurrentActive ? "text-white" : "text-amber-500")} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Botão Sair/Logout */}
      <motion.button
        className="w-full flex items-center justify-start gap-3 px-4 py-3 mt-4 text-zinc-700 hover:bg-zinc-100 transition-all rounded-xl"
        onClick={handleLogout}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Feather.LogOut className="w-5 h-5 text-zinc-500" />
        <span className="font-medium">Sair</span>
      </motion.button>
    </div>
  );
}

// --- Sidebar Principal (Desktop) ---
function MainSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-zinc-200 shadow-xl hidden md:flex flex-col z-40">
      {/* Área do Logo/Título */}
      <div className="p-6 border-b border-zinc-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
            <Feather.BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900">
              Zailon<span className="text-amber-500">Soft</span>
            </h1>
            <p className="text-sm text-zinc-500">CRM Automotivo</p>
          </div>
        </div>
      </div>
      {/* Conteúdo do Menu com Scroll */}
      <ScrollArea className="flex-1">
        <MenuContent />
      </ScrollArea>
    </aside>
  );
}

// --- Sidebar do Menu Mobile ---
function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <div className="md:hidden fixed top-4 left-4 z-50">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* Botão de Trigger */}
        <SheetTrigger
          className="p-3 rounded-xl border border-zinc-200 bg-white text-amber-500 hover:bg-zinc-100 hover:border-amber-400/50 transition-all shadow-md"
        >
          <Feather.Menu className="h-6 w-6" />
        </SheetTrigger>

        {/* Conteúdo da Sidebar Móvel */}
        <SheetContent
          side="left"
          className="w-4/5 max-w-[280px] h-full p-0 bg-white border-r border-zinc-200 flex flex-col z-50"
          overlayClassName="bg-black/60"
        >
          <SheetTitle className="sr-only">Menu Principal</SheetTitle>
          <SheetDescription className="sr-only">Navegue pelas seções do sistema.</SheetDescription>

          {/* Área do Logo/Título dentro do Sheet */}
          <div className="flex items-center gap-3 p-6 border-b border-zinc-100 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md">
              <Feather.BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">
                Zailon<span className="text-amber-500">Soft</span>
              </h1>
              <p className="text-sm text-zinc-500">CRM Automotivo</p>
            </div>
          </div>
          {/* Conteúdo do Menu com Scroll */}
          <ScrollArea className="flex-1">
            <MenuContent closeMenu={closeMenu} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// --- Componente de Exportação Principal ---
export function Sidebar() {
  return (
    <>
      <MainSidebar />
      <MobileSidebar />
    </>
  );
}