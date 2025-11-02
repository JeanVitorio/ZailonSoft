import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import * as Feather from 'react-feather';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/auth/AuthContext';

// --- Dados do Menu (segmento dentro de /sistema/) ---
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Feather.BarChart2, path: 'dashboard' },
  { id: 'catalog', label: 'Catálogo', icon: Feather.Truck, path: 'catalog' },
  { id: 'crm', label: 'CRM', icon: Feather.Users, path: 'crm' },
  { id: 'add-vehicle', label: 'Novo Veículo', icon: Feather.Plus, path: 'add-vehicle' },
  { id: 'help', label: 'Ajuda / Como Usar', icon: Feather.HelpCircle, path: 'help' },
  { id: 'settings', label: 'Configurações', icon: Feather.Settings, path: 'settings' },
];

// --- Marca (logo + nome) reutilizável ---
function BrandMark({
  logoSrc,
  companyName = 'ZailonSoft',
  subtitle = 'CRM Automotivo',
  size = 40,
  compact = false,
}: {
  logoSrc?: string;
  companyName?: string;
  subtitle?: string;
  size?: number;
  compact?: boolean;
}) {
  // fallback para o favicon real do sistema
  const resolvedLogo = logoSrc || '/favicon.ico';

  return (
    <div className="flex items-center gap-3">
      <div
        className="rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-white"
        style={{ width: size, height: size }}
      >
        <img
          src={resolvedLogo}
          alt={`${companyName} logo`}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="leading-tight">
        <h1 className="text-lg md:text-xl font-bold text-zinc-900">
          {companyName.replace(/(Soft)$/i, '')}
          <span className="text-amber-500">{companyName.match(/(Soft)$/i) ? 'Soft' : ''}</span>
        </h1>
        {!compact && <p className="text-xs md:text-sm text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}

// --- Conteúdo do Menu (compartilhado) ---
function MenuContent({ closeMenu }: { closeMenu?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/');
  const lastSegment = pathParts.at(-1) || 'dashboard';
  const activeItem = menuItems.find((item) => item.path === lastSegment);
  const activeTab = activeItem ? activeItem.id : 'dashboard';

  const handleLogout = async () => {
    try {
      await logout();
      if (closeMenu) closeMenu();
      navigate('/login');
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
                const navigationPath = `/sistema/${item.path}`;
                navigate(navigationPath);
                if (closeMenu) closeMenu();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                'hover:bg-amber-500/10 hover:border-amber-400/50',
                isCurrentActive
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50 font-semibold'
                  : 'text-zinc-700 border border-transparent font-medium'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isCurrentActive ? 'text-white' : 'text-amber-500'
                )}
              />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

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

// --- Sidebar (Desktop) ---
function MainSidebar({
  logoSrc,
  companyName,
}: {
  logoSrc?: string;
  companyName?: string;
}) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-zinc-200 shadow-xl hidden md:flex flex-col z-40">
      <div className="p-6 border-b border-zinc-100 flex-shrink-0">
        <BrandMark logoSrc={logoSrc} companyName={companyName} />
      </div>
      <ScrollArea className="flex-1">
        <MenuContent />
      </ScrollArea>
    </aside>
  );
}

// --- Top Bar Mobile + Sidebar móvel ---
function MobileSidebar({
  logoSrc,
  companyName,
}: {
  logoSrc?: string;
  companyName?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  // usa favicon como fallback
  const resolvedLogo = logoSrc || '/favicon.ico';

  return (
    <>
      {/* Top Bar fixa no mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        <div className="mx-3 my-3 rounded-2xl bg-white/90 backdrop-blur border border-zinc-200 shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <BrandMark logoSrc={resolvedLogo} companyName={companyName} compact />
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-amber-600 hover:bg-zinc-100 hover:border-amber-400/50 transition-all shadow-sm"
                aria-label="Abrir menu"
              >
                {/* Ícone real (favicon) ao lado do hambúrguer */}
                <div className="w-6 h-6 rounded-md overflow-hidden bg-white border border-amber-200 flex items-center justify-center">
                  <img
                    src={resolvedLogo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <Feather.Menu className="h-5 w-5" />
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-4/5 max-w-[300px] h-full p-0 bg-white border-r border-zinc-200 flex flex-col z-50"
                overlayClassName="bg-black/60"
              >
                <SheetTitle className="sr-only">Menu Principal</SheetTitle>
                <SheetDescription className="sr-only">
                  Navegue pelas seções do sistema.
                </SheetDescription>

                {/* Cabeçalho do menu com logo real */}
                <div className="flex items-center gap-3 p-6 border-b border-zinc-100 flex-shrink-0">
                  <BrandMark logoSrc={resolvedLogo} companyName={companyName} />
                </div>

                <ScrollArea className="flex-1">
                  <MenuContent closeMenu={closeMenu} />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Spacer para não cobrir o conteúdo pelo top bar mobile */}
      <div className="md:hidden h-[72px]" />
    </>
  );
}

// --- Exportação principal ---
export function Sidebar({
  logoSrc, // opcional — se não vier, usamos /favicon.ico
  companyName = 'ZailonSoft',
}: {
  logoSrc?: string;
  companyName?: string;
}) {
  const resolvedLogo = logoSrc || '/favicon.ico';

  return (
    <>
      <MainSidebar logoSrc={resolvedLogo} companyName={companyName} />
      <MobileSidebar logoSrc={resolvedLogo} companyName={companyName} />
    </>
  );
}

export default Sidebar;
