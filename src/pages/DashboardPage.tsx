import { motion } from 'framer-motion';
import { UserStats } from '@/types/zailon';
import { useRanking } from '@/hooks/useRanking';
import { useWeekExecutions } from '@/hooks/useTasks';
import { useGoals } from '@/hooks/useGoals';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, Zap, Crown, Star, Target } from 'lucide-react';

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

  const statCards = [
    { label: 'Nível', value: stats.level.toString(), icon: Crown, gradient: 'from-level/20 to-level/5', iconColor: 'text-level' },
    { label: 'XP Total', value: stats.xpTotal.toLocaleString(), icon: Zap, gradient: 'from-primary/20 to-primary/5', iconColor: 'text-primary' },
    { label: 'Streak', value: `${stats.streak}d`, icon: Flame, gradient: 'from-streak/20 to-streak/5', iconColor: 'text-streak' },
    { label: 'Pontos', value: stats.pontos.toString(), icon: Star, gradient: 'from-accent/15 to-accent/5', iconColor: 'text-accent' },
    { label: 'Essência', value: stats.essence.toString(), icon: Target, gradient: 'from-clan/20 to-clan/5', iconColor: 'text-clan' },
    { label: 'Hoje', value: stats.tasksCompleted.toString(), icon: TrendingUp, gradient: 'from-primary/20 to-primary/5', iconColor: 'text-primary' },
  ];

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 glass-card-strong px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="pt-3">
          <h1 className="text-xl font-black tracking-tight text-foreground">Dashboard</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-3.5 flex flex-col items-center gap-1.5 border border-border/50 hover-lift`}
            >
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              <span className="text-lg font-black text-foreground">{card.value}</span>
              <span className="text-[10px] font-semibold text-muted-foreground">{card.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Level progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 card-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center">
                <Crown className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">Nível {stats.level}</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">{xpToNext > 0 ? `${xpToNext} XP restante` : 'MAX'}</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
              className="h-full gradient-hero rounded-full relative overflow-hidden shimmer" />
          </div>
        </motion.div>

        {/* Completion circle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 card-shadow flex items-center gap-5"
        >
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0-31.831"
                fill="none" stroke="hsl(var(--secondary))" strokeWidth="2.5" />
              <motion.path
                d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0-31.831"
                fill="none" stroke="url(#progressGrad)" strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${completionPct}, 100` }}
                transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--cta-orange))" />
                  <stop offset="100%" stopColor="hsl(var(--streak-fire))" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-foreground">
              {completionPct}%
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Progresso de Hoje</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.tasksCompleted} tarefas concluídas</p>
          </div>
        </motion.div>

        {/* Weekly heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5 card-shadow"
        >
          <p className="text-sm font-bold text-foreground mb-4">Últimos 7 dias</p>
          <div className="flex gap-2">
            {weekData.map((day, i) => {
              const d = new Date(day.data + 'T12:00:00');
              const dayLabel = WEEKDAYS[d.getDay()];
              const intensity = day.count / maxWeekCount;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <div className="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold text-foreground transition-all"
                    style={{
                      backgroundColor: day.count > 0
                        ? `hsl(160 84% 39% / ${0.15 + intensity * 0.7})`
                        : 'hsl(var(--secondary))',
                      boxShadow: day.count > 0 ? `0 0 ${10 + intensity * 20}px hsl(160 84% 39% / ${intensity * 0.2})` : 'none',
                    }}>
                    {day.count}
                  </div>
                  <span className="text-[9px] font-semibold text-muted-foreground">{dayLabel}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Goal progress */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-2xl p-5 card-shadow"
          >
            <p className="text-sm font-bold text-foreground mb-3">Progresso dos Objetivos</p>
            <div className="space-y-3.5">
              {goals.slice(0, 5).map(goal => (
                <div key={goal.id} className="flex items-center gap-3">
                  <span className="text-lg">{goal.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{goal.titulo}</p>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progresso}%` }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="h-full gradient-hero rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">{goal.progresso}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Ranking */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            🏆 Ranking Global
          </h2>
          <div className="space-y-2.5">
            {ranking.slice(0, 10).map((user, i) => (
              <motion.div key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => navigate(`/u/${user.username || user.id}`)}
                className={`flex items-center gap-3 rounded-2xl p-3.5 cursor-pointer transition-all hover-lift ${
                  i === 0 ? 'glass-card border-badge/20 shadow-lg shadow-badge/5' : 'glass-card'
                }`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                  i === 0 ? 'gradient-badge text-primary-foreground' : i === 1 ? 'bg-secondary/80 text-foreground' : i === 2 ? 'bg-streak/15 text-streak' : 'bg-muted text-muted-foreground'
                }`}>
                  {i === 0 ? '👑' : i + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg overflow-hidden border border-border/50">
                  {isEmoji(user.avatar_url) ? user.avatar_url : user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : '🦁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{user.nome}</p>
                  <p className="text-[11px] text-muted-foreground">🔥 {user.streak}d · Nível {user.level}</p>
                </div>
                <span className="text-sm font-extrabold text-gradient-accent">{user.xp.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
