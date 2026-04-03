import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { CommunityPost } from '@/types/zailon';

const MOCK_FEED: CommunityPost[] = [
  {
    id: '1', user_id: 'u1', tipo: 'achievement',
    conteudo: 'Mandou ver nos abdominais! 💪', emoji: '🏆',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    metadata: { task_titulo: '50 abdominais', xp_earned: 50, card_color: '#e63946' },
    profiles: { nome: 'João Silva', avatar_url: '🦁', username: 'joao', level: 8 },
  },
  {
    id: '2', user_id: 'u2', tipo: 'achievement',
    conteudo: 'Mais um capítulo concluído! 📚', emoji: '📚',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    metadata: { task_titulo: 'Leitura 30min', xp_earned: 25, card_color: '#1a1a2e' },
    profiles: { nome: 'Maria Souza', avatar_url: '🐱', username: 'maria', level: 6 },
  },
  {
    id: '3', user_id: 'u3', tipo: 'achievement',
    conteudo: 'Superou o limite hoje! 🏃‍♂️', emoji: '🏃',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    metadata: { task_titulo: 'Correr 5km', xp_earned: 50, card_color: '#0d7377' },
    profiles: { nome: 'Pedro Costa', avatar_url: '🐺', username: 'pedro', level: 10 },
  },
];

export function useFeed(filter: 'all' | 'mine' | 'public' = 'all') {
  return useQuery({
    queryKey: ['feed', filter],
    queryFn: async (): Promise<CommunityPost[]> => {
      if (!isSupabaseConfigured || !supabase) return MOCK_FEED;

      let query = supabase
        .from('community_posts')
        .select('*, profiles:user_id(nome, avatar_url, username, level)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter === 'mine') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Feed error:', error);
        return MOCK_FEED;
      }
      return (data as unknown as CommunityPost[]) ?? [];
    },
    refetchInterval: 30000,
  });
}
