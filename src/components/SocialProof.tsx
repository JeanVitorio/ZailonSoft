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
          "from-orange-400 to-red-500",
          "from-amber-400 to-orange-500",
          "from-rose-400 to-pink-500",
          "from-orange-500 to-amber-600",
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
          +40 empresas confiam na Zailonsoft
        </p>
      </div>
    </motion.div>
  );
};
