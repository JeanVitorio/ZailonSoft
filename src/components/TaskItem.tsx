import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, Trash2, RotateCcw, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, DIFFICULTY_LABELS, XP_MAP } from '@/types/zailon';

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onComplete: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  timeStatus?: { status: 'overdue' | 'upcoming' | 'past' | 'now'; minutesDiff: number };
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-primary/15 text-primary',
  medium: 'bg-streak/15 text-streak',
  hard: 'bg-destructive/15 text-destructive',
};

const difficultyGlow: Record<string, string> = {
  easy: 'shadow-primary/10',
  medium: 'shadow-streak/10',
  hard: 'shadow-destructive/10',
};

export default function TaskItem({ task, isCompleted, onComplete, onDelete, timeStatus }: TaskItemProps) {
  const handleComplete = () => {
    if (!isCompleted) {
      confetti({
        particleCount: 120, spread: 70, origin: { y: 0.7 },
        colors: ['#00c853', '#ff6d00', '#ffd600', '#7c4dff', '#ff1744'],
        ticks: 80,
      });
    }
    onComplete(task);
  };

  const xp = XP_MAP[task.dificuldade];

  const formatMinutes = (minutes: number) => {
    const abs = Math.abs(minutes);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const getTimeLabel = () => {
    if (!timeStatus) return null;
    if (timeStatus.status === 'overdue') return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-destructive">
        <AlertTriangle className="w-3 h-3" /> {formatMinutes(timeStatus.minutesDiff)} atrasada
      </span>
    );
    if (timeStatus.status === 'upcoming') return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground">
        <Clock className="w-3 h-3" /> em {formatMinutes(timeStatus.minutesDiff)}
      </span>
    );
    if (timeStatus.status === 'now') return (
      <motion.span
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="flex items-center gap-0.5 text-[10px] font-bold text-accent"
      >
        <Zap className="w-3 h-3" /> AGORA
      </motion.span>
    );
    return null;
  };

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -1 }}
      className={`flex items-center gap-3 p-4 rounded-2xl glass-card hover-lift transition-all ${
        isCompleted ? 'opacity-50'
          : timeStatus?.status === 'overdue' ? 'border-destructive/30 shadow-lg shadow-destructive/5'
          : timeStatus?.status === 'now' ? 'border-accent/30 shadow-lg shadow-accent/5'
          : ''
      }`}
    >
      <motion.button
        whileTap={{ scale: 0.7 }}
        onClick={handleComplete}
        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
          isCompleted
            ? 'bg-primary glow-green'
            : 'border-2 border-border hover:border-primary hover:bg-primary/10'
        }`}
      >
        {isCompleted ? (
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}>
            <RotateCcw className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
          </motion.div>
        ) : null}
      </motion.button>

      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm tracking-tight ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.titulo}
        </p>
        {task.descricao && <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.descricao}</p>}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${difficultyColors[task.dificuldade]} ${difficultyGlow[task.dificuldade]}`}>
            {DIFFICULTY_LABELS[task.dificuldade]}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">{task.horario}</span>
          {!isCompleted && getTimeLabel()}
        </div>
      </div>

      <div className="flex flex-col items-center shrink-0 gap-1.5">
        <motion.span
          className="text-xs font-extrabold text-gradient-accent"
          whileHover={{ scale: 1.1 }}
        >
          +{xp} XP
        </motion.span>
        {onDelete && (
          <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-destructive/50 hover:text-destructive transition-colors" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
