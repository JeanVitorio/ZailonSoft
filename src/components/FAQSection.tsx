import { ScrollReveal } from './ScrollReveal';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Quanto tempo leva para ficar pronto?',
    a: 'Depende do escopo. Uma Landing Page de alta conversão fica pronta em 7 a 14 dias. Sites institucionais de 14 a 30 dias. Soluções web personalizadas são avaliadas individualmente.',
  },
  {
    q: 'Qual o investimento?',
    a: 'Cada projeto é único e recebe um orçamento personalizado. Trabalho com valores justos que refletem a qualidade e o retorno que você vai ter. Entre em contato para um diagnóstico gratuito.',
  },
  {
    q: 'Vocês fazem manutenção depois?',
    a: 'Sim. Ofereço suporte e acompanhamento pós-entrega. Seu projeto não termina no deploy — ele precisa performar, e eu garanto isso.',
  },
  {
    q: 'E se eu não gostar do resultado?',
    a: 'Trabalho com revisões durante todo o processo. Você acompanha cada etapa e valida antes de avançar. O resultado final é sempre alinhado com sua visão.',
  },
  {
    q: 'Atende qualquer nicho?',
    a: 'Sim. Já atendi academias, clínicas, lojas de veículos, empresas de tecnologia, seguradoras e muito mais. O método se adapta ao seu mercado.',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember text-center">
            Perguntas frequentes
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-14 sm:mb-20 text-center">
            Tire suas<br />
            <span className="text-gradient-ember">dúvidas.</span>
          </h2>
        </ScrollReveal>

        <div className="space-y-3 sm:space-y-4">
          {FAQS.map((faq, i) => (
            <ScrollReveal key={i} delay={200 + i * 100}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="glass-card-v2 w-full text-left p-5 sm:p-6 rounded-xl transition-all duration-500 hover:border-ember/25"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground">{faq.q}</h3>
                  <ChevronDown className={`w-5 h-5 text-ember shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
                </div>
                <div className={`overflow-hidden transition-all duration-500 ${open === i ? 'max-h-40 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-sm sm:text-base leading-relaxed text-steel">{faq.a}</p>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
