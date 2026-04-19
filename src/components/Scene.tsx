import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface SceneProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Scene — bloco fullscreen com parallax e fade-in conforme entra no viewport.
 * Cria a sensação de "câmaras" no universo digital.
 */
export const Scene = ({ children, className = "", id }: SceneProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section
      ref={ref}
      id={id}
      className={`relative flex min-h-screen items-center justify-center px-6 py-32 ${className}`}
    >
      <motion.div
        style={{ opacity, y, scale }}
        className="relative z-10 mx-auto w-full max-w-6xl"
      >
        {children}
      </motion.div>
    </section>
  );
};
