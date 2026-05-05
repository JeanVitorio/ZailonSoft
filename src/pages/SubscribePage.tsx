import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MessageCircle, LogOut, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const SUPPORT_PHONE = '5546991163405';
const SUPPORT_DISPLAY = '(46) 99116-3405';

const SubscribePage = () => {
  const { logout, user } = useAuth();
  const waUrl = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(
    `Olá! Preciso liberar meu acesso ao NILO (${user?.email || ''}).`,
  )}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-3xl p-6 md:p-8 text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-amber-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Acesso pendente</span>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Seu acesso ainda não está liberado
        </h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Para liberar (ou renovar) o uso do sistema NILO, fale comigo direto no WhatsApp.
          Eu confirmo o pagamento e libero seu acesso na hora.
        </p>

        {user?.email && (
          <div className="p-3 rounded-xl bg-muted/30 mb-6">
            <p className="text-xs text-muted-foreground">Conta</p>
            <p className="text-foreground font-medium truncate">{user.email}</p>
          </div>
        )}

        <div className="space-y-3">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="premium" size="lg" className="w-full">
              <MessageCircle className="w-5 h-5" />
              Falar com a equipe no WhatsApp
            </Button>
          </a>
          <a href={`tel:+${SUPPORT_PHONE}`} className="block">
            <Button variant="outline" size="lg" className="w-full">
              <Phone className="w-4 h-4" /> {SUPPORT_DISPLAY}
            </Button>
          </a>

          <Button variant="ghost" size="lg" className="w-full" onClick={logout}>
            <LogOut className="w-4 h-4" /> Sair da conta
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscribePage;
