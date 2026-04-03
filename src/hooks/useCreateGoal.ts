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
      visibilidade?: string;
      card_color?: string;
      card_image_url?: string | null;
      data_alvo?: string | null;
    }) => {
      if (!isSupabaseConfigured || !supabase || !user) return;

      const { error } = await supabase.from('goals').insert({
        titulo: data.titulo,
        descricao: data.descricao || '',
        emoji: data.emoji || '⚔️',
        user_id: user.id,
        visibilidade: data.visibilidade || 'private',
        card_color: data.card_color || '#FF6B00',
        card_image_url: data.card_image_url || null,
        data_alvo: data.data_alvo || null,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}
