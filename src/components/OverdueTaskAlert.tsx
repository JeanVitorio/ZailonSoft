import { motion } from 'framer-motion';
import { Task } from '@/types/zailon';

interface OverdueTaskAlertProps {
  task: Task;
  minutesLate: number;
  onComplete: (task: Task) => void;
  onDismiss: () => void;
}

export default function OverdueTaskAlert({
  task,
  minutesLate,
  onComplete,
  onDismiss,
}: OverdueTaskAlertProps) {

  const safeMinutes = Math.max(0, Math.floor(minutesLate));

  const getMessage = () => {
    if (safeMinutes > 120) return 'Faz tempo que estou te esperando... vamos fazer isso juntos?';
    if (safeMinutes > 60) return 'Ei, já passou mais de uma hora. Bora resolver isso agora?';
    if (safeMinutes > 30) return 'Você esqueceu de mim? Ainda dá tempo!';
    return 'Está um pouquinho atrasada, mas nada que a gente não resolva!';
  };

  const formatDelay = (minutes: number) => {
    const abs = Math.abs(minutes);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    if (hours === 0) return `${mins}min atrasada`;
    if (mins === 0) return `${hours}h atrasada`;
    return `${hours}h ${mins}min atrasada`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="w-full max-w-md mx-auto mb-4 p-4 rounded-2xl glass-card border-streak/20 card-shadow-lg relative overflow-hidden"
    >
      {/* Pulse background */}
      <motion.div
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-streak/10 rounded-2xl"
      />

      <div className="flex items-start gap-3 relative z-10">
        <motion.span
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-3xl"
        >
          😢
        </motion.span>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-streak uppercase tracking-wider">
            {formatDelay(safeMinutes)}
          </p>

          <p className="text-sm font-extrabold text-foreground mt-1">
            {task.titulo}
          </p>

          <p className="text-xs text-muted-foreground mt-0.5">
            {getMessage()}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3 relative z-10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onComplete(task)}
          className="flex-1 py-2.5 rounded-xl gradient-cta text-accent-foreground text-xs font-bold shadow-lg shadow-accent/20"
        >
          Vamos lá! 💪
        </motion.button>

        <button
          onClick={onDismiss}
          className="px-4 py-2.5 rounded-xl glass-card text-muted-foreground text-xs font-bold hover:text-foreground transition-colors"
        >
          Depois
        </button>
      </div>
    </motion.div>
  );
}
