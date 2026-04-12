import { ScrollReveal } from './ScrollReveal';
import { MessageSquareQuote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'Antes eu achava que ter um site era suficiente. Depois de trabalhar com o Jean, entendi que o que eu tinha antes era só uma vitrine vazia.',
    name: 'Empresário do setor fitness',
    role: 'Dono de academia',
  },
  {
    quote: 'Em menos de 30 dias com a landing page nova, recebi mais contatos do que nos últimos 6 meses com o site antigo. Não é exagero.',
    name: 'Proprietária de clínica veterinária',
    role: 'Médica Veterinária',
  },
  {
    quote: 'O Jean não entrega um site — ele entrega uma estratégia completa. Meu faturamento online triplicou.',
    name: 'Gestor de loja de veículos',
    role: 'Diretor Comercial',
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-36 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 font-bold text-ember">
            Prova social
          </p>
        </ScrollReveal>
        <ScrollReveal delay={150}>
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[0.85] mb-14 sm:mb-24">
            O que dizem quem<br />
            <span className="text-gradient-ember">já confiou.</span>
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <ScrollReveal key={i} delay={250 + i * 200}>
              <div className="glass-card-v2 p-6 sm:p-8 rounded-xl h-full flex flex-col group hover:border-ember/25 transition-all duration-500">
                <MessageSquareQuote className="w-8 h-8 sm:w-10 sm:h-10 text-ember mb-5 opacity-60" />
                <blockquote className="text-sm sm:text-base md:text-lg leading-relaxed text-foreground flex-1 italic font-medium mb-6">
                  "{t.quote}"
                </blockquote>
                <div className="pt-4 border-t" style={{ borderColor: 'oklch(1 0 0 / 0.08)' }}>
                  <p className="text-sm sm:text-base font-black text-foreground">{t.name}</p>
                  <p className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-ember font-bold mt-1">{t.role}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
