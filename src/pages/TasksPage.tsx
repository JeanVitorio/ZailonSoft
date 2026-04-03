import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import TaskItem from '@/components/TaskItem';
import OverdueTaskAlert from '@/components/OverdueTaskAlert';

import { Task, TaskExecution } from '@/types/zailon';
import { filterTodayTasks, getTaskTimeStatus } from '@/hooks/useTasks';

interface TasksPageProps {
  tasks: Task[];
  executions: TaskExecution[];
  onComplete: (task: Task) => void;
  onUncomplete?: (task: Task) => void;
}

export default function TasksPage({ tasks, executions, onComplete, onUncomplete }: TasksPageProps) {
  const [search, setSearch] = useState('');
  const [dismissedOverdue, setDismissedOverdue] = useState<Set<string>>(new Set());

  const [params] = useSearchParams();
  const taskId = params.get('task');

  const completedIds = new Set(executions.filter(e => e.concluido).map(e => e.task_id));
  const todayTasks = filterTodayTasks(tasks);

  const filtered = search.trim()
    ? todayTasks.filter(t => t.titulo.toLowerCase().includes(search.toLowerCase()))
    : todayTasks;

  const pending = filtered.filter(t => !completedIds.has(t.id));
  const done = filtered.filter(t => completedIds.has(t.id));

  // Sort pending: overdue (longest first), then upcoming by time
  const sortedPending = [...pending].sort((a, b) => {
    const sa = getTaskTimeStatus(a);
    const sb = getTaskTimeStatus(b);
    // Overdue first, sorted by most overdue
    if (sa.status === 'overdue' && sb.status !== 'overdue') return -1;
    if (sa.status !== 'overdue' && sb.status === 'overdue') return 1;
    if (sa.status === 'overdue' && sb.status === 'overdue') return sb.minutesDiff - sa.minutesDiff;
    // Then by time
    const [ah, am] = a.horario.split(':').map(Number);
    const [bh, bm] = b.horario.split(':').map(Number);
    return (ah * 60 + am) - (bh * 60 + bm);
  });

  // Get all overdue tasks for alerts (sorted by most overdue first)
  const overdueTasks = sortedPending.filter(t => {
    const status = getTaskTimeStatus(t);
    return status.status === 'overdue' && !dismissedOverdue.has(t.id);
  });
  const topOverdue = overdueTasks[0];
  const topOverdueStatus = topOverdue ? getTaskTimeStatus(topOverdue) : null;

  useEffect(() => {
    if (taskId) {
      const el = document.getElementById(`task-${taskId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-cta');
        setTimeout(() => el.classList.remove('ring-2', 'ring-cta'), 2000);
      }
    }
  }, [taskId, tasks]);

  return (
    <div className="pb-24">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="pt-3">
          <h1 className="text-xl font-extrabold text-foreground">Tarefas de Hoje</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pending.length} pendentes · {done.length} concluídas
          </p>
        </div>
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-card border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar tarefas..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="pt-4 max-w-lg mx-auto">
        {/* Overdue alert */}
        <AnimatePresence>
          {topOverdue && topOverdueStatus && (
            <OverdueTaskAlert
              task={topOverdue}
              minutesLate={topOverdueStatus.minutesDiff}
              onComplete={onComplete}
              onDismiss={() => setDismissedOverdue(prev => new Set(prev).add(topOverdue.id))}
            />
          )}
        </AnimatePresence>

        <div className="px-4 space-y-3">
          {/* Pending */}
          {sortedPending.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Pendentes</p>
              <div className="space-y-3">
                {sortedPending.map(task => (
                  <div key={task.id} id={`task-${task.id}`}>
                    <TaskItem task={task} isCompleted={false} onComplete={onComplete}
                      timeStatus={getTaskTimeStatus(task)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          {done.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">✅ Concluídas</p>
              <div className="space-y-3">
                {done.map(task => (
                  <div key={task.id} id={`task-${task.id}`}>
                    <TaskItem task={task} isCompleted={true} onComplete={onUncomplete || onComplete} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {todayTasks.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-bold text-foreground">Nenhuma tarefa para hoje</p>
              <p className="text-sm text-muted-foreground mt-1">Crie tarefas ou importe um modelo pronto</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}