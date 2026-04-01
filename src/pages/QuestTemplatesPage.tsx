import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QUEST_TEMPLATES, QuestTemplate } from '@/data/questTemplates';
import { useCreateGoal } from '@/hooks/useGoals';
import { useCreateTask } from '@/hooks/useTasks';
import { DIFFICULTY_LABELS, XP_MAP } from '@/types/zailon';
import { toast } from 'sonner';

export default function QuestTemplatesPage() {
  const navigate = useNavigate();
  const createGoal = useCreateGoal();
  const createTask = useCreateTask();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);

  const categories = [...new Set(QUEST_TEMPLATES.map(q => q.categoria))];

  const handleImport = async (template: QuestTemplate) => {
    setImporting(template.id);
    try {
      const dataAlvo = new Date();
      dataAlvo.setDate(dataAlvo.getDate() + template.duracao_dias);

      const goal = await createGoal.mutateAsync({
        titulo: template.titulo,
        descricao: template.descricao,
        emoji: template.emoji,
        visibilidade: 'private',
      });

      for (const t of template.tasks) {
        await createTask.mutateAsync({
          titulo: t.titulo,
          descricao: t.descricao,
          dificuldade: t.dificuldade,
          frequencia: t.frequencia,
          visibilidade: 'private',
          dias_semana: t.dias_semana,
          horario: t.horario,
          goal_id: goal.id,
          card_color: '#000000',
          card_image_url: null,
        });
      }

      toast.success(`"${template.titulo}" importado com ${template.tasks.length} tarefas!`);
      navigate('/quests');
    } catch {
      toast.error('Erro ao importar objetivo');
    } finally {
      setImporting(null);
    }
  };

  const diffColors: Record<string, string> = {
    easy: 'bg-xp/30 text-navy',
    medium: 'bg-streak/20 text-streak',
    hard: 'bg-destructive/15 text-destructive',
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center gap-3 pt-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="text-xl font-extrabold text-foreground">Modelos de Objetivos</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">15 objetivos prontos com tarefas para você começar agora</p>
      </div>

      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
        {categories.map(cat => (
          <div key={cat}>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{cat}</p>
            <div className="space-y-3">
              {QUEST_TEMPLATES.filter(q => q.categoria === cat).map((template, i) => {
                const isExpanded = expanded === template.id;
                return (
                  <motion.div key={template.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-2xl border border-border card-shadow overflow-hidden">
                    <button onClick={() => setExpanded(isExpanded ? null : template.id)}
                      className="w-full flex items-center gap-3 p-4 text-left">
                      <span className="text-2xl">{template.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-foreground truncate">{template.titulo}</p>
                        <p className="text-[11px] text-muted-foreground">{template.duracao_dias} dias · {template.tasks.length} tarefas</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>

                    {isExpanded && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 space-y-2">
                        <p className="text-xs text-muted-foreground mb-2">{template.descricao}</p>
                        {template.tasks.map((t, j) => (
                          <div key={j} className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffColors[t.dificuldade]}`}>
                              {DIFFICULTY_LABELS[t.dificuldade]}
                            </span>
                            <p className="text-xs font-semibold text-foreground flex-1 truncate">{t.titulo}</p>
                            <span className="text-[10px] text-muted-foreground">{t.horario}</span>
                          </div>
                        ))}
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleImport(template)}
                          disabled={importing === template.id}
                          className="w-full mt-2 py-3 rounded-xl gradient-cta text-accent-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40">
                          <Plus className="w-4 h-4" />
                          {importing === template.id ? 'Importando...' : 'Usar Este Modelo'}
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
