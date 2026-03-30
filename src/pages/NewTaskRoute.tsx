import BottomNav from '@/components/BottomNav';
import NewTaskPage from '@/pages/NewTaskPage';

export default function NewTaskRoute() {
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <NewTaskPage />
      <BottomNav />
    </div>
  );
}
