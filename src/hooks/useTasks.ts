import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskExecution, XP_MAP } from '@/types/zailon';

const MOCK_TASKS: Task[] = [
  {
    id: 'sys-1', goal_id: 'mock-goal-id', user_id: 'mock-user-id',
    titulo: 'Levantar da cama', descricao: 'Saia da cama sem apertar soneca',
    dificuldade: 'easy', pontos: 15, ativa: true, frequencia: 'daily',
    dias_semana: [0, 1, 2, 3, 4, 5, 6], horario: '06:30', topico: '',
    visibilidade: 'private', repeticoes: null, double_up_enabled: false,
    card_color: '#1a1a2e', card_image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sys-2', goal_id: 'mock-goal-id', user_id: 'mock-user-id',
    titulo: 'Tomar água', descricao: 'Beba um copo de água ao acordar',
    dificuldade: 'easy', pontos: 15, ativa: true, frequencia: 'daily',
    dias_semana: [0, 1, 2, 3, 4, 5, 6], horario: '06:35', topico: '',
    visibilidade: 'private', repeticoes: null, double_up_enabled: false,
    card_color: '#0d7377', card_image_url: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'sys-3', goal_id: 'mock-goal-id', user_id: 'mock-user-id',
    titulo: 'Respirar fundo 5 vezes', descricao: 'Pare, feche os olhos e respire',
    dificuldade: 'easy', pontos: 15, ativa: true, frequencia: 'daily',
    dias_semana: [0, 1, 2, 3, 4, 5, 6], horario: '08:00', topico: '',
    visibilidade: 'public', repeticoes: null, double_up_enabled: false,
    card_color: '#e63946', card_image_url: null,
    created_at: new Date().toISOString(),
  },
];

let mockCompletedIds = new Set<string>();

// Get current date/time in Brasilia timezone
function getBrasiliaDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

function getBrasiliaHourMinute(): { hour: number; minute: number } {
  const now = new Date();
  const brasilia = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return { hour: brasilia.getHours(), minute: brasilia.getMinutes() };
}

function getBrasiliaWeekday(): number {
  const now = new Date();
  const brasilia = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return brasilia.getDay();
}

// Filter tasks that should appear today
export function filterTodayTasks(tasks: Task[]): Task[] {
  const weekday = getBrasiliaWeekday();
  return tasks.filter(task => {
    if (task.frequencia === 'once') return true;
    if (task.frequencia === 'daily') {
      return task.dias_semana.length === 0 || task.dias_semana.includes(weekday);
    }
    if (task.frequencia === 'weekly') {
      return task.dias_semana.includes(weekday);
    }
    return true;
  });
}

// Get time status for a task
export function getTaskTimeStatus(task: Task): { status: 'overdue' | 'upcoming' | 'past' | 'now'; minutesDiff: number } {
  const { hour, minute } = getBrasiliaHourMinute();
  const [taskHour, taskMinute] = task.horario.split(':').map(Number);
  const nowMins = hour * 60 + minute;
  const taskMins = taskHour * 60 + taskMinute;
  const diff = taskMins - nowMins;

  if (diff < -5) return { status: 'overdue', minutesDiff: Math.abs(diff) };
  if (diff <= 5) return { status: 'now', minutesDiff: 0 };
  return { status: 'upcoming', minutesDiff: diff };
}

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
  const today = getBrasiliaDate();

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
      const today = getBrasiliaDate();
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

export function useUncompleteTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const today = getBrasiliaDate();
      if (!isSupabaseConfigured || !supabase || !user) {
        mockCompletedIds.delete(taskId);
        return;
      }
      await supabase
        .from('daily_task_executions')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .eq('data', today);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useDeleteTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!isSupabaseConfigured || !supabase || !user) return;
      await supabase.from('tasks').update({ ativa: false }).eq('id', taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useWeekExecutions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['week-executions', user?.id],
    queryFn: async (): Promise<{ data: string; count: number }[]> => {
      if (!isSupabaseConfigured || !supabase || !user) {
        // Mock: return last 7 days
        const results = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          results.push({ data: d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }), count: Math.floor(Math.random() * 5) });
        }
        return results;
      }
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const startDate = sevenDaysAgo.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

      const { data } = await supabase
        .from('daily_task_executions')
        .select('data')
        .eq('user_id', user.id)
        .eq('concluido', true)
        .gte('data', startDate);

      const counts: Record<string, number> = {};
      (data ?? []).forEach(row => {
        counts[row.data] = (counts[row.data] || 0) + 1;
      });

      const results = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
        results.push({ data: dateStr, count: counts[dateStr] || 0 });
      }
      return results;
    },
    enabled: !!user,
  });
}
