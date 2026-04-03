import { useState } from 'react';
import { Home, ListTodo, Plus, Target, Trophy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/hooks/useProfile';

const navItems = [
  { icon: Home, label: 'Feed', path: '/' },
  { icon: ListTodo, label: 'Tarefas', path: '/tasks' },
  { icon: Plus, label: 'Criar', path: '', isSpecial: true },
  { icon: Target, label: 'Objetivos', path: '/quests' },
  { icon: Trophy, label: 'Ranking', path: '/dashboard' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isEmoji = (s: string) => s.length <= 4 && /\p{Emoji}/u.test(s);
  const avatarUrl = profile?.avatar_url || '';

  return (
    <>
      {/* Profile avatar top-right */}
      <button
        onClick={() => navigate('/profile')}
        className="fixed top-[calc(env(safe-area-inset-top)+12px)] right-4 z-50 w-11 h-11 rounded-full overflow-hidden border-2 border-primary/30 bg-card shadow-lg flex items-center justify-center hover-lift group"
      >
        {avatarUrl && !isEmoji(avatarUrl) ? (
          <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg">{isEmoji(avatarUrl) ? avatarUrl : '👤'}</span>
        )}
        <div className="absolute inset-0 rounded-full border border-primary/0 group-hover:border-primary/40 transition-colors" />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card-strong">
        <div className="flex items-center justify-around px-2 py-2.5 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            if (item.isSpecial) {
              return (
                <button key="create" onClick={() => setShowCreateModal(true)} className="relative -mt-7">
                  <motion.div whileTap={{ scale: 0.85, rotate: 90 }}
                    className="w-14 h-14 rounded-2xl gradient-cta flex items-center justify-center shadow-xl shadow-accent/30 relative overflow-hidden">
                    <Icon className="w-7 h-7 text-accent-foreground relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/15" />
                  </motion.div>
                </button>
              );
            }

            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 px-4 py-1 relative">
                {isActive && (
                  <motion.div layoutId="nav-indicator"
                    className="absolute -top-2.5 w-10 h-1 rounded-full bg-gradient-to-r from-primary to-primary/60"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-md flex items-end justify-center"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg glass-card-strong rounded-t-3xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-3"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-extrabold text-foreground text-center">O que você quer criar?</h2>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => { setShowCreateModal(false); navigate('/new-task'); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-accent/5 border border-accent/15 hover:border-accent/30 transition-all hover-lift"
              >
                <div className="w-13 h-13 rounded-xl gradient-cta flex items-center justify-center shadow-lg shadow-accent/20">
                  <ListTodo className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-foreground">Nova Tarefa</p>
                  <p className="text-xs text-muted-foreground">Crie uma tarefa diária, semanal ou única</p>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => { setShowCreateModal(false); navigate('/quests/new'); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-level/5 border border-level/15 hover:border-level/30 transition-all hover-lift"
              >
                <div className="w-13 h-13 rounded-xl gradient-purple flex items-center justify-center shadow-lg shadow-level/20">
                  <Target className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-foreground">Novo Objetivo</p>
                  <p className="text-xs text-muted-foreground">Defina uma meta e conquiste com consistência</p>
                </div>
              </motion.button>

              <button
                onClick={() => setShowCreateModal(false)}
                className="w-full py-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
