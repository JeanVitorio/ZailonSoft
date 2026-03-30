import BottomNav from '@/components/BottomNav';
import TasksPageComponent from '@/pages/TasksPage';
import { useTasks, useTodayExecutions, useCompleteTask } from '@/hooks/useTasks';
import { Task } from '@/types/zailon';
import { toast } from 'sonner';

export default function TasksRoute() {
  const { data: tasks = [] } = useTasks();
  const { data: executions = [] } = useTodayExecutions();
  const completeTask = useCompleteTask();

  const handleComplete = async (task: Task) => {
    try {
      const result = await completeTask.mutateAsync(task);
      toast.success(`+${result.xpEarned} XP! Tarefa concluída! 🎉`);
    } catch {
      toast.error('Erro ao completar tarefa');
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <TasksPageComponent tasks={tasks} executions={executions} onComplete={handleComplete} />
      <BottomNav />
    </div>
  );
}
