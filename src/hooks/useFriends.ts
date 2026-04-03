import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/types/zailon';

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['search-users', query],
    queryFn: async (): Promise<Pick<Profile, 'id' | 'nome' | 'username' | 'avatar_url' | 'level' | 'bio'>[]> => {
      if (!isSupabaseConfigured || !supabase || !query.trim()) return [];
      const searchTerm = query.trim();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, username, avatar_url, level, bio')
        .or(`nome.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(20);
      if (error) {
        console.error('Search error:', error);
        return [];
      }
      return data ?? [];
    },
    enabled: query.trim().length >= 2,
  });
}

export function useFollowing() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['following', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!isSupabaseConfigured || !supabase || !user) return [];
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      return data?.map(f => f.following_id) ?? [];
    },
    enabled: !!user,
  });
}

export function useFollowUser() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      if (!supabase || !user) return;
      const { data: existing } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetId)
        .maybeSingle();
      if (existing) {
        await supabase.from('follows').delete().eq('id', existing.id);
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['following'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
