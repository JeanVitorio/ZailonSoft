import { useState } from 'react';
import { Search, UserPlus, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchUsers, useFollowing, useFollowUser } from '@/hooks/useFriends';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function UserSearch() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const { data: results = [] } = useSearchUsers(query);
  const { data: following = [] } = useFollowing();
  const followUser = useFollowUser();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEmoji = (s: string) => s.length <= 4 && /\p{Emoji}/u.test(s);
  const showResults = focused && query.trim().length >= 2;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Pesquisar usuários..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        />
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto"
          >
            {results.length === 0 ? (
              <p className="p-3 text-xs text-muted-foreground text-center">Nenhum usuário encontrado</p>
            ) : (
              results.filter(r => r.id !== user?.id).map(r => {
                const isFollowing = following.includes(r.id);
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors">
                    <button onClick={() => navigate(`/u/${r.username || r.id}`)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-base shrink-0 overflow-hidden">
                        {isEmoji(r.avatar_url) ? r.avatar_url : r.avatar_url ? (
                          <img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : '🦁'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{r.nome}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {r.username ? `@${r.username}` : ''} · Nível {r.level}
                        </p>
                      </div>
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => followUser.mutate(r.id)}
                      className={`p-2 rounded-lg ${isFollowing ? 'bg-xp/20' : 'bg-cta/10'}`}
                    >
                      {isFollowing ? (
                        <UserCheck className="w-4 h-4 text-xp" />
                      ) : (
                        <UserPlus className="w-4 h-4 text-cta" />
                      )}
                    </motion.button>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
