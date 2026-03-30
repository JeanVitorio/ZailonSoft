import { useXylonStore } from '@/store/useXylonStore';
import BottomNav from '@/components/BottomNav';
import NewTaskPage from '@/pages/NewTaskPage';

export default function NewTaskRoute() {
  const { addTask } = useXylonStore();

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <NewTaskPage onAdd={addTask} />
      <BottomNav />
    </div>
  );
}
