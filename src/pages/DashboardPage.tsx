import { motion } from 'framer-motion';
import { UserStats } from '@/types/xylon';
import crownBadge from '@/assets/crown-badge.png';
import streakFire from '@/assets/streak-fire.png';
import medalBadge from '@/assets/medal-badge.png';

interface DashboardPageProps {
  stats: UserStats;
}

const LEADERBOARD = [
  { name: 'João Silva', xp: 1250, avatar: '🦁', streak: 14 },
  { name: 'Maria Souza', xp: 1100, avatar: '🐱', streak: 12 },
  { name: 'Pedro Costa', xp: 980, avatar: '🐺', streak: 10 },
  { name: 'Ana Oliveira', xp: 870, avatar: '🦊', streak: 8 },
  { name: 'Lucas Santos', xp: 760, avatar: '🐻', streak: 7 },
];

export default function DashboardPage({ stats }: DashboardPageProps) {
  const xpToNext = (stats.level * 100) - stats.xpTotal;
  const progress = ((stats.xpTotal % 100) / 100) * 100;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="pt-3">
          <h1 className="text-xl font-extrabold text-foreground">Meu Status</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<img src={crownBadge} alt="XP" className="w-10 h-10" width={40} height={40} />}
            label="XP Total"
            value={stats.xpTotal.toLocaleString()}
            color="bg-xp/15"
            delay={0}
          />
          <StatCard
            icon={<img src={streakFire} alt="Streak" className="w-10 h-10" width={40} height={40} />}
            label="Streak"
            value={`${stats.streak} dias`}
            color="bg-streak/15"
            delay={0.1}
          />
          <StatCard
            icon={<img src={medalBadge} alt="Tarefas" className="w-10 h-10" width={40} height={40} />}
            label="Tarefas"
            value={stats.tasksCompleted.toString()}
            color="bg-level/15"
            delay={0.2}
          />
          <StatCard
            icon={<span className="text-3xl">💎</span>}
            label="Essência"
            value={stats.essence.toString()}
            color="bg-clan/15"
            delay={0.3}
          />
        </div>

        {/* Level progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-4 card-shadow border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">Nível {stats.level}</span>
            <span className="text-xs text-muted-foreground">{xpToNext > 0 ? `${xpToNext} XP pro próximo` : 'MAX!'}</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-full gradient-hero rounded-full"
            />
          </div>
        </motion.div>

        {/* Ranking */}
        <div>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            🏆 Ranking Global — Top 5 Semanal
          </h2>
          <div className="space-y-2">
            {LEADERBOARD.map((user, i) => (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 bg-card rounded-xl p-3 card-shadow border border-border"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                  i === 0 ? 'gradient-badge text-navy' : i === 1 ? 'bg-secondary text-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground">🔥 {user.streak} dias</p>
                </div>
                <span className="text-sm font-extrabold text-cta">{user.xp.toLocaleString()} XP</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Premium CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-card rounded-xl p-5 card-shadow border border-border text-center"
        >
          <span className="text-3xl">👑</span>
          <h3 className="font-extrabold text-foreground mt-2">Xylon Premium</h3>
          <p className="text-xs text-muted-foreground mt-1">Clãs ilimitados, badges exclusivos e mais!</p>
          <button className="mt-3 px-6 py-2.5 rounded-xl gradient-cta text-accent-foreground font-bold text-sm">
            Desbloquear — R$9,90/mês
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`${color} rounded-xl p-4 flex flex-col items-center gap-2 border border-border`}
    >
      {icon}
      <span className="text-lg font-extrabold text-foreground">{value}</span>
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
    </motion.div>
  );
}
