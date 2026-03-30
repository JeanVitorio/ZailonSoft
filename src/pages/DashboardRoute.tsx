import BottomNav from '@/components/BottomNav';
import DashboardPage from '@/pages/DashboardPage';
import { useProfile } from '@/hooks/useProfile';

export default function DashboardRoute() {
  const { data: profile } = useProfile();

  const stats = profile ? {
    xpTotal: profile.xp,
    streak: profile.streak,
    tasksCompleted: 0,
    essence: profile.essencia,
    level: profile.level,
    pontos: profile.pontos,
  } : { xpTotal: 0, streak: 0, tasksCompleted: 0, essence: 0, level: 1, pontos: 0 };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <DashboardPage stats={stats} />
      <BottomNav />
    </div>
  );
}
