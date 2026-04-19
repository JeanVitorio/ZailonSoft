import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Quanto tempo leva para entregar um projeto?",
    a: "Landing pages ficam prontas em 2 a 3 semanas. Sites institucionais em 4 a 6 semanas. Sistemas e e-commerces variam de 6 a 12 semanas, conforme escopo. Você acompanha tudo em tempo real.",
  },
  {
    q: "Quanto custa um site da Zailonsoft?",
    a: "Cada projeto é único. Investimentos começam em R$ 2.500 para landing pages, R$ 5.000 para sites institucionais e variam para sistemas. O orçamento é gratuito — fale com a gente no WhatsApp.",
  },
  {
    q: "E se eu não gostar do resultado?",
    a: "Trabalhamos com etapas de aprovação. Você valida wireframe, design e cada entrega antes da próxima. Revisões fazem parte do processo. Nosso compromisso é com seu resultado.",
  },
  {
    q: "Vocês dão suporte depois da entrega?",
    a: "Sim. Todo projeto inclui 30 dias de suporte gratuito. Após esse período, oferecemos planos mensais de manutenção, evolução e otimização contínua.",
  },
  {
    q: "Vocês também fazem o tráfego pago e SEO?",
    a: "Construímos sites já preparados para SEO técnico e otimização de conversão. Para gestão de tráfego pago, indicamos parceiros de confiança ou trabalhamos em conjunto com sua agência.",
  },
  {
    q: "Trabalham com empresas pequenas?",
    a: "Sim. Atendemos desde negócios locais até indústrias. O critério é o compromisso com o resultado — se você quer crescer de verdade, somos a parceria certa.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="container-tight">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            ◆ Dúvidas frequentes
          </span>
          <h2 className="mt-3 font-display text-4xl text-balance md:text-5xl">
            Tudo que você precisa{" "}
            <span className="gradient-text">saber antes</span>
          </h2>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mt-12 space-y-3"
        >
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="overflow-hidden rounded-xl border border-border bg-gradient-card px-6 shadow-card data-[state=open]:border-primary/40"
            >
              <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
