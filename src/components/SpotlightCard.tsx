import { useCallback, type HTMLAttributes, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & { children: React.ReactNode };

/**
 * Wrap any card with mouse-tracked spotlight glow.
 * Sets --mx / --my CSS vars consumed by .spotlight::before.
 */
export const SpotlightCard = ({ children, className, ...rest }: Props) => {
  const onMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div onMouseMove={onMove} className={cn("spotlight", className)} {...rest}>
      {children}
    </div>
  );
};
