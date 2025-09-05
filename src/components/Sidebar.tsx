import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    Car, 
    Users, 
    UserPlus, 
    MessageSquare, 
    Plus,
    BarChart3,
    Menu,
    Settings, // NOVO ÍCONE
    LogOut    // NOVO ÍCONE
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/auth/AuthContext'; // IMPORTAÇÃO PARA AUTENTICAÇÃO

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog', label: 'Catálogo', icon: Car },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'add-client', label: 'Novo Cliente', icon: UserPlus },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'add-vehicle', label: 'Novo Veículo', icon: Plus },
    { id: 'settings', label: 'Configurações', icon: Settings }, // NOVO ITEM DE MENU
];

function MenuContent({ activeTab, onTabChange, closeMenu }: { activeTab: string; onTabChange: (tab: string) => void; closeMenu?: () => void; }) {
    const { signOut } = useAuth(); // Pega a função de logout do contexto

    return (
        <div className="flex flex-col justify-between h-full p-4">
            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                onTabChange(item.id);
                                if (closeMenu) closeMenu();
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                                "hover:bg-secondary hover:shadow-sm",
                                activeTab === item.id
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
            <Button variant="ghost" className="w-full justify-start gap-3 mt-4" onClick={signOut}>
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
            </Button>
        </div>
    );
}

function MainSidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-lg hidden md:flex flex-col">
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">ZailonSoft</h1>
                        <p className="text-sm text-muted-foreground">CRM Automotivo</p>
                    </div>
                </div>
            </div>
            <MenuContent activeTab={activeTab} onTabChange={onTabChange} />
        </aside>
    );
}

function MobileSidebar({ activeTab, onTabChange }: SidebarProps) {
    const [open, setOpen] = useState(false);
    const closeMenu = () => setOpen(false);

    return (
        <div className="fixed top-0 left-0 p-4 md:hidden z-50">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
                    <div className="flex items-center gap-3 p-6 border-b border-border">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">ZailonSoft</h1>
                            <p className="text-sm text-muted-foreground">CRM Automotivo</p>
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
