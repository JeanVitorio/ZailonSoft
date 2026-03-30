import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/zailon';

const MOCK_PROFILE: Profile = {
  id: 'mock-user-id',
  nome: 'Você',
  level: 5,
  xp: 420,
  pontos: 280,
  streak: 7,
  last_activity_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  username: 'voce',
  email: 'voce@zailon.app',
  avatar_url: '🦁',
  bio: 'Guerreiro do dia a dia 💪',
  settings: {},
  essencia: 150,
  double_xp_until: null,
  streak_shield_until: null,
  special_glow_until: null,
  special_glow_color: null,
};

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile> => {
      if (!isSupabaseConfigured || !supabase || !user) return MOCK_PROFILE;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Pick<Profile, 'nome' | 'avatar_url' | 'bio' | 'username'>>) => {
      if (!isSupabaseConfigured || !supabase || !user) return;
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
