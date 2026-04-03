import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUpdateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: {
      id: string;
      titulo?: string;
      descricao?: string;
      horario?: string;
      dificuldade?: string;
      frequencia?: string;
      visibilidade?: string;
      dias_semana?: number[];
      goal_id?: string;
      card_color?: string;
      card_image_url?: string | null;
    }) => {
      if (!isSupabaseConfigured || !supabase || !user) return;

      const { id, ...updates } = task;

      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, v]) => v !== undefined)
      );

      const { error } = await supabase
        .from('tasks')
        .update(cleanUpdates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
