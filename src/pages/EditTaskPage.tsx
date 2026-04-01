import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ImagePlus, Palette, X } from 'lucide-react';

import {
  TaskDifficulty,
  TaskFrequency,
  Visibility,
  DIFFICULTY_LABELS,
  FREQUENCY_LABELS,
  VISIBILITY_LABELS,
  XP_MAP
} from '@/types/zailon';

import { useTasks } from '@/hooks/useTasks';
import { useUpdateTask } from '@/hooks/useUpdateTask';
import { useGoals } from '@/hooks/useGoals';
import { toast } from 'sonner';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const COLOR_OPTIONS = [
  '#000000', '#1a1a2e', '#16213e', '#0d7377', '#1b4332',
  '#e63946', '#a8dadc', '#457b9d', '#6d28d9', '#f97316',
];

export default function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tasks } = useTasks();
  const { data: goals } = useGoals();
  const updateTask = useUpdateTask();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const task = tasks?.find(t => t.id === id);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [frequencia, setFrequencia] = useState<TaskFrequency>('daily');
  const [dificuldade, setDificuldade] = useState<TaskDifficulty>('medium');
  const [visibilidade, setVisibilidade] = useState<Visibility>('public');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [horario, setHorario] = useState('08:00');
  const [goalId, setGoalId] = useState('');
  const [cardColor, setCardColor] = useState('#000000');
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [cardMode, setCardMode] = useState<'color' | 'image'>('color');

  useEffect(() => {
    if (!task) return;

    setTitulo(task.titulo || '');
    setDescricao(task.descricao || '');
    setFrequencia(task.frequencia);
    setDificuldade(task.dificuldade);
    setVisibilidade(task.visibilidade);
    setSelectedDays(task.dias_semana || []);
    setHorario(task.horario || '08:00');
    setGoalId(task.goal_id || '');
    setCardColor(task.card_color || '#000000');

    if (task.card_image_url) {
      setCardImageUrl(task.card_image_url);
      setCardMode('image');
    } else {
      setCardMode('color');
    }
  }, [task]);

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

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async () => {
    if (!titulo.trim() || !id) return;

    try {
      await updateTask.mutateAsync({
        id,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        dificuldade,
        frequencia,
        visibilidade,
        dias_semana: frequencia === 'daily' ? selectedDays : [],
        horario,
        goal_id: goalId,
        card_color: cardColor,
        card_image_url: cardMode === 'image' ? cardImageUrl : null,
      });

      toast.success('Tarefa atualizada! ✏️');
      navigate('/tasks');
    } catch {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  if (!task) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  return (
    <div className="pb-24">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center gap-3 pt-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">
            Editar Tarefa
          </h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">

        {/* PREVIEW */}
        <div className="rounded-2xl overflow-hidden h-32 relative" style={{ backgroundColor: cardColor }}>
          {cardMode === 'image' && cardImageUrl && (
            <img src={cardImageUrl} className="w-full h-full object-cover absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-white font-extrabold text-lg truncate">
              {titulo || 'Preview do card'}
            </p>
            <p className="text-white/70 text-xs">{XP_MAP[dificuldade]} XP</p>
          </div>
        </div>

        {/* APARÊNCIA */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Aparência do Card
          </label>

          <div className="flex gap-2 mt-1.5">
            <button
              onClick={() => setCardMode('color')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${
                cardMode === 'color'
                  ? 'gradient-cta text-accent-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              <Palette className="w-3.5 h-3.5 inline mr-1" />
              Cor
            </button>

            <button
              onClick={() => {
                setCardMode('image');
                fileInputRef.current?.click();
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${
                cardMode === 'image'
                  ? 'gradient-cta text-accent-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              <ImagePlus className="w-3.5 h-3.5 inline mr-1" />
              Imagem
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleImageUpload}
          />

          {cardMode === 'color' && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setCardColor(c)}
                  className={`w-9 h-9 rounded-xl border-2 ${
                    cardColor === c ? 'border-cta scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}

          {cardMode === 'image' && cardImageUrl && (
            <button
              onClick={() => {
                setCardImageUrl(null);
                setCardMode('color');
              }}
              className="mt-2 text-xs text-destructive flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Remover imagem
            </button>
          )}
        </div>

        {/* INPUTS IGUAIS */}
        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Nome da tarefa"
          className="w-full px-4 py-3 rounded-xl bg-card border border-border"
        />

        <textarea
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          placeholder="Descrição"
          className="w-full px-4 py-3 rounded-xl bg-card border border-border"
        />

        <select
          value={goalId}
          onChange={e => setGoalId(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-card border border-border"
        >
          <option value="">Sem objetivo</option>
          {goals?.map(g => (
            <option key={g.id} value={g.id}>
              {g.emoji} {g.titulo}
            </option>
          ))}
        </select>

        {/* FREQUÊNCIA */}
        <div className="flex gap-2">
          {(['daily', 'once', 'weekly'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFrequencia(f)}
              className={`flex-1 py-2.5 rounded-xl ${
                frequencia === f
                  ? 'gradient-cta text-accent-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {FREQUENCY_LABELS[f]}
            </button>
          ))}
        </div>

        {/* DIAS */}
        {frequencia === 'daily' && (
          <div className="flex gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`flex-1 py-2 rounded ${
                  selectedDays.includes(i)
                    ? 'bg-xp text-navy'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* HORÁRIO */}
        <input
          type="time"
          value={horario}
          onChange={e => setHorario(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-card border border-border"
        />

        {/* BOTÃO FINAL */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!titulo.trim() || updateTask.isPending}
          className="w-full py-4 rounded-xl gradient-cta text-accent-foreground font-extrabold disabled:opacity-40"
        >
          {updateTask.isPending ? 'Salvando...' : 'Salvar Alterações ✏️'}
        </motion.button>
      </div>
    </div>
  );
}