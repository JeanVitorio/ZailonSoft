import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Palette, ImagePlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QUEST_TEMPLATES, QuestTemplate } from '@/data/questTemplates';
import { useCreateGoal } from '@/hooks/useGoals';
import { useCreateTask } from '@/hooks/useTasks';
import { DIFFICULTY_LABELS, XP_MAP } from '@/types/zailon';
import { toast } from 'sonner';

const TEMPLATE_IMAGES: Record<string, string> = {
  'Fitness & Corpo': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=200&fit=crop',
  'Mente & Bem-estar': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=200&fit=crop',
  'Produtividade': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=200&fit=crop',
  'Alimentação': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop',
  'Desenvolvimento Pessoal': 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=200&fit=crop',
};

const COLOR_OPTIONS = [
  '#FF6B00', '#e63946', '#1a1a2e', '#0d7377', '#1b4332',
  '#457b9d', '#6d28d9', '#000000',
];

export default function QuestTemplatesPage() {
  const navigate = useNavigate();
  const createGoal = useCreateGoal();
  const createTask = useCreateTask();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editedTasks, setEditedTasks] = useState<Record<string, QuestTemplate['tasks']>>({});
  const [templateColors, setTemplateColors] = useState<Record<string, string>>({});

  const categories = [...new Set(QUEST_TEMPLATES.map(q => q.categoria))];

  const getEditableTasks = (template: QuestTemplate) => {
    return editedTasks[template.id] || template.tasks;
  };

  const updateTaskField = (templateId: string, taskIdx: number, field: string, value: string) => {
    const tasks = [...(editedTasks[templateId] || QUEST_TEMPLATES.find(t => t.id === templateId)!.tasks)];
    tasks[taskIdx] = { ...tasks[taskIdx], [field]: value };
    setEditedTasks(prev => ({ ...prev, [templateId]: tasks }));
  };

  const handleImport = async (template: QuestTemplate) => {
    setImporting(template.id);
    try {
      const goal = await createGoal.mutateAsync({
        titulo: template.titulo,
        descricao: template.descricao,
        emoji: template.emoji,
        visibilidade: 'private',
      });

      const tasksToImport = getEditableTasks(template);
      const color = templateColors[template.id] || '#FF6B00';

      for (const t of tasksToImport) {
        await createTask.mutateAsync({
          titulo: t.titulo, descricao: t.descricao,
          dificuldade: t.dificuldade, frequencia: t.frequencia,
          visibilidade: 'private', dias_semana: t.dias_semana,
          horario: t.horario, goal_id: goal.id,
          card_color: color, card_image_url: null,
        });
      }

      toast.success(`"${template.titulo}" importado com ${tasksToImport.length} tarefas!`);
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
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-10">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center gap-3 pt-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Modelos Prontos</h1>
            <p className="text-xs text-muted-foreground">15 objetivos com tarefas pré-definidas</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {categories.map(cat => (
          <div key={cat}>
            <div className="flex items-center gap-3 mb-3">
              {TEMPLATE_IMAGES[cat] && (
                <img src={TEMPLATE_IMAGES[cat]} alt="" className="w-12 h-12 rounded-xl object-cover" />
              )}
              <p className="text-sm font-extrabold text-foreground">{cat}</p>
            </div>
            <div className="space-y-3">
              {QUEST_TEMPLATES.filter(q => q.categoria === cat).map((template, i) => {
                const isExpanded = expanded === template.id;
                const isEditing = editingTemplate === template.id;
                const tasks = getEditableTasks(template);
                const color = templateColors[template.id] || '#FF6B00';

                return (
                  <motion.div key={template.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="rounded-2xl overflow-hidden border border-border card-shadow">
                    {/* Card header with color */}
                    <div className="relative h-24 overflow-hidden cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => setExpanded(isExpanded ? null : template.id)}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
                        <span className="text-2xl">{template.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-sm text-white truncate">{template.titulo}</p>
                          <p className="text-[10px] text-white/70">{template.duracao_dias} dias · {template.tasks.length} tarefas</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/70" /> : <ChevronDown className="w-4 h-4 text-white/70" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }} className="overflow-hidden bg-card">
                          <div className="px-4 py-4 space-y-3">
                            <p className="text-xs text-muted-foreground">{template.descricao}</p>

                            {/* Color picker */}
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Cor do Card</p>
                              <div className="flex gap-2 flex-wrap">
                                {COLOR_OPTIONS.map(c => (
                                  <button key={c} onClick={() => setTemplateColors(prev => ({ ...prev, [template.id]: c }))}
                                    className={`w-7 h-7 rounded-lg border-2 transition-all ${color === c ? 'border-cta scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            </div>

                            {/* Edit toggle */}
                            <button onClick={() => setEditingTemplate(isEditing ? null : template.id)}
                              className="text-[11px] font-bold text-cta">
                              {isEditing ? 'Parar de editar' : 'Editar tarefas antes de importar'}
                            </button>

                            {/* Tasks */}
                            {tasks.map((t, j) => (
                              <div key={j} className="bg-secondary/50 rounded-xl px-3 py-2 space-y-1">
                                {isEditing ? (
                                  <>
                                    <input value={t.titulo}
                                      onChange={e => updateTaskField(template.id, j, 'titulo', e.target.value)}
                                      className="w-full bg-transparent text-xs font-semibold text-foreground focus:outline-none" />
                                    <input type="time" value={t.horario}
                                      onChange={e => updateTaskField(template.id, j, 'horario', e.target.value)}
                                      className="bg-transparent text-[10px] text-muted-foreground focus:outline-none" />
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffColors[t.dificuldade]}`}>
                                      {DIFFICULTY_LABELS[t.dificuldade]}
                                    </span>
                                    <p className="text-xs font-semibold text-foreground flex-1 truncate">{t.titulo}</p>
                                    <span className="text-[10px] text-muted-foreground">{t.horario}</span>
                                  </div>
                                )}
                              </div>
                            ))}

                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleImport(template)}
                              disabled={importing === template.id}
                              className="w-full py-3 rounded-xl gradient-cta text-accent-foreground text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40">
                              <Plus className="w-4 h-4" />
                              {importing === template.id ? 'Importando...' : 'Usar Este Modelo'}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
