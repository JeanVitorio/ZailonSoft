import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { CommunityPost, Profile } from '@/types/zailon';
import AchievementCard from '@/components/AchievementCard';
import crownBadge from '@/assets/crown-badge.png';

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: async (): Promise<Profile | null> => {
      if (!isSupabaseConfigured || !supabase) return null;
      const { data } = await supabase.from('profiles')
        .select('*').eq('username', username).single();
      return data as Profile | null;
    },
    enabled: !!username,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['public-feed', profile?.id],
    queryFn: async (): Promise<CommunityPost[]> => {
      if (!isSupabaseConfigured || !supabase || !profile) return [];
      const { data } = await supabase.from('community_posts')
        .select('*, profiles:user_id(nome, avatar_url, username, level)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false }).limit(20);
      return (data as unknown as CommunityPost[]) ?? [];
    },
    enabled: !!profile?.id,
  });

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  const isEmoji = (s: string) => s.length <= 4 && /\p{Emoji}/u.test(s);

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center gap-3 pt-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="text-xl font-extrabold text-foreground">@{profile.username}</h1>
        </div>
      </div>

      <div className="px-4 pt-6 text-center">
        <div className="w-20 h-20 rounded-full bg-xp/30 flex items-center justify-center text-4xl border-4 border-xp mx-auto overflow-hidden">
          {isEmoji(profile.avatar_url) ? profile.avatar_url : profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : '🦁'}
        </div>
        <h2 className="text-lg font-extrabold text-foreground mt-3">{profile.nome}</h2>
        <p className="text-xs text-muted-foreground">{profile.bio || 'Guerreiro do Zailon'} · Nível {profile.level}</p>
        <div className="flex justify-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <img src={crownBadge} alt="" className="w-4 h-4" width={16} height={16} />
            <span className="text-xs font-bold">{profile.xp} XP</span>
          </div>
          <span className="text-xs font-bold text-streak">🔥 {profile.streak}</span>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-5">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Conquistas recentes</p>
        <AnimatePresence>
          {posts.map((post, i) => <AchievementCard key={post.id} post={post} index={i} />)}
        </AnimatePresence>
        {posts.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Nenhuma conquista ainda</p>
        )}
      </div>
    </div>
  );
}
