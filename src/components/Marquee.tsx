/**
 * Marquee — faixa de texto contínua, linguagem editorial brutalista.
 */
export const Marquee = ({ items }: { items: string[] }) => {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div className="relative w-full overflow-hidden border-y border-border/40 bg-background/40 py-6 backdrop-blur-sm">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="font-display mx-8 text-3xl uppercase text-foreground/80 md:text-5xl"
          >
            {item}
            <span className="mx-8 inline-block text-primary">/</span>
          </span>
        ))}
      </div>
    </div>
  );
};
