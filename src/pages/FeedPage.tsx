import { useState } from 'react';
import { RefreshCw, Bell } from 'lucide-react';
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
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center justify-between pt-3">
          <h1 className="text-xl font-extrabold text-foreground">Zailon</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-xp/20 rounded-full px-3 py-1">
              <span className="text-xs font-bold text-navy">Lv.{stats.level}</span>
            </div>
            <div className="flex items-center gap-1 bg-streak/10 rounded-full px-3 py-1">
              <span className="text-xs">🔥</span>
              <span className="text-xs font-bold text-streak">{stats.streak}</span>
            </div>
            <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-full bg-secondary">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3"><UserSearch /></div>

        <div className="flex items-center gap-2 mt-3">
          {(['all', 'mine', 'public'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === f ? 'gradient-cta text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
              {f === 'all' ? 'Todos' : f === 'mine' ? 'Minhas' : 'Público'}
            </button>
          ))}
          <button onClick={onRefresh} className="ml-auto p-2 rounded-full bg-secondary">
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
        <AnimatePresence>
          {filtered.map((post, i) => (
            <AchievementCard key={post.id} post={post} index={i} onDelete={handleDeletePost} />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-bold text-foreground">Nenhuma atividade ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Complete tarefas para aparecer aqui</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
