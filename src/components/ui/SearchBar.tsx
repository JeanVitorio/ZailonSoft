import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar veículos...",
  onFilterClick,
  showFilterButton = true
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className={`relative flex items-center gap-2 transition-all duration-300 ${
        isFocused ? 'scale-[1.01]' : ''
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`relative flex-1 ${isFocused ? 'glow-amber' : ''} rounded-xl transition-all duration-300`}>
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
          isFocused ? 'text-amber-400' : 'text-muted-foreground'
        }`} />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-12 pr-10 h-14 text-base"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {showFilterButton && onFilterClick && (
        <Button
          variant="glass"
          size="icon"
          onClick={onFilterClick}
          className="h-14 w-14 shrink-0"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      )}
    </motion.div>
  );
};
