import BottomNav from '@/components/BottomNav';
import TasksPageComponent from '@/pages/TasksPage';
import { useTasks, useTodayExecutions, useCompleteTask, useUncompleteTask } from '@/hooks/useTasks';
import { Task } from '@/types/zailon';
import { toast } from 'sonner';

export default function TasksRoute() {
  const { data: tasks = [] } = useTasks();
  const { data: executions = [] } = useTodayExecutions();
  const completeTask = useCompleteTask();
  const uncompleteTask = useUncompleteTask();

  const handleComplete = async (task: Task) => {
    try {
      const result = await completeTask.mutateAsync(task);
      toast.success(`+${result.xpEarned} XP! Tarefa concluída! 🎉`);
    } catch {
      toast.error('Erro ao completar tarefa');
    }
  };

  const handleUncomplete = async (task: Task) => {
    try {
      await uncompleteTask.mutateAsync(task.id);
      toast.success('Tarefa desmarcada');
    } catch {
      toast.error('Erro ao desmarcar tarefa');
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <TasksPageComponent tasks={tasks} executions={executions} onComplete={handleComplete} onUncomplete={handleUncomplete} />
      <BottomNav />
    </div>
  );
}
