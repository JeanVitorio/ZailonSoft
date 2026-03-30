import { useXylonStore } from '@/store/useXylonStore';
import BottomNav from '@/components/BottomNav';
import DashboardPage from '@/pages/DashboardPage';

export default function DashboardRoute() {
  const { stats } = useXylonStore();

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <DashboardPage stats={stats} />
      <BottomNav />
    </div>
  );
}
