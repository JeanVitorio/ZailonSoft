import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskExecution, XP_MAP } from '@/types/zailon';

const MOCK_TASKS: Task[] = [
  {
    id: 'sys-1', goal_id: 'mock-goal-id', user_id: 'mock-user-id',
    titulo: 'Beber água', descricao: 'Beba pelo menos 1 copo de água',
    dificuldade: 'easy', pontos: 15, ativa: true, frequencia: 'daily',
    dias_semana: [0, 1, 2, 3, 4, 5, 6], horario: '08:00', topico: '',
    visibilidade: 'private', repeticoes: null, double_up_enabled: false,
    card_color: '#1a1a2e', card_image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sys-2', goal_id: 'mock-goal-id', user_id: 'mock-user-id',
    titulo: 'Levantar e alongar', descricao: 'Pare, levante e faça um alongamento',
    dificuldade: 'easy', pontos: 15, ativa: true, frequencia: 'daily',
    dias_semana: [0, 1, 2, 3, 4, 5, 6], horario: '09:00', topico: '',
    visibilidade: 'private', repeticoes: null, double_up_enabled: false,
    card_color: '#0d7377', card_image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sys-3', goal_id: 'mock-goal-id', user_id: 'mock-user-id',
    titulo: '10 flexões', descricao: 'Faça pelo menos 10 flexões',
    dificuldade: 'medium', pontos: 25, ativa: true, frequencia: 'daily',
    dias_semana: [1, 2, 3, 4, 5], horario: '10:00', topico: '',
    visibilidade: 'public', repeticoes: null, double_up_enabled: false,
    card_color: '#e63946', card_image_url: null,
    created_at: new Date().toISOString(),
  },
];

let mockCompletedIds = new Set<string>();

export function useTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!isSupabaseConfigured || !supabase || !user) return MOCK_TASKS;
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as Task[]) ?? [];
    },
    enabled: !!user,
  });
}

export function useTodayExecutions() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  return useQuery({
    queryKey: ['executions', user?.id, today],
    queryFn: async (): Promise<TaskExecution[]> => {
      if (!isSupabaseConfigured || !supabase || !user) {
        return Array.from(mockCompletedIds).map(id => ({
          id: `exec-${id}`, task_id: id, user_id: 'mock-user-id',
          data: today, concluido: true,
          concluido_em: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }));
      }
      const { data, error } = await supabase
        .from('daily_task_executions')
        .select('*')
        .eq('user_id', user.id)
        .eq('data', today);
      if (error) throw error;
      return (data as TaskExecution[]) ?? [];
    },
    enabled: !!user,
  });
}

export function useCompleteTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
      const xpEarned = XP_MAP[task.dificuldade];
      const pontosEarned = task.pontos;

      if (!isSupabaseConfigured || !supabase || !user) {
        mockCompletedIds.add(task.id);
        return { xpEarned, pontosEarned };
      }

      await supabase.from('daily_task_executions').insert({
        task_id: task.id, user_id: user.id, data: today,
        concluido: true, concluido_em: new Date().toISOString(),
      });

      await supabase.from('community_posts').insert({
        user_id: user.id, tipo: 'achievement',
        conteudo: `Concluiu: ${task.titulo}! 💪`, emoji: '🏆',
        metadata: {
          task_titulo: task.titulo, xp_earned: xpEarned,
          pontos_earned: pontosEarned, task_id: task.id,
          card_color: task.card_color, card_image_url: task.card_image_url,
        },
      });

      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, pontos, essencia, level')
        .eq('id', user.id)
        .single();

      if (profile) {
        const newXp = (profile.xp || 0) + xpEarned;
        const newPontos = (profile.pontos || 0) + pontosEarned;
        const newEssencia = (profile.essencia || 0) + Math.round(xpEarned * 0.4);
        const newLevel = Math.floor(newXp / 100) + 1;
        await supabase.from('profiles').update({
          xp: newXp, pontos: newPontos, essencia: newEssencia,
          level: newLevel, last_activity_date: today,
        }).eq('id', user.id);
      }

      await supabase.from('activity_log').insert({
        user_id: user.id, task_id: task.id, data: today,
        tipo: 'task_complete',
        descricao: `Concluiu ${task.titulo} (+${xpEarned} XP)`,
      });

      return { xpEarned, pontosEarned };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useCreateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: {
      titulo: string;
      descricao: string;
      dificuldade: Task['dificuldade'];
      frequencia: Task['frequencia'];
      visibilidade: Task['visibilidade'];
      dias_semana: number[];
      horario: string;
      goal_id: string;
      card_color: string;
      card_image_url: string | null;
    }) => {
      const pontos = XP_MAP[task.dificuldade];

      if (!isSupabaseConfigured || !supabase || !user) {
        const newTask: Task = {
          ...task, id: `task-${Date.now()}`, user_id: 'mock-user-id',
          pontos, ativa: true, topico: '', repeticoes: null,
          double_up_enabled: false, created_at: new Date().toISOString(),
        };
        MOCK_TASKS.unshift(newTask);
        return newTask;
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user.id, pontos, ativa: true })
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
