import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ImagePlus, Palette, X } from 'lucide-react';
import { TaskDifficulty, TaskFrequency, Visibility, DIFFICULTY_LABELS, FREQUENCY_LABELS, VISIBILITY_LABELS, XP_MAP } from '@/types/zailon';
import { useCreateTask } from '@/hooks/useTasks';
import { useGoals, useDefaultGoal } from '@/hooks/useGoals';
import { toast } from 'sonner';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const COLOR_OPTIONS = [
  '#000000', '#1a1a2e', '#16213e', '#0d7377', '#1b4332',
  '#e63946', '#a8dadc', '#457b9d', '#6d28d9', '#f97316',
];

export default function NewTaskPage() {
  const navigate = useNavigate();
  const createTask = useCreateTask();
  const { data: goals } = useGoals();
  const defaultGoal = useDefaultGoal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [frequencia, setFrequencia] = useState<TaskFrequency>('daily');
  const [dificuldade, setDificuldade] = useState<TaskDifficulty>('medium');
  const [visibilidade, setVisibilidade] = useState<Visibility>('public');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [horario, setHorario] = useState('08:00');
  const [goalId, setGoalId] = useState<string>('');
  const [cardColor, setCardColor] = useState('#000000');
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [cardMode, setCardMode] = useState<'color' | 'image'>('color');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCardImageUrl(ev.target?.result as string);
      setCardMode('image');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!titulo.trim()) return;
    let finalGoalId = goalId || '';

    // If no goal selected and "avulsa" not chosen, use default
    if (!finalGoalId) {
      if (goals && goals.length > 0) {
        finalGoalId = goals[0].id;
      } else {
        try {
          const goal = await defaultGoal.mutateAsync();
          finalGoalId = goal.id;
        } catch { toast.error('Erro ao criar objetivo padrão'); return; }
      }
    }

    try {
      await createTask.mutateAsync({
        titulo: titulo.trim(), descricao: descricao.trim(),
        dificuldade, frequencia, visibilidade,
        dias_semana: frequencia === 'daily' ? selectedDays : [],
        horario, goal_id: finalGoalId,
        card_color: cardColor,
        card_image_url: cardMode === 'image' ? cardImageUrl : null,
      });
      toast.success('Tarefa criada! 🚀');
      navigate('/tasks');
    } catch { toast.error('Erro ao criar tarefa'); }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
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
        {/* Card preview */}
        <div className="rounded-2xl overflow-hidden h-32 relative" style={{ backgroundColor: cardColor }}>
          {cardMode === 'image' && cardImageUrl && (
            <img src={cardImageUrl} alt="" className="w-full h-full object-cover absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-white font-extrabold text-lg drop-shadow-lg truncate">
              {titulo || 'Preview do card'}
            </p>
            <p className="text-white/70 text-xs">{XP_MAP[dificuldade]} XP</p>
          </div>
        </div>

        {/* Card appearance */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aparência do Card</label>
          <div className="flex gap-2 mt-1.5">
            <button onClick={() => setCardMode('color')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                cardMode === 'color' ? 'gradient-cta text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
              <Palette className="w-3.5 h-3.5" /> Cor
            </button>
            <button onClick={() => { setCardMode('image'); fileInputRef.current?.click(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                cardMode === 'image' ? 'gradient-cta text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
              <ImagePlus className="w-3.5 h-3.5" /> Imagem
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

          {cardMode === 'color' && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button key={c} onClick={() => setCardColor(c)}
                  className={`w-9 h-9 rounded-xl border-2 transition-all ${cardColor === c ? 'border-cta scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          )}

          {cardMode === 'image' && cardImageUrl && (
            <button onClick={() => { setCardImageUrl(null); setCardMode('color'); }} className="mt-2 text-xs text-destructive flex items-center gap-1">
              <X className="w-3 h-3" /> Remover imagem
            </button>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: 50 abdominais"
            className="w-full mt-1.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30" />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Descrição</label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Detalhes da tarefa..." rows={2}
            className="w-full mt-1.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30 resize-none" />
        </div>

        {/* Goal selection */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Objetivo</label>
          <select value={goalId} onChange={e => setGoalId(e.target.value)}
            className="w-full mt-1.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cta/30">
            <option value="">Tarefa avulsa (objetivo padrão)</option>
            {goals?.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.titulo}</option>)}
          </select>
        </div>

        {/* Frequency */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo</label>
          <div className="flex gap-2 mt-1.5">
            {(['daily', 'once', 'weekly'] as const).map(t => (
              <button key={t} onClick={() => setFrequencia(t)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  frequencia === t ? 'gradient-cta text-accent-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                {FREQUENCY_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Days */}
        {frequencia === 'daily' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dias</label>
            <div className="flex gap-1.5 mt-1.5">
              {DAYS.map((day, i) => (
                <button key={i} onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
                    selectedDays.includes(i) ? 'bg-xp text-navy' : 'bg-secondary text-muted-foreground'
                  }`}>{day}</button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hour */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Horário</label>
          <input type="time" value={horario} onChange={e => setHorario(e.target.value)}
            className="w-full mt-1.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cta/30" />
        </div>

        {/* Difficulty */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dificuldade</label>
          <div className="flex gap-2 mt-1.5">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button key={d} onClick={() => setDificuldade(d)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  dificuldade === d
                    ? d === 'easy' ? 'bg-xp text-navy' : d === 'medium' ? 'bg-streak/20 text-streak' : 'bg-destructive/20 text-destructive'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                {DIFFICULTY_LABELS[d]} ({XP_MAP[d]} XP)
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Privacidade</label>
          <div className="flex gap-2 mt-1.5">
            {(['public', 'private'] as const).map(p => (
              <button key={p} onClick={() => setVisibilidade(p)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  visibilidade === p ? 'gradient-cta text-accent-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                {p === 'public' ? '🌍 ' : '🔒 '}{VISIBILITY_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
          disabled={!titulo.trim() || createTask.isPending}
          className="w-full py-4 rounded-xl gradient-cta text-accent-foreground font-extrabold text-base disabled:opacity-40 transition-opacity">
          {createTask.isPending ? 'Criando...' : 'Criar Tarefa 🚀'}
        </motion.button>
      </div>
    </div>
  );
}
