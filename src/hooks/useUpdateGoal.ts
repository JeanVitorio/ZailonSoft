import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUpdateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: { id: string; titulo?: string; descricao?: string; status?: string; emoji?: string }) => {
      if (!isSupabaseConfigured || !supabase || !user) return;

      const updates: Record<string, unknown> = {};
      if (goal.titulo !== undefined) updates.titulo = goal.titulo;
      if (goal.descricao !== undefined) updates.descricao = goal.descricao;
      if (goal.status !== undefined) updates.status = goal.status;
      if (goal.emoji !== undefined) updates.emoji = goal.emoji;

      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goal.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
