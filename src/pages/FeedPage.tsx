import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AchievementCard from '@/components/AchievementCard';
import { Achievement } from '@/types/xylon';
import crownBadge from '@/assets/crown-badge.png';

interface FeedPageProps {
  achievements: Achievement[];
  stats: { xpTotal: number; streak: number; level: number };
}

export default function FeedPage({ achievements, stats }: FeedPageProps) {
  const [filter, setFilter] = useState<'all' | 'clan' | 'public'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = achievements.filter(a => {
    if (filter === 'all') return true;
    return a.privacy === filter;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <img src={crownBadge} alt="Xylon" className="w-8 h-8" width={32} height={32} />
            <h1 className="text-xl font-extrabold text-foreground">Xylon Soft</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-xp/20 rounded-full px-3 py-1">
              <span className="text-xs font-bold text-navy">Lv.{stats.level}</span>
            </div>
            <div className="flex items-center gap-1 bg-streak/10 rounded-full px-3 py-1">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-bold text-streak">{stats.streak}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-3">
          {(['all', 'clan', 'public'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f
                  ? 'gradient-cta text-accent-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'clan' ? '❤️ Clã' : '🌍 Público'}
            </button>
          ))}

          <button
            onClick={handleRefresh}
            className="ml-auto p-2 rounded-full bg-secondary"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        <AnimatePresence>
          {filtered.map((achievement, i) => (
            <AchievementCard key={achievement.id} achievement={achievement} index={i} />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-4xl mb-3">🏋️</p>
            <p className="font-bold text-foreground">Nenhuma conquista ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Complete tarefas pra aparecer aqui!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
