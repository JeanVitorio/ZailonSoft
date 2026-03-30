import { useState, useCallback } from 'react';
import { Task, Achievement, UserStats, XP_MAP } from '@/types/xylon';

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    userName: 'João Silva',
    userAvatar: '🦁',
    taskName: '50 abdominais',
    xpEarned: 50,
    badge: 'Rei do Core!',
    message: 'Mandou ver nos abdominais! 💪',
    privacy: 'public',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    userName: 'Maria Souza',
    userAvatar: '🐱',
    taskName: 'Leitura 30min',
    xpEarned: 25,
    badge: 'Mente Afiada',
    message: 'Mais um capítulo concluído! 📚',
    privacy: 'clan',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '3',
    userName: 'Pedro Costa',
    userAvatar: '🐺',
    taskName: 'Correr 5km',
    xpEarned: 50,
    badge: 'Rei da Rua!',
    message: 'Superou o limite hoje! 🏃‍♂️',
    privacy: 'public',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '4',
    userName: 'Ana Oliveira',
    userAvatar: '🦊',
    taskName: 'Meditação 15min',
    xpEarned: 15,
    message: 'Paz interior atingida 🧘',
    privacy: 'public',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: '5',
    userName: 'Lucas Santos',
    userAvatar: '🐻',
    taskName: '100 flexões',
    xpEarned: 50,
    badge: 'Monstro do Push-up!',
    message: 'Ninguém segura esse maluco! 🔥',
    privacy: 'public',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'sys-1',
    name: 'Beber água',
    description: 'Beba pelo menos 1 copo de água',
    type: 'daily',
    difficulty: 'easy',
    privacy: 'secret',
    days: [0, 1, 2, 3, 4, 5, 6],
    completed: false,
    xp: 15,
    essence: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sys-2',
    name: 'Levantar e alongar',
    description: 'Pare, levante e faça um alongamento',
    type: 'daily',
    difficulty: 'easy',
    privacy: 'secret',
    days: [0, 1, 2, 3, 4, 5, 6],
    completed: false,
    xp: 15,
    essence: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sys-3',
    name: '10 flexões',
    description: 'Faça pelo menos 10 flexões',
    type: 'daily',
    difficulty: 'medium',
    privacy: 'public',
    days: [1, 2, 3, 4, 5],
    completed: false,
    xp: 25,
    essence: 10,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_STATS: UserStats = {
  xpTotal: 420,
  streak: 7,
  tasksCompleted: 28,
  essence: 150,
  level: 5,
  rank: 12,
};

export function useXylonStore() {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [achievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);

  const addTask = useCallback((task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'xp' | 'essence'>) => {
    const xp = XP_MAP[task.difficulty];
    const essence = Math.round(xp * 0.4);
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
      xp,
      essence,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
      )
    );
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setStats(prev => ({
        ...prev,
        xpTotal: prev.xpTotal + task.xp,
        essence: prev.essence + task.essence,
        tasksCompleted: prev.tasksCompleted + 1,
        level: Math.floor((prev.xpTotal + task.xp) / 100) + 1,
      }));
    }
  }, [tasks]);

  const resetDailyTasks = useCallback(() => {
    setTasks(prev => prev.map(t => (t.type === 'daily' ? { ...t, completed: false, completedAt: undefined } : t)));
  }, []);

  return { tasks, achievements, stats, addTask, completeTask, resetDailyTasks };
}
