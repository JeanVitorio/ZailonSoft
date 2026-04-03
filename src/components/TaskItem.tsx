import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, DIFFICULTY_LABELS, XP_MAP } from '@/types/zailon';

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onComplete: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  timeStatus?: { status: 'overdue' | 'upcoming' | 'past' | 'now'; minutesDiff: number };
}

export default function TaskItem({ task, isCompleted, onComplete, onDelete, timeStatus }: TaskItemProps) {
  const handleComplete = () => {
    if (!isCompleted) {
      confetti({
        particleCount: 80, spread: 60, origin: { y: 0.7 },
        colors: ['#A8E6CF', '#FF6B00', '#FFD700', '#003366'],
      });
    }
    onComplete(task);
  };

  const xp = XP_MAP[task.dificuldade];
  const cardColor = task.card_color || '#FF6B00';
  const cardImage = task.card_image_url;
  const hasCustomBg = cardImage || (cardColor && cardColor !== '#000000');

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
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-white/90">
        <AlertTriangle className="w-3 h-3" /> {formatMinutes(timeStatus.minutesDiff)} atrasada
      </span>
    );
    if (timeStatus.status === 'upcoming') return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-white/70">
        <Clock className="w-3 h-3" /> em {formatMinutes(timeStatus.minutesDiff)}
      </span>
    );
    if (timeStatus.status === 'now') return (
      <span className="text-[10px] font-bold text-white animate-pulse">AGORA</span>
    );
    return null;
  };

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative flex items-center gap-3 p-4 rounded-2xl overflow-hidden transition-all ${
        isCompleted ? 'opacity-60' : ''
      }`}
      style={{
        backgroundColor: hasCustomBg ? cardColor : undefined,
      }}
    >
      {/* Background image */}
      {cardImage && (
        <img src={cardImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Overlay for readability */}
      {(hasCustomBg || cardImage) && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      {!hasCustomBg && (
        <div className="absolute inset-0 bg-card border border-border rounded-2xl" />
      )}

      {/* Content */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={handleComplete}
        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
          isCompleted
            ? 'bg-white/30 backdrop-blur-sm'
            : 'border-2 border-white/50 hover:border-white'
        }`}
      >
        {isCompleted ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <RotateCcw className="w-4 h-4 text-white" strokeWidth={3} />
          </motion.div>
        ) : null}
      </motion.button>

      <div className="relative z-10 flex-1 min-w-0">
        <p className={`font-bold text-sm ${
          isCompleted ? 'line-through text-white/60' : hasCustomBg || cardImage ? 'text-white' : 'text-foreground'
        }`}>
          {task.titulo}
        </p>
        {task.descricao && (
          <p className={`text-xs mt-0.5 truncate ${hasCustomBg || cardImage ? 'text-white/60' : 'text-muted-foreground'}`}>
            {task.descricao}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
            {DIFFICULTY_LABELS[task.dificuldade]}
          </span>
          <span className={`text-[10px] font-semibold ${hasCustomBg || cardImage ? 'text-white/70' : 'text-muted-foreground'}`}>
            {task.horario}
          </span>
          {!isCompleted && getTimeLabel()}
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center shrink-0 gap-1">
        <span className="text-xs font-extrabold text-white drop-shadow-sm">+{xp} XP</span>
        {onDelete && (
          <button onClick={() => onDelete(task.id)} className="p-1 rounded-md hover:bg-white/10">
            <Trash2 className="w-3 h-3 text-white/60" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
