import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Trash2,
  Pencil,
  ChevronDown,
  Plus,
  Target,
  Calendar,
  Sparkles,
} from 'lucide-react';

import { useGoals } from '@/hooks/useGoals';
import { useTasks } from '@/hooks/useTasks';
import { useDeleteGoal } from '@/hooks/useDeleteGoal';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { useUpdateGoal } from '@/hooks/useUpdateGoal';

const DEFAULT_GOAL_COLOR = '#00c853';

export default function QuestsPage() {
  const navigate = useNavigate();
  const { data: goals = [] } = useGoals();
  const { data: tasks = [] } = useTasks();
  const deleteGoal = useDeleteGoal();
  const deleteTask = useDeleteTask();
  const updateGoal = useUpdateGoal();
  const [openGoalId, setOpenGoalId] = useState<string | null>(null);

  const tasksByGoal = (goalId: string) =>
    tasks.filter(t => t.goal_id === goalId);

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Excluir objetivo e todas tarefas?')) return;
    await deleteGoal.mutateAsync(goalId);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Excluir tarefa?')) return;
    await deleteTask.mutateAsync(taskId);
  };

  const handleToggleStatus = async (goal: any) => {
    await updateGoal.mutateAsync({
      id: goal.id,
      status: goal.status === 'achieved' ? 'active' : 'achieved',
    });
  };

  const getDaysRemaining = (dataAlvo: string | null) => {
    if (!dataAlvo) return null;
    const diff = Math.ceil((new Date(dataAlvo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="w-full min-h-[100dvh] bg-background max-w-lg mx-auto flex flex-col">
      {/* HEADER */}
      <div className="sticky top-0 z-40 glass-card-strong px-4 pt-[env(safe-area-inset-top)] pb-4">
        <div className="flex items-center justify-between pt-3">
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">Objetivos</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{goals.length} objetivo{goals.length !== 1 ? 's' : ''} ativo{goals.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/quests/templates')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card text-xs font-bold text-foreground hover:bg-secondary/80 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-level" />
              Modelos
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/quests/new')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-cta text-accent-foreground text-xs font-bold shadow-lg shadow-accent/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Criar
            </motion.button>
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4 space-y-4">
        {goals.map((goal, idx) => {
          const goalTasks = tasksByGoal(goal.id);
          const isOpen = openGoalId === goal.id;
          const daysLeft = getDaysRemaining(goal.data_alvo);
          const cardColor = goal.card_color || DEFAULT_GOAL_COLOR;
          const cardImage = goal.card_image_url;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl overflow-hidden border border-border/50 card-shadow-lg hover-lift"
            >
              {/* Card Hero */}
              <div
                className="relative h-32 overflow-hidden cursor-pointer"
                onClick={() => setOpenGoalId(prev => (prev === goal.id ? null : goal.id))}
                style={{ backgroundColor: cardColor }}
              >
                {cardImage ? (
                  <img src={cardImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" style={{
                    background: `linear-gradient(145deg, ${cardColor}, ${adjustBrightness(cardColor, 30)})`
                  }}>
                    <div className="absolute inset-0 opacity-[0.03]"
                      style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                <div className="absolute top-3 right-3 flex gap-1.5">
                  {goal.status === 'achieved' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/90 text-[10px] font-bold text-primary-foreground backdrop-blur-sm">✓ Concluído</span>
                  )}
                  {daysLeft !== null && daysLeft > 0 && (
                    <span className="flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      <Calendar className="w-3 h-3" /> {daysLeft}d
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl drop-shadow-lg">{goal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-extrabold text-base truncate drop-shadow-lg">{goal.titulo}</p>
                      <p className="text-white/60 text-[11px] font-medium">{goalTasks.length} tarefas · {goal.progresso}% concluído</p>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown className="w-5 h-5 text-white/60" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progresso}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                  className="h-full gradient-hero"
                />
              </div>

              {/* Actions */}
              <div className="bg-card px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleToggleStatus(goal)}>
                    <CheckCircle2 className={`w-5 h-5 transition-colors ${goal.status === 'achieved' ? 'text-primary' : 'hover:text-primary'}`} />
                  </motion.button>
                  <button onClick={() => navigate(`/goals/edit/${goal.id}`)} className="hover:text-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteGoal(goal.id)} className="hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => navigate(`/new-task?goalId=${goal.id}`)}
                  className="text-[11px] font-bold text-accent flex items-center gap-1 hover:text-accent/80 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Tarefa
                </button>
              </div>

              {/* Expanded tasks */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden bg-card/50 border-t border-border/50"
                  >
                    <div className="p-4 space-y-2">
                      {goalTasks.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Nenhuma tarefa ainda — adicione para começar
                        </p>
                      )}
                      {goalTasks.map(task => (
                        <motion.div
                          key={task.id}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: task.card_color || DEFAULT_GOAL_COLOR }} />
                            <p className="text-sm font-semibold text-foreground truncate">{task.titulo}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-muted-foreground font-medium">{task.horario}</span>
                            <button onClick={() => navigate(`/tasks/edit/${task.id}`)} className="text-muted-foreground hover:text-foreground transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Target className="w-16 h-16 text-muted-foreground/20 mx-auto mb-5" />
            </motion.div>
            <p className="font-black text-foreground text-xl">Sem objetivos ainda</p>
            <p className="text-sm text-muted-foreground mt-2 mb-8">Defina metas e conquiste com consistência</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/quests/new')}
              className="px-8 py-3.5 rounded-2xl gradient-cta text-accent-foreground font-bold text-sm shadow-xl shadow-accent/20"
            >
              Criar Primeiro Objetivo
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function adjustBrightness(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xFF) + amount);
    const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
    const b = Math.min(255, (num & 0xFF) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  } catch {
    return hex;
  }
}
