export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskFrequency = 'daily' | 'weekly' | 'once';
export type Visibility = 'public' | 'private';
export type PostType = 'story' | 'achievement' | 'goal_complete' | 'streak';

export interface Profile {
  id: string;
  nome: string;
  level: number;
  xp: number;
  pontos: number;
  streak: number;
  last_activity_date: string | null;
  created_at: string;
  username: string | null;
  email: string | null;
  avatar_url: string;
  bio: string;
  settings: Record<string, unknown>;
  essencia: number;
  double_xp_until: string | null;
  streak_shield_until: string | null;
  special_glow_until: string | null;
  special_glow_color: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string;
  emoji: string;
  level: number;
  xp: number;
  progresso: number;
  created_at: string;
  data_alvo: string | null;
  status: 'active' | 'achieved';
  visibilidade: Visibility;
}

export interface Task {
  id: string;
  goal_id: string;
  user_id: string | null;
  titulo: string;
  descricao: string;
  dificuldade: TaskDifficulty;
  pontos: number;
  ativa: boolean;
  created_at: string;
  frequencia: TaskFrequency;
  dias_semana: number[];
  horario: string;
  topico: string;
  visibilidade: Visibility;
  repeticoes: number | null;
  double_up_enabled: boolean;
  card_color: string;
  card_image_url: string | null;
}

export interface TaskExecution {
  id: string;
  task_id: string;
  user_id: string | null;
  data: string;
  concluido: boolean;
  concluido_em: string | null;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  tipo: PostType;
  conteudo: string;
  emoji: string;
  created_at: string;
  metadata?: {
    task_titulo?: string;
    xp_earned?: number;
    pontos_earned?: number;
    badge?: string;
    task_id?: string;
    card_color?: string;
    card_image_url?: string | null;
  };
  profiles?: Pick<Profile, 'nome' | 'avatar_url' | 'username' | 'level'>;
}

export interface UserStats {
  xpTotal: number;
  streak: number;
  tasksCompleted: number;
  essence: number;
  level: number;
  pontos: number;
}

export const XP_MAP: Record<TaskDifficulty, number> = {
  easy: 15,
  medium: 25,
  hard: 50,
};

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

export const FREQUENCY_LABELS: Record<TaskFrequency, string> = {
  daily: 'Diária',
  once: 'Única',
  weekly: 'Semanal',
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: 'Público',
  private: 'Privado',
};

export const AVATAR_OPTIONS = [
  '🦁', '🐱', '🐺', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦅', '🐉', '🦇', '🐙', '🦈', '🐬', '🦩', '🦋',
];

export const BADGE_MAP: Record<string, string> = {
  streak_3: '🔥 Streak 3',
  streak_7: '🔥 Streak 7',
  streak_30: '🔥 Streak 30',
  consistencia: '⚡ Consistência',
  foco_total: '🎯 Foco Total',
  disciplina: '💎 Disciplina',
  primeiro_objetivo: '🏔️ Primeiro Objetivo',
};
