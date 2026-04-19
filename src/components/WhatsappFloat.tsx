import { MessageCircle } from "lucide-react";

const PHONE = "5546991163405";
const MESSAGE = "Olá Jean! Vi o site da Zailonsoft e quero saber mais sobre como vocês podem aumentar minhas vendas.";

export const whatsappLink = (msg: string = MESSAGE) =>
  `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;

export const WhatsappFloat = () => {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-4 text-white shadow-elevated transition-all hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(37,211,102,0.6)]"
    >
      <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full" />
      <MessageCircle className="h-6 w-6" strokeWidth={2.2} />
      <span className="hidden font-semibold sm:inline">Fale no WhatsApp</span>
    </a>
  );
};
