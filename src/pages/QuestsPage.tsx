import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Pencil,
  Trash,
  Check,
  ChevronRight,
} from 'lucide-react';

import { useGoals } from '@/hooks/useGoals';
import { useTasks } from '@/hooks/useTasks';
import { useUpdateTask } from '@/hooks/useUpdateTask';
import { useUpdateGoal } from '@/hooks/useUpdateGoal';
import { useDeleteGoal } from '@/hooks/useDeleteGoal';
import { useDeleteTask } from '@/hooks/useDeleteTask';

import { toast } from 'sonner';

export default function QuestsPage({ onNavigateTemplates }: any) {
  const { data: goals = [] } = useGoals();
  const { data: tasks = [] } = useTasks();

  const updateTask = useUpdateTask();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const deleteTask = useDeleteTask();

  const [search, setSearch] = useState('');
  const [openGoalId, setOpenGoalId] = useState<string | null>(null);

  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  const [form, setForm] = useState<any>({});

  const toggleGoal = (id: string) => {
    setOpenGoalId(prev => (prev === id ? null : id));
  };

  const openEditTask = (task: any) => {
    setEditingTask(task);
    setForm({
      titulo: task.titulo,
      descricao: task.descricao,
      horario: task.horario || '08:00',
    });
  };

  const openEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setForm({
      titulo: goal.titulo,
      descricao: goal.descricao,
    });
  };

  const saveTask = async () => {
    await updateTask.mutateAsync({ id: editingTask.id, ...form });
    toast.success('Tarefa atualizada');
    setEditingTask(null);
  };

  const saveGoal = async () => {
    await updateGoal.mutateAsync({ id: editingGoal.id, ...form });
    toast.success('Objetivo atualizado');
    setEditingGoal(null);
  };

  const completeGoal = async (goal: any) => {
    await updateGoal.mutateAsync({
      id: goal.id,
      status: 'achieved',
    });
    toast.success('Objetivo concluído!');
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal.mutateAsync(id);
    toast.success('Objetivo deletado');
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask.mutateAsync(id);
    toast.success('Tarefa deletada');
  };

  const filtered = goals.filter(g =>
    g.titulo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-24">

      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b px-4 py-3">
        <div className="flex justify-between">
          <h1 className="font-extrabold">Objetivos</h1>

          <button onClick={onNavigateTemplates}>
            <Sparkles />
          </button>
        </div>

        <input
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mt-2 w-full p-2 rounded bg-card"
        />
      </div>

      {/* LISTA */}
      <div className="p-4 space-y-3">
        {filtered.map(goal => {
          const isOpen = openGoalId === goal.id;
          const goalTasks = tasks.filter(t => t.goal_id === goal.id);

          return (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className="bg-card p-4 rounded-xl border"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{goal.titulo}</p>
                  <p className="text-xs">{goal.descricao}</p>
                </div>

                <div className="flex gap-2">
                  <Pencil
                    onClick={e => {
                      e.stopPropagation();
                      openEditGoal(goal);
                    }}
                    className="w-4 cursor-pointer"
                  />

                  <Check
                    onClick={e => {
                      e.stopPropagation();
                      completeGoal(goal);
                    }}
                    className="w-4 cursor-pointer text-green-500"
                  />

                  <Trash
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteGoal(goal.id);
                    }}
                    className="w-4 cursor-pointer text-red-500"
                  />

                  <ChevronRight
                    className={`w-4 ${isOpen ? 'rotate-90' : ''}`}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2">
                  {goalTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-secondary rounded flex justify-between"
                    >
                      <div>
                        <p className="font-bold">{task.titulo}</p>
                        <p className="text-xs">{task.descricao}</p>
                      </div>

                      <div className="flex gap-2">
                        <Pencil
                          onClick={e => {
                            e.stopPropagation();
                            openEditTask(task);
                          }}
                          className="w-4 cursor-pointer"
                        />

                        <Trash
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="w-4 cursor-pointer text-red-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL TASK */}
      <AnimatePresence>
        {editingTask && (
          <div
            className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-lg p-5 rounded-xl"
            >
              <h2 className="font-bold mb-3">Editar Tarefa</h2>

              <input
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
              />

              <textarea
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
              />

              <input
                type="time"
                value={form.horario}
                onChange={e => setForm({ ...form, horario: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
              />

              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingTask(null)}>Cancelar</button>
                <button onClick={saveTask} className="text-green-500">
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GOAL */}
      <AnimatePresence>
        {editingGoal && (
          <div
            className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
            onClick={() => setEditingGoal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-lg p-5 rounded-xl"
            >
              <h2 className="font-bold mb-3">Editar Objetivo</h2>

              <input
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                className="w-full mb-2 p-2 border rounded"
              />

              <textarea
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
              />

              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingGoal(null)}>Cancelar</button>
                <button onClick={saveGoal} className="text-green-500">
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}