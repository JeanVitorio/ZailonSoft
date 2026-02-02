import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-muted-foreground/60 transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
