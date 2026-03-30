import { motion } from 'framer-motion';
import TaskItem from '@/components/TaskItem';
import { Task } from '@/types/xylon';

interface TasksPageProps {
  tasks: Task[];
  onComplete: (id: string) => void;
}

export default function TasksPage({ tasks, onComplete }: TasksPageProps) {
  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="pt-3">
          <h1 className="text-xl font-extrabold text-foreground">Minhas Tarefas</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pending.length} pendentes · {done.length} concluídas hoje
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3 max-w-lg mx-auto">
        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              ⚡ Pendentes
            </p>
            <div className="space-y-3">
              {pending.map(task => (
                <TaskItem key={task.id} task={task} onComplete={onComplete} />
              ))}
            </div>
          </div>
        )}

        {/* Done */}
        {done.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              ✅ Concluídas
            </p>
            <div className="space-y-3">
              {done.map(task => (
                <TaskItem key={task.id} task={task} onComplete={onComplete} />
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-4xl mb-3">📝</p>
            <p className="font-bold text-foreground">Sem tarefas ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Toca no + pra criar uma!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
