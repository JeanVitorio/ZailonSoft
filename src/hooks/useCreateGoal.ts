import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      titulo: string;
      descricao?: string;
      emoji?: string;
    }) => {
      if (!isSupabaseConfigured || !supabase || !user) return;

      const { error } = await supabase.from('goals').insert({
        titulo: data.titulo,
        descricao: data.descricao || '',
        emoji: data.emoji || '⚔️',
        user_id: user.id,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}