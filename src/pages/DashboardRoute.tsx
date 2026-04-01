import BottomNav from '@/components/BottomNav';
import DashboardPage from '@/pages/DashboardPage';
import { useProfile } from '@/hooks/useProfile';
import { useTasks, useTodayExecutions, filterTodayTasks } from '@/hooks/useTasks';

export default function DashboardRoute() {
  const { data: profile } = useProfile();
  const { data: tasks = [] } = useTasks();
  const { data: executions = [] } = useTodayExecutions();

  const todayTasks = filterTodayTasks(tasks);
  const completedToday = executions.filter(e => e.concluido).length;

  const stats = profile ? {
    xpTotal: profile.xp,
    streak: profile.streak,
    tasksCompleted: completedToday,
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
