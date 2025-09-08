import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-zinc-50"
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold text-zinc-900 mb-4">404</h1>
        <p className="text-xl text-zinc-600 mb-8">Página não encontrada</p>
        <Link
          to="/"
          className="inline-block bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-all"
        >
          Voltar para a Home
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFoundPage;