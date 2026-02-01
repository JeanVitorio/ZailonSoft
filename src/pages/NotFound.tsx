import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import * as Feather from 'react-feather';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-poppins">
      <div className="flex flex-col items-center text-center">
        
        {/* Ícone */}
        <div className="mb-4 rounded-full bg-slate-800 p-5 ring-4 ring-slate-700">
          <Feather.AlertTriangle className="h-12 w-12 text-red-400" />
        </div>

        {/* Texto */}
        <h1 className="text-6xl font-extrabold text-emerald-400">404</h1>
        <p className="mt-2 text-xl text-slate-400">
          Oops! Página não encontrada.
        </p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          A rota que você tentou acessar (`{location.pathname}`) não existe ou foi movida.
        </p>
        
        {/* Botão de Retorno */}
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-emerald-400 transition-colors hover:bg-slate-700 hover:text-emerald-300"
        >
          <Feather.Home className="h-4 w-4" />
          Voltar para o Início
        </Link>

      </div>
    </div>
  );
};

export default NotFound;