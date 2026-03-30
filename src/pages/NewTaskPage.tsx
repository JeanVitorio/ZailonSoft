import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { TaskDifficulty, TaskType, TaskPrivacy, DIFFICULTY_LABELS, TYPE_LABELS, PRIVACY_LABELS, XP_MAP } from '@/types/xylon';

interface NewTaskPageProps {
  onAdd: (task: {
    name: string;
    description: string;
    type: TaskType;
    difficulty: TaskDifficulty;
    privacy: TaskPrivacy;
    days?: number[];
    hour?: string;
  }) => void;
}

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function NewTaskPage({ onAdd }: NewTaskPageProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('daily');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium');
  const [privacy, setPrivacy] = useState<TaskPrivacy>('public');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [hour, setHour] = useState('08:00');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      description: description.trim(),
      type,
      difficulty,
      privacy,
      days: type === 'daily' ? selectedDays : undefined,
      hour,
    });
    navigate('/tasks');
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center gap-3 pt-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">Nova Tarefa</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        {/* Name */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: 50 abdominais"
            className="w-full mt-1.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Descrição</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detalhes da tarefa..."
            rows={2}
            className="w-full mt-1.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30 resize-none"
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo</label>
          <div className="flex gap-2 mt-1.5">
            {(['daily', 'once', 'weekly'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  type === t ? 'gradient-cta text-accent-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Days (if daily) */}
        {type === 'daily' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dias</label>
            <div className="flex gap-1.5 mt-1.5">
              {DAYS.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                    selectedDays.includes(i)
                      ? 'bg-xp text-navy'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hour */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Horário</label>
          <input
            type="time"
            value={hour}
            onChange={e => setHour(e.target.value)}
            className="w-full mt-1.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cta/30"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dificuldade</label>
          <div className="flex gap-2 mt-1.5">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  difficulty === d
                    ? d === 'easy' ? 'bg-xp text-navy' : d === 'medium' ? 'bg-streak/20 text-streak' : 'bg-destructive/20 text-destructive'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {DIFFICULTY_LABELS[d]} ({XP_MAP[d]} XP)
              </button>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Privacidade</label>
          <div className="flex gap-2 mt-1.5">
            {(['public', 'clan', 'secret'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPrivacy(p)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  privacy === p ? 'gradient-cta text-accent-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {p === 'public' ? '🌍 ' : p === 'clan' ? '❤️ ' : '🔒 '}{PRIVACY_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full py-4 rounded-xl gradient-cta text-accent-foreground font-extrabold text-base disabled:opacity-40 transition-opacity"
        >
          Criar Tarefa 🚀
        </motion.button>
      </div>
    </div>
  );
}
