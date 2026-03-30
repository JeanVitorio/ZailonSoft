export type TaskDifficulty = 'easy' | 'medium' | 'hard';
export type TaskType = 'daily' | 'once' | 'weekly';
export type TaskPrivacy = 'public' | 'clan' | 'secret';

export interface Task {
  id: string;
  name: string;
  description: string;
  type: TaskType;
  difficulty: TaskDifficulty;
  privacy: TaskPrivacy;
  days?: number[]; // 0-6 for daily tasks
  hour?: string;
  completed: boolean;
  completedAt?: string;
  xp: number;
  essence: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  userName: string;
  userAvatar: string;
  taskName: string;
  xpEarned: number;
  badge?: string;
  message: string;
  privacy: TaskPrivacy;
  createdAt: string;
  heroImage?: string;
}

export interface UserStats {
  xpTotal: number;
  streak: number;
  tasksCompleted: number;
  essence: number;
  level: number;
  rank: number;
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

export const TYPE_LABELS: Record<TaskType, string> = {
  daily: 'Diária',
  once: 'Única',
  weekly: 'Semanal',
};

export const PRIVACY_LABELS: Record<TaskPrivacy, string> = {
  public: 'Público',
  clan: 'Clã',
  secret: 'Secreto',
};
