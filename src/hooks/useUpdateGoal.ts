import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUpdateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: {
      id: string;
      titulo?: string;
      descricao?: string;
      status?: string;
      emoji?: string;
      visibilidade?: string;
      card_color?: string;
      card_image_url?: string | null;
      data_alvo?: string | null;
    }) => {
      if (!isSupabaseConfigured || !supabase || !user) return;

      const updates: Record<string, unknown> = {};
      if (goal.titulo !== undefined) updates.titulo = goal.titulo;
      if (goal.descricao !== undefined) updates.descricao = goal.descricao;
      if (goal.status !== undefined) updates.status = goal.status;
      if (goal.emoji !== undefined) updates.emoji = goal.emoji;
      if (goal.visibilidade !== undefined) updates.visibilidade = goal.visibilidade;
      if (goal.card_color !== undefined) updates.card_color = goal.card_color;
      if (goal.card_image_url !== undefined) updates.card_image_url = goal.card_image_url;
      if (goal.data_alvo !== undefined) updates.data_alvo = goal.data_alvo;

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
