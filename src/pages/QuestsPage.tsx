import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Trash2,
  Pencil,
  ChevronDown,
  Plus
} from 'lucide-react';

import { useGoals } from '@/hooks/useGoals';
import { useTasks } from '@/hooks/useTasks';
import { useDeleteGoal } from '@/hooks/useDeleteGoal';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { useUpdateGoal } from '@/hooks/useUpdateGoal';

import CreateGoalModal from '@/components/CreateGoalModal';

export default function QuestsPage() {
  const navigate = useNavigate();

  const { data: goals } = useGoals();
  const { data: tasks } = useTasks();

  const deleteGoal = useDeleteGoal();
  const deleteTask = useDeleteTask();
  const updateGoal = useUpdateGoal();

  const [openGoalId, setOpenGoalId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const tasksByGoal = (goalId: string) =>
    tasks?.filter(t => t.goal_id === goalId) || [];

  const handleToggleGoal = (goalId: string) => {
    setOpenGoalId(prev => (prev === goalId ? null : goalId));
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Excluir objetivo e todas tarefas?')) return;
    await deleteGoal.mutateAsync(goalId);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Excluir tarefa?')) return;
    await deleteTask.mutateAsync(taskId);
  };

  const handleCompleteGoal = async (goal: any) => {
    if (!confirm('Tem certeza que deseja concluir este objetivo?')) return;

    await updateGoal.mutateAsync({
      id: goal.id,
      concluido: !goal.concluido,
    });
  };

  return (
    <div className="w-full min-h-[100dvh] bg-background max-w-lg mx-auto flex flex-col">

      {/* HEADER */}
      <div className="px-4 pt-6 pb-4 border-b border-border flex justify-between items-center">
        <h1 className="text-xl font-extrabold">Objetivos</h1>

        <Plus
          onClick={() => setOpenModal(true)}
          className="w-6 h-6 cursor-pointer"
        />
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">

        {goals?.map(goal => {
          const goalTasks = tasksByGoal(goal.id);
          const isOpen = openGoalId === goal.id;

          return (
            <div key={goal.id} className="bg-card rounded-2xl p-4">

              {/* HEADER OBJETIVO */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleToggleGoal(goal.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{goal.emoji}</span>
                  <p className="font-bold">{goal.titulo}</p>
                </div>

                <div className="flex items-center gap-2">

                  <CheckCircle2
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompleteGoal(goal);
                    }}
                    className={`w-5 h-5 ${
                      goal.concluido
                        ? 'text-green-500'
                        : 'text-muted-foreground'
                    }`}
                  />

                  <Pencil
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/goals/edit/${goal.id}`);
                    }}
                    className="w-4 h-4"
                  />

                  <Trash2
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGoal(goal.id);
                    }}
                    className="w-4 h-4 text-red-500"
                  />

                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* TASKS */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2 overflow-hidden"
                  >
                    {goalTasks.map(task => (
                      <motion.div
                        key={task.id}
                        whileTap={{ scale: 0.97 }}
                        className="card-game flex justify-between px-4 py-3 rounded-xl cursor-pointer"
                        style={{ background: task.card_color || '#111' }}
                        onClick={() => navigate(`/tasks?taskId=${task.id}`)}
                      >
                        <p className="text-white font-semibold">
                          {task.titulo}
                        </p>

                        <div className="flex gap-2">

                          <Pencil
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tasks/edit/${task.id}`);
                            }}
                            className="w-4 h-4 text-white"
                          />

                          <Trash2
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            className="w-4 h-4 text-red-400"
                          />
                        </div>
                      </motion.div>
                    ))}

                    {goalTasks.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Nenhuma tarefa ainda
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      <CreateGoalModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}