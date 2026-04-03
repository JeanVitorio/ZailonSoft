import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Goal } from '@/types/zailon';

const MOCK_GOAL: Goal = {
  id: 'mock-goal-id',
  user_id: 'mock-user-id',
  titulo: 'Tarefas Gerais',
  descricao: 'Objetivo padrão para tarefas do dia a dia',
  emoji: '⚔️',
  level: 1,
  xp: 0,
  progresso: 0,
  created_at: new Date().toISOString(),
  data_alvo: null,
  status: 'active',
  visibilidade: 'private',
  card_color: '#FF6B00',
  card_image_url: null,
};

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async (): Promise<Goal[]> => {
      if (!isSupabaseConfigured || !supabase || !user) return [MOCK_GOAL];
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as Goal[]) ?? [MOCK_GOAL];
    },
    enabled: !!user,
  });
}

export function useCreateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Pick<Goal, 'titulo' | 'descricao' | 'emoji' | 'visibilidade'>) => {
      if (!isSupabaseConfigured || !supabase || !user) return MOCK_GOAL;
      const { data, error } = await supabase
        .from('goals')
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useDefaultGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<Goal> => {
      if (!isSupabaseConfigured || !supabase || !user) return MOCK_GOAL;

      const { data: existing } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('titulo', 'Tarefas Gerais')
        .single();

      if (existing) return existing as Goal;

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          titulo: 'Tarefas Gerais',
          descricao: 'Objetivo padrão para tarefas do dia a dia',
          emoji: '⚔️',
          visibilidade: 'private',
        })
        .select()
        .single();
      if (error) throw error;
      return data as Goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
