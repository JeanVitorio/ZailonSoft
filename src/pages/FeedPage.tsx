import { useState } from 'react';
import { RefreshCw, Bell, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AchievementCard from '@/components/AchievementCard';
import UserSearch from '@/components/UserSearch';
import { CommunityPost } from '@/types/zailon';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface FeedPageProps {
  posts: CommunityPost[];
  stats: { xpTotal: number; streak: number; level: number };
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function FeedPage({ posts, stats, onRefresh, isRefreshing }: FeedPageProps) {
  const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('all');
  const { data: unreadCount = 0 } = useUnreadCount();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const filtered = filter === 'all' ? posts : filter === 'mine'
    ? posts.filter(p => p.user_id === user?.id)
    : posts;

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Apagar este post?')) return;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('community_posts').delete().eq('id', postId);
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success('Post apagado');
    }
  };

  return (
    <div className="pb-24">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 glass-card-strong px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center">
              <span className="text-lg font-black text-primary-foreground">Z</span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-foreground">Zailon</h1>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">Lv.{stats.level}</span>
            </motion.div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full glass-card">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-bold text-streak">{stats.streak}</span>
            </div>
            <button onClick={() => navigate('/notifications')} className="relative p-2.5 rounded-full glass-card hover:bg-secondary/80 transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center shadow-lg shadow-destructive/30"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3"><UserSearch /></div>

        <div className="flex items-center gap-2 mt-3">
          {(['all', 'mine', 'public'] as const).map((f) => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                filter === f
                  ? 'gradient-cta text-accent-foreground shadow-lg shadow-accent/20'
                  : 'glass-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'mine' ? 'Minhas' : 'Público'}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.85, rotate: 180 }}
            onClick={onRefresh}
            className="ml-auto p-2.5 rounded-full glass-card hover:bg-secondary/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
        <AnimatePresence>
          {filtered.map((post, i) => (
            <AchievementCard key={post.id} post={post} index={i} onDelete={handleDeletePost} />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <motion.p animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-5xl mb-4">💬</motion.p>
            <p className="font-extrabold text-foreground text-lg">Nenhuma atividade ainda</p>
            <p className="text-sm text-muted-foreground mt-2">Complete tarefas para aparecer aqui</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
