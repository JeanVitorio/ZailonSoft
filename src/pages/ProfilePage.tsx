import { motion } from 'framer-motion';
import { Settings, LogOut, Shield, Crown } from 'lucide-react';
import { UserStats } from '@/types/xylon';
import crownBadge from '@/assets/crown-badge.png';
import streakFire from '@/assets/streak-fire.png';

interface ProfilePageProps {
  stats: UserStats;
}

export default function ProfilePage({ stats }: ProfilePageProps) {
  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center justify-between pt-3">
          <h1 className="text-xl font-extrabold text-foreground">Perfil</h1>
          <button className="p-2 rounded-full bg-secondary">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-lg mx-auto space-y-5">
        {/* Avatar + info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-xp/30 flex items-center justify-center text-5xl border-4 border-xp animate-pulse-glow">
            🦁
          </div>
          <h2 className="text-xl font-extrabold text-foreground mt-3">Você</h2>
          <p className="text-sm text-muted-foreground">Rei do Dia · Nível {stats.level}</p>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <img src={crownBadge} alt="XP" className="w-5 h-5" loading="lazy" width={20} height={20} />
              <span className="text-sm font-bold text-foreground">{stats.xpTotal} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <img src={streakFire} alt="Streak" className="w-5 h-5" loading="lazy" width={20} height={20} />
              <span className="text-sm font-bold text-streak">{stats.streak} dias</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💎</span>
              <span className="text-sm font-bold text-clan">{stats.essence}</span>
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 card-shadow border border-border"
        >
          <h3 className="text-sm font-bold text-foreground mb-3">🏅 Badges</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {['Rei do Dia', 'Streak 7!', 'Primeiro Clã', 'Madrugador'].map((badge, i) => (
              <div
                key={badge}
                className="shrink-0 w-16 h-16 rounded-xl gradient-badge flex flex-col items-center justify-center"
              >
                <span className="text-lg">{['👑', '🔥', '❤️', '🌅'][i]}</span>
                <span className="text-[8px] font-bold text-navy mt-0.5">{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Menu items */}
        <div className="space-y-2">
          {[
            { icon: Crown, label: 'Xylon Premium', sub: 'Desbloqueie tudo' },
            { icon: Shield, label: 'Privacidade', sub: 'Controle quem vê seus dados' },
            { icon: LogOut, label: 'Sair', sub: 'Logout da conta', danger: true },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="w-full flex items-center gap-3 p-4 bg-card rounded-xl card-shadow border border-border text-left"
            >
              <item.icon className={`w-5 h-5 ${item.danger ? 'text-destructive' : 'text-muted-foreground'}`} />
              <div>
                <p className={`text-sm font-bold ${item.danger ? 'text-destructive' : 'text-foreground'}`}>{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.sub}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
