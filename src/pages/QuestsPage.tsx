import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Search, Edit3, Trash2, ChevronRight, Sparkles } from 'lucide-react';
import { useGoals, useCreateGoal } from '@/hooks/useGoals';
import { useTasks } from '@/hooks/useTasks';
import { Goal } from '@/types/zailon';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface QuestsPageProps {
  onNavigateTemplates: () => void;
}

export default function QuestsPage({ onNavigateTemplates }: QuestsPageProps) {
  const { data: goals = [] } = useGoals();
  const { data: tasks = [] } = useTasks();
  const createGoal = useCreateGoal();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎯');
  const [newDuration, setNewDuration] = useState('30');
  const [newDurationType, setNewDurationType] = useState<'days' | 'months' | 'years'>('days');

  const filtered = goals.filter(g =>
    g.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const getTaskCount = (goalId: string) => tasks.filter(t => t.goal_id === goalId).length;

  const getDaysInfo = (goal: Goal) => {
    const created = new Date(goal.created_at);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - created.getTime()) / 86400000);
    if (goal.data_alvo) {
      const target = new Date(goal.data_alvo);
      const daysLeft = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 86400000));
      return { daysPassed, daysLeft, targetDate: target };
    }
    return { daysPassed, daysLeft: null, targetDate: null };
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const multiplier = newDurationType === 'years' ? 365 : newDurationType === 'months' ? 30 : 1;
    const totalDays = parseInt(newDuration) * multiplier;
    const dataAlvo = new Date();
    dataAlvo.setDate(dataAlvo.getDate() + totalDays);

    try {
      await createGoal.mutateAsync({
        titulo: newTitle.trim(),
        descricao: newDesc.trim(),
        emoji: newEmoji,
        visibilidade: 'private',
      });
      toast.success('Objetivo criado!');
      setShowCreate(false);
      setNewTitle(''); setNewDesc(''); setNewEmoji('🎯');
    } catch { toast.error('Erro ao criar objetivo'); }
  };

  const EMOJIS = ['🎯', '💪', '🧠', '📚', '💰', '🏃', '🥗', '😴', '⏰', '🧘', '🌍', '✨', '🔥', '🧊', '🤝', '⚡'];

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center justify-between pt-3">
          <h1 className="text-xl font-extrabold text-foreground">Objetivos</h1>
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={onNavigateTemplates}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-level/15 text-xs font-bold text-level">
              <Sparkles className="w-3.5 h-3.5" /> Modelos
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCreate(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full gradient-cta text-xs font-bold text-accent-foreground">
              <Plus className="w-3.5 h-3.5" /> Novo
            </motion.button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-card border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar objetivos..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none" />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3 max-w-lg mx-auto">
        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-2xl p-4 border border-border card-shadow space-y-3 overflow-hidden">
              <p className="text-sm font-bold text-foreground">Novo Objetivo</p>
              <div className="flex gap-2 flex-wrap">
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${newEmoji === e ? 'bg-cta/20 ring-2 ring-cta' : 'bg-secondary'}`}>
                    {e}
                  </button>
                ))}
              </div>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Nome do objetivo"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cta/30" />
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descrição..." rows={2}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none" />
              <div className="flex gap-2">
                <input type="number" value={newDuration} onChange={e => setNewDuration(e.target.value)} min="1"
                  className="w-20 px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-none" />
                {(['days', 'months', 'years'] as const).map(t => (
                  <button key={t} onClick={() => setNewDurationType(t)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold ${newDurationType === t ? 'gradient-cta text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    {t === 'days' ? 'Dias' : t === 'months' ? 'Meses' : 'Anos'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-secondary text-muted-foreground text-xs font-bold">Cancelar</button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate} disabled={!newTitle.trim()}
                  className="flex-1 py-2.5 rounded-xl gradient-cta text-accent-foreground text-xs font-bold disabled:opacity-40">Criar</motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals list */}
        {filtered.map((goal, i) => {
          const { daysPassed, daysLeft } = getDaysInfo(goal);
          const taskCount = getTaskCount(goal.id);
          return (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 border border-border card-shadow">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-level/15 flex items-center justify-center text-2xl shrink-0">
                  {goal.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-foreground truncate">{goal.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{goal.descricao}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-bold">
                    <span className="text-xp">{daysPassed}d ativos</span>
                    {daysLeft !== null && <span className="text-streak">{daysLeft}d restantes</span>}
                    <span className="text-muted-foreground">{taskCount} tarefas</span>
                    <span className={`px-2 py-0.5 rounded-full ${goal.status === 'achieved' ? 'bg-xp/20 text-navy' : 'bg-cta/10 text-cta'}`}>
                      {goal.status === 'achieved' ? 'Concluído' : 'Ativo'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full gradient-hero rounded-full transition-all" style={{ width: `${goal.progresso}%` }} />
                  </div>
                </div>
                <button onClick={() => navigate(`/tasks?goal=${goal.id}`)} className="p-1 shrink-0">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && !showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="font-bold text-foreground mt-3">Sem objetivos ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Crie um objetivo ou explore os modelos prontos</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
