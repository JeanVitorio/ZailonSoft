import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  tipo: string;
  profiles?: { nome: string; avatar_url: string; username: string | null };
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  conteudo: string;
  created_at: string;
  profiles?: { nome: string; avatar_url: string; username: string | null };
}

export function usePostReactions(postId: string) {
  return useQuery({
    queryKey: ['reactions', postId],
    queryFn: async (): Promise<Reaction[]> => {
      if (!isSupabaseConfigured || !supabase) return [];
      const { data } = await supabase
        .from('post_reactions')
        .select('*, profiles:user_id(nome, avatar_url, username)')
        .eq('post_id', postId);
      return (data as unknown as Reaction[]) ?? [];
    },
  });
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async (): Promise<Comment[]> => {
      if (!isSupabaseConfigured || !supabase) return [];
      const { data } = await supabase
        .from('post_comments')
        .select('*, profiles:user_id(nome, avatar_url, username)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      return (data as unknown as Comment[]) ?? [];
    },
  });
}

export function useToggleReaction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, tipo }: { postId: string; tipo: string }) => {
      if (!supabase || !user) return;
      const { data: existing } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('tipo', tipo)
        .single();
      if (existing) {
        await supabase.from('post_reactions').delete().eq('id', existing.id);
      } else {
        await supabase.from('post_reactions').insert({ post_id: postId, user_id: user.id, tipo });
      }
    },
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['reactions', postId] });
    },
  });
}

export function useAddComment() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, conteudo }: { postId: string; conteudo: string }) => {
      if (!supabase || !user) return;
      await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, conteudo });
    },
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
}
