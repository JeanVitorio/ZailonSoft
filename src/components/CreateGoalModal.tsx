import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateGoal } from '@/hooks/useCreateGoal';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateGoalModal({ open, onClose }: Props) {
  const createGoal = useCreateGoal();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [emoji, setEmoji] = useState('⚔️');

  const handleCreate = async () => {
    if (!titulo) return alert('Digite um título');

    await createGoal.mutateAsync({
      titulo,
      descricao,
      emoji,
    });

    setTitulo('');
    setDescricao('');
    setEmoji('⚔️');

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-card w-full max-w-sm rounded-2xl p-4 space-y-4"
          >
            <h2 className="text-lg font-bold">Novo Objetivo</h2>

            <input
              placeholder="Título"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full p-2 rounded bg-background border"
            />

            <input
              placeholder="Emoji"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              className="w-full p-2 rounded bg-background border"
            />

            <textarea
              placeholder="Descrição"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full p-2 rounded bg-background border"
            />

            <div className="flex justify-end gap-2">
              <button onClick={onClose}>Cancelar</button>
              <button
                onClick={handleCreate}
                className="bg-primary px-4 py-2 rounded text-white"
              >
                Criar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}