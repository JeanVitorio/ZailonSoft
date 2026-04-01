import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, DIFFICULTY_LABELS, FREQUENCY_LABELS, XP_MAP } from '@/types/zailon';

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onComplete: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  timeStatus?: { status: 'overdue' | 'upcoming' | 'past' | 'now'; minutesDiff: number };
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-xp/30 text-navy',
  medium: 'bg-streak/20 text-streak',
  hard: 'bg-destructive/15 text-destructive',
};

export default function TaskItem({ task, isCompleted, onComplete, onDelete, timeStatus }: TaskItemProps) {
  const handleComplete = () => {
    if (isCompleted) return;
    confetti({
      particleCount: 80, spread: 60, origin: { y: 0.7 },
      colors: ['#A8E6CF', '#FF6B00', '#FFD700', '#003366'],
    });
    onComplete(task);
  };

  const xp = XP_MAP[task.dificuldade];

  const getTimeLabel = () => {
    if (!timeStatus) return null;
    if (timeStatus.status === 'overdue') return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-destructive">
        <AlertTriangle className="w-3 h-3" /> {timeStatus.minutesDiff}min atrasada
      </span>
    );
    if (timeStatus.status === 'upcoming') return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground">
        <Clock className="w-3 h-3" /> em {timeStatus.minutesDiff}min
      </span>
    );
    if (timeStatus.status === 'now') return (
      <span className="text-[10px] font-bold text-cta animate-pulse">AGORA</span>
    );
    return null;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-4 rounded-xl bg-card card-shadow border transition-all ${
        isCompleted ? 'opacity-60 border-border' :
        timeStatus?.status === 'overdue' ? 'border-destructive/30' :
        timeStatus?.status === 'now' ? 'border-cta/30' : 'border-border'
      }`}
    >
      <motion.button whileTap={{ scale: 0.8 }} onClick={handleComplete} disabled={isCompleted}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
          isCompleted ? 'bg-xp glow-green' : 'border-2 border-border hover:border-cta'
        }`}>
        {isCompleted && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-navy">
            <Check className="w-5 h-5" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-bold text-sm ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.titulo}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.descricao}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${difficultyColors[task.dificuldade]}`}>
            {DIFFICULTY_LABELS[task.dificuldade]}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">{task.horario}</span>
          {getTimeLabel()}
        </div>
      </div>

      <div className="flex flex-col items-center shrink-0 gap-1">
        <span className="text-xs font-extrabold text-cta">+{xp} XP</span>
        {onDelete && (
          <button onClick={() => onDelete(task.id)} className="p-1 rounded-md hover:bg-destructive/10">
            <Trash2 className="w-3 h-3 text-destructive/60" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
