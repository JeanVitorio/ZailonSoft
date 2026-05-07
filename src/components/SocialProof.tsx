import { motion } from "framer-motion";
import { Star } from "lucide-react";

export const SocialProof = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6"
    >
      <div className="flex -space-x-2">
        {[
          "from-cyan-400 to-emerald-500",
          "from-emerald-400 to-teal-500",
          "from-sky-400 to-cyan-500",
          "from-teal-400 to-cyan-600",
        ].map((g, i) => (
          <div
            key={i}
            className={`h-9 w-9 rounded-full border-2 border-background bg-gradient-to-br ${g}`}
          />
        ))}
      </div>
      <div className="flex flex-col items-center gap-0.5 sm:items-start">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
          ))}
          <span className="ml-1.5 font-semibold text-foreground">4.9</span>
        </div>
        <p className="text-xs text-muted-foreground">
          +50 empresas confiam na JVS
        </p>
      </div>
    </motion.div>
  );
};
