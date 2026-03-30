import { useXylonStore } from '@/store/useXylonStore';
import BottomNav from '@/components/BottomNav';
import TasksPageComponent from '@/pages/TasksPage';

export default function TasksRoute() {
  const { tasks, completeTask } = useXylonStore();

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <TasksPageComponent tasks={tasks} onComplete={completeTask} />
      <BottomNav />
    </div>
  );
}
