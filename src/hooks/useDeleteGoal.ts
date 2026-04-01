import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useDeleteGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string) => {
      if (!isSupabaseConfigured || !supabase || !user) return;

      // 🔥 deletar tarefas primeiro
      await supabase.from('tasks').delete().eq('goal_id', goalId);

      // 🔥 depois deletar o goal
      await supabase.from('goals').delete().eq('id', goalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}