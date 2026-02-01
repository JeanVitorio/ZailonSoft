import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative glass-card rounded-xl p-2">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-foreground" />
      <Input
        type="text"
        placeholder="Buscar por nome, modelo ou ano..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 text-base bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:ring-0 rounded-lg"
      />
    </div>
  );
}
