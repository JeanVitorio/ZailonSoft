import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ImagePlus, Palette, X } from 'lucide-react';
import { useCreateGoal } from '@/hooks/useCreateGoal';
import { toast } from 'sonner';

const COLOR_OPTIONS = [
  '#FF6B00', '#e63946', '#1a1a2e', '#0d7377', '#1b4332',
  '#457b9d', '#6d28d9', '#000000', '#f97316', '#a8dadc',
];

const EMOJI_OPTIONS = ['⚔️', '🎯', '🏋️', '📚', '🧘', '🏃', '💻', '🎨', '🌱', '💰', '🏔️', '🔥'];

export default function CreateGoalPage() {
  const navigate = useNavigate();
  const createGoal = useCreateGoal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [emoji, setEmoji] = useState('⚔️');
  const [cardColor, setCardColor] = useState('#FF6B00');
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [cardMode, setCardMode] = useState<'color' | 'image'>('color');
  const [duracao, setDuracao] = useState('30');
  const [duracaoTipo, setDuracaoTipo] = useState<'days' | 'months' | 'years'>('days');

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

  const getDataAlvo = () => {
    const d = new Date();
    const num = parseInt(duracao) || 30;
    if (duracaoTipo === 'days') d.setDate(d.getDate() + num);
    else if (duracaoTipo === 'months') d.setMonth(d.getMonth() + num);
    else d.setFullYear(d.getFullYear() + num);
    return d.toISOString().split('T')[0];
  };

  const handleCreate = async () => {
    if (!titulo.trim()) return toast.error('Digite um título');
    try {
      await createGoal.mutateAsync({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        emoji,
      });
      toast.success('Objetivo criado! 🎯');
      navigate('/quests');
    } catch {
      toast.error('Erro ao criar objetivo');
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-10">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center gap-3 pt-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-extrabold text-foreground">Novo Objetivo</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Card preview */}
        <div className="rounded-2xl overflow-hidden h-36 relative" style={{ backgroundColor: cardColor }}>
          {cardMode === 'image' && cardImageUrl && (
            <img src={cardImageUrl} alt="" className="w-full h-full object-cover absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
            <span className="text-3xl">{emoji}</span>
            <p className="text-white font-extrabold text-lg drop-shadow-lg truncate">
              {titulo || 'Meu Objetivo'}
            </p>
          </div>
        </div>

        {/* Appearance */}
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
            <button onClick={() => { setCardImageUrl(null); setCardMode('color'); }}
              className="mt-2 text-xs text-destructive flex items-center gap-1">
              <X className="w-3 h-3" /> Remover imagem
            </button>
          )}
        </div>

        {/* Emoji */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ícone</label>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                  emoji === e ? 'bg-cta/20 ring-2 ring-cta' : 'bg-secondary'
                }`}>{e}</button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome do Objetivo</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Secar a barriga em 30 dias"
            className="w-full mt-1.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30" />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Descrição</label>
          <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descreva seu objetivo..." rows={2}
            className="w-full mt-1.5 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30 resize-none" />
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Prazo</label>
          <div className="flex gap-2 mt-1.5">
            <input type="number" value={duracao} onChange={e => setDuracao(e.target.value)} min="1"
              className="w-20 px-3 py-3 rounded-xl bg-card border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cta/30" />
            {(['days', 'months', 'years'] as const).map(t => (
              <button key={t} onClick={() => setDuracaoTipo(t)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                  duracaoTipo === t ? 'gradient-cta text-accent-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                {t === 'days' ? 'Dias' : t === 'months' ? 'Meses' : 'Anos'}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate}
          disabled={!titulo.trim() || createGoal.isPending}
          className="w-full py-4 rounded-xl gradient-cta text-accent-foreground font-extrabold text-base disabled:opacity-40 transition-opacity">
          {createGoal.isPending ? 'Criando...' : 'Criar Objetivo 🎯'}
        </motion.button>
      </div>
    </div>
  );
}
