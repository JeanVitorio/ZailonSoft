import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MessageCircle, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const SubscribePage = () => {
  const { logout, user, subscription } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 text-center"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-10 h-10 text-amber-400" />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-red-400">Assinatura Pendente</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Sua assinatura não está ativa
        </h1>
        <p className="text-muted-foreground mb-8">
          Para continuar usando o sistema, é necessário regularizar sua assinatura. 
          Entre em contato conosco pelo WhatsApp para resolver.
        </p>

        {/* User info */}
        {user?.email && (
          <div className="p-3 rounded-xl bg-white/[0.02] mb-6">
            <p className="text-sm text-muted-foreground">Logado como</p>
            <p className="text-white font-medium">{user.email}</p>
            {subscription?.status && (
              <p className="text-xs text-red-400 mt-1">Status: {subscription.status}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <a href="https://wa.me/5546991163405?text=Olá, preciso regularizar minha assinatura do AutoConnect" target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="premium" size="lg" className="w-full">
              <MessageCircle className="w-5 h-5" />
              Regularizar via WhatsApp
            </Button>
          </a>

          <Button variant="outline" size="lg" className="w-full" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Sair da conta
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscribePage;
