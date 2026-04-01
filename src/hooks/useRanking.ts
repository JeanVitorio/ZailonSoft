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

const MOCK_RANKING: RankingUser[] = [
  { id: '1', nome: 'Marcus Silva', username: 'marcus', avatar_url: '🦁', xp: 1250, level: 13, streak: 14 },
  { id: '2', nome: 'Julia Andrade', username: 'julia', avatar_url: '🐱', xp: 1100, level: 11, streak: 12 },
  { id: '3', nome: 'Rafael Costa', username: 'rafa', avatar_url: '🐺', xp: 980, level: 10, streak: 10 },
  { id: '4', nome: 'Camila Oliveira', username: 'cami', avatar_url: '🦊', xp: 870, level: 9, streak: 8 },
  { id: '5', nome: 'Thiago Santos', username: 'thiago', avatar_url: '🐻', xp: 760, level: 8, streak: 7 },
];

export function useRanking() {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: async (): Promise<RankingUser[]> => {
      if (!isSupabaseConfigured || !supabase) return MOCK_RANKING;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, username, avatar_url, xp, level, streak')
        .order('xp', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as RankingUser[]) ?? [];
    },
  });
}
