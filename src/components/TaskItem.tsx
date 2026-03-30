import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, DIFFICULTY_LABELS, FREQUENCY_LABELS, XP_MAP } from '@/types/zailon';
import streakFire from '@/assets/streak-fire.png';

interface TaskItemProps {
  task: Task;
  isCompleted: boolean;
  onComplete: (task: Task) => void;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-xp/30 text-navy',
  medium: 'bg-streak/20 text-streak',
  hard: 'bg-destructive/15 text-destructive',
};

export default function TaskItem({ task, isCompleted, onComplete }: TaskItemProps) {
  const handleComplete = () => {
    if (isCompleted) return;

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#A8E6CF', '#FF6B00', '#FFD700', '#003366'],
    });

    onComplete(task);
  };

  const xp = XP_MAP[task.dificuldade];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-4 rounded-xl bg-card card-shadow border border-border transition-all ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={handleComplete}
        disabled={isCompleted}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
          isCompleted
            ? 'bg-xp glow-green'
            : 'border-2 border-border hover:border-cta'
        }`}
      >
        {isCompleted && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-navy">
            <Check className="w-5 h-5" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>

      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.titulo}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.descricao}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${difficultyColors[task.dificuldade]}`}>
            {DIFFICULTY_LABELS[task.dificuldade]}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground">
            {FREQUENCY_LABELS[task.frequencia]}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center shrink-0">
        <img src={streakFire} alt="XP" className="w-6 h-6" loading="lazy" width={24} height={24} />
        <span className="text-xs font-extrabold text-cta">+{xp}</span>
      </div>
    </motion.div>
  );
}
