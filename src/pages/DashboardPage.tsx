import { motion } from 'framer-motion';
import { UserStats } from '@/types/zailon';
import { useRanking } from '@/hooks/useRanking';
import { useWeekExecutions } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useNavigate } from 'react-router-dom';

interface DashboardPageProps {
  stats: UserStats;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function DashboardPage({ stats }: DashboardPageProps) {
  const { data: ranking = [] } = useRanking();
  const { data: weekData = [] } = useWeekExecutions();
  const { data: goals = [] } = useGoals();
  const navigate = useNavigate();

  const xpToNext = (stats.level * 100) - stats.xpTotal;
  const progress = ((stats.xpTotal % 100) / 100) * 100;
  const completionPct = stats.tasksCompleted > 0
    ? Math.round((stats.tasksCompleted / Math.max(stats.tasksCompleted + 1, 1)) * 100)
    : 0;

  const maxWeekCount = Math.max(...weekData.map(d => d.count), 1);

  const isEmoji = (s: string) => s.length <= 4 && /\p{Emoji}/u.test(s);

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="pt-3">
          <h1 className="text-xl font-extrabold text-foreground">Dashboard</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Nível" value={stats.level.toString()} color="bg-level/15" />
          <StatCard label="XP Total" value={stats.xpTotal.toLocaleString()} color="bg-xp/15" />
          <StatCard label="Streak" value={`${stats.streak}d`} color="bg-streak/15" />
          <StatCard label="Pontos" value={stats.pontos.toString()} color="bg-cta/10" />
          <StatCard label="Essência" value={stats.essence.toString()} color="bg-clan/15" />
          <StatCard label="Tarefas Hoje" value={stats.tasksCompleted.toString()} color="bg-xp/15" />
        </div>

        {/* Level progress */}
        <div className="bg-card rounded-xl p-4 card-shadow border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">Nível {stats.level}</span>
            <span className="text-xs text-muted-foreground">{xpToNext > 0 ? `${xpToNext} XP pro próximo` : 'MAX'}</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="h-full gradient-hero rounded-full" />
          </div>
        </div>

        {/* Completion circle */}
        <div className="bg-card rounded-xl p-4 card-shadow border border-border flex items-center gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0-31.831"
                fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0-31.831"
                fill="none" stroke="hsl(var(--cta-orange))" strokeWidth="3"
                strokeDasharray={`${completionPct}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-foreground">
              {completionPct}%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Progresso de Hoje</p>
            <p className="text-xs text-muted-foreground">{stats.tasksCompleted} tarefas concluídas</p>
          </div>
        </div>

        {/* Weekly heatmap */}
        <div className="bg-card rounded-xl p-4 card-shadow border border-border">
          <p className="text-sm font-bold text-foreground mb-3">Últimos 7 dias</p>
          <div className="flex gap-1.5">
            {weekData.map((day, i) => {
              const d = new Date(day.data + 'T12:00:00');
              const dayLabel = WEEKDAYS[d.getDay()];
              const intensity = day.count / maxWeekCount;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold text-foreground"
                    style={{
                      backgroundColor: day.count > 0
                        ? `hsl(153 56% 78% / ${0.2 + intensity * 0.8})`
                        : 'hsl(var(--secondary))',
                    }}>
                    {day.count}
                  </div>
                  <span className="text-[9px] font-semibold text-muted-foreground">{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal progress */}
        {goals.length > 0 && (
          <div className="bg-card rounded-xl p-4 card-shadow border border-border">
            <p className="text-sm font-bold text-foreground mb-3">Progresso dos Objetivos</p>
            <div className="space-y-3">
              {goals.slice(0, 5).map(goal => (
                <div key={goal.id} className="flex items-center gap-3">
                  <span className="text-lg">{goal.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{goal.titulo}</p>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                      <div className="h-full gradient-hero rounded-full" style={{ width: `${goal.progresso}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">{goal.progresso}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real ranking */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Ranking Global
          </h2>
          <div className="space-y-2">
            {ranking.slice(0, 10).map((user, i) => (
              <motion.div key={user.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => navigate(`/u/${user.username || user.id}`)}
                className="flex items-center gap-3 bg-card rounded-xl p-3 card-shadow border border-border cursor-pointer hover:border-cta/20 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                  i === 0 ? 'gradient-badge text-navy' : i === 1 ? 'bg-secondary text-foreground' : i === 2 ? 'bg-streak/20 text-streak' : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-lg overflow-hidden">
                  {isEmoji(user.avatar_url) ? user.avatar_url : user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : '🦁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{user.nome}</p>
                  <p className="text-[11px] text-muted-foreground">🔥 {user.streak}d · Nível {user.level}</p>
                </div>
                <span className="text-sm font-extrabold text-cta">{user.xp.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className={`${color} rounded-xl p-3 flex flex-col items-center gap-1 border border-border`}>
      <span className="text-lg font-extrabold text-foreground">{value}</span>
      <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
    </motion.div>
  );
}
