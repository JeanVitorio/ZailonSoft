import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Product = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
          Nossa Plataforma
        </h2>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Descubra nossa poderosa plataforma que revoluciona a forma como você gerencia seus projetos.
          Acesse agora e experimente todas as funcionalidades disponíveis.
        </p>
        <div className="flex justify-center">
          <Button
            asChild
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            <Link to="/Nilo">Acessar Plataforma</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Product;