import { motion } from 'framer-motion';
import { Task } from '@/types/zailon';

interface OverdueTaskAlertProps {
  task: Task;
  minutesLate: number;
  onComplete: (task: Task) => void;
  onDismiss: () => void;
}

export default function OverdueTaskAlert({ task, minutesLate, onComplete, onDismiss }: OverdueTaskAlertProps) {
  const getMessage = () => {
    if (minutesLate > 120) return 'Faz tempo que estou te esperando... vamos fazer isso juntos?';
    if (minutesLate > 60) return 'Ei, já passou mais de uma hora. Bora resolver isso agora?';
    if (minutesLate > 30) return 'Você esqueceu de mim? Ainda dá tempo!';
    return 'Está um pouquinho atrasada, mas nada que a gente não resolva!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="mx-4 mb-4 p-4 rounded-2xl bg-card border border-streak/30 card-shadow"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">😢</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-streak uppercase tracking-wider">
            {minutesLate}min atrasada
          </p>
          <p className="text-sm font-extrabold text-foreground mt-1">{task.titulo}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{getMessage()}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(task)}
          className="flex-1 py-2.5 rounded-xl gradient-cta text-accent-foreground text-xs font-bold"
        >
          Vamos lá! 💪
        </motion.button>
        <button onClick={onDismiss} className="px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground text-xs font-bold">
          Depois
        </button>
      </div>
    </motion.div>
  );
}
