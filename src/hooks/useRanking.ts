import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

export interface RankingUser {
  id: string;
  nome: string;
  username: string | null;
  avatar_url: string;
  xp: number;
  level: number;
  streak: number;
}

export function useRanking() {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: async (): Promise<RankingUser[]> => {
      if (!isSupabaseConfigured || !supabase) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, username, avatar_url, xp, level, streak')
        .order('xp', { ascending: false })
        .limit(50);
      if (error) {
        console.error('Ranking error:', error);
        return [];
      }
      return (data as RankingUser[]) ?? [];
    },
    staleTime: 30000,
  });
}
