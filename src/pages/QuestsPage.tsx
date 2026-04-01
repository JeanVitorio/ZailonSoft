import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Search, ChevronRight, Sparkles } from 'lucide-react';
import { useGoals, useCreateGoal } from '@/hooks/useGoals';
import { useTasks } from '@/hooks/useTasks';
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
  const [openGoalId, setOpenGoalId] = useState<string | null>(null);

  const toggleGoal = (id: string) => {
    setOpenGoalId(prev => (prev === id ? null : id));
  };

  const filtered = goals.filter(g =>
    g.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const getTaskCount = (goalId: string) =>
    tasks.filter(t => t.goal_id === goalId).length;

  return (
    <div className="pb-24">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-3 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold">Objetivos</h1>

          <div className="flex gap-2">
            <button onClick={onNavigateTemplates}
              className="px-3 py-1.5 rounded-full bg-level/15 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            <button className="px-3 py-1.5 rounded-full gradient-cta text-xs font-bold">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-card border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {/* LISTA */}
      <div className="px-4 pt-4 space-y-3 max-w-lg mx-auto">
        {filtered.map((goal, i) => {
          const isOpen = openGoalId === goal.id;
          const goalTasks = tasks.filter(t => t.goal_id === goal.id);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggleGoal(goal.id)}
              className="bg-card rounded-2xl p-4 border border-border cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-level/15 flex items-center justify-center text-2xl">
                  {goal.emoji}
                </div>

                <div className="flex-1">
                  <p className="font-extrabold text-sm">{goal.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {goal.descricao}
                  </p>

                  <div className="text-[10px] mt-2">
                    {goalTasks.length} tarefas
                  </div>
                </div>

                {/* SETINHA (SEM NAVEGAÇÃO) */}
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
              </div>

              {/* TASKS */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
                    {goalTasks.map(task => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tasks?goal=${goal.id}&task=${task.id}`);
                        }}
                        className="p-3 rounded-xl bg-secondary border border-border cursor-pointer active:scale-[0.98] transition"
                      >
                        <p className="text-sm font-bold">
                          {task.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.descricao}
                        </p>
                      </div>
                    ))}

                    {goalTasks.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Nenhuma tarefa ainda
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="mt-3 font-bold">Sem objetivos</p>
          </div>
        )}
      </div>
    </div>
  );
}