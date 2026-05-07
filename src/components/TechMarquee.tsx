const TECHS = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Supabase",
  "Stripe", "Framer Motion", "Vite", "Figma", "Vercel", "Python"
];

export const TechMarquee = () => {
  const items = [...TECHS, ...TECHS];
  return (
    <div className="relative w-full overflow-hidden py-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max gap-10 animate-marquee">
        {items.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border/70 bg-card/40 px-5 py-2 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary))]" />
            <span className="text-sm font-medium text-foreground/85">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
