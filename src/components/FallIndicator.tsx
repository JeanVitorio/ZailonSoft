import { motion, useScroll, useTransform } from "framer-motion";

/**
 * FallIndicator — barra lateral que mostra a "profundidade da queda".
 * Reforça a metáfora de estar caindo em um universo.
 */
export const FallIndicator = () => {
  const { scrollYProgress } = useScroll();
  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const depth = useTransform(scrollYProgress, [0, 1], [0, 9999]);

  return (
    <div className="pointer-events-none fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
            queda
          </span>
          <motion.span className="font-display text-sm tabular-nums text-primary">
            {useTransform(depth, (v) => `${Math.round(v)}m`)}
          </motion.span>
        </div>
        <div className="relative h-40 w-[2px] overflow-hidden bg-border">
          <motion.div
            style={{ height }}
            className="absolute left-0 top-0 w-full bg-gradient-orange"
          />
        </div>
      </div>
    </div>
  );
};
