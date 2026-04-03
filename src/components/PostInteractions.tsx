import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Heart } from 'lucide-react';
import { usePostReactions, usePostComments, useToggleReaction, useAddComment } from '@/hooks/useReactions';
import { useAuth } from '@/contexts/AuthContext';

const REACTION_TYPES = [
  { tipo: 'like', emoji: '👍' },
  { tipo: 'heart', emoji: '❤️' },
  { tipo: 'fire', emoji: '🔥' },
  { tipo: 'clap', emoji: '👏' },
  { tipo: 'rocket', emoji: '🚀' },
];

interface PostInteractionsProps {
  postId: string;
}

export default function PostInteractions({ postId }: PostInteractionsProps) {
  const { user } = useAuth();
  const { data: reactions = [] } = usePostReactions(postId);
  const { data: comments = [] } = usePostComments(postId);
  const toggleReaction = useToggleReaction();
  const addComment = useAddComment();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const reactionCounts = REACTION_TYPES.map(r => ({
    ...r,
    count: reactions.filter(rx => rx.tipo === r.tipo).length,
    myReaction: reactions.some(rx => rx.tipo === r.tipo && rx.user_id === user?.id),
  }));

  const totalReactions = reactions.length;

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate({ postId, conteudo: commentText.trim() });
    setCommentText('');
  };

  const isEmoji = (s: string) => s.length <= 4 && /\p{Emoji}/u.test(s);

  return (
    <div className="mt-3 space-y-2">
      {/* Reaction bar */}
      <div className="flex items-center gap-1.5">
        {reactionCounts.map(r => (
          <motion.button
            key={r.tipo}
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleReaction.mutate({ postId, tipo: r.tipo })}
            className={`flex items-center gap-0.5 px-2.5 py-1.5 rounded-full text-xs transition-all duration-300 ${
              r.myReaction ? 'bg-primary/15 ring-1 ring-primary/30' : 'glass-card hover:bg-secondary/80'
            }`}
          >
            <motion.span
              className="text-sm"
              animate={r.myReaction ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {r.emoji}
            </motion.span>
            {r.count > 0 && <span className="font-bold text-foreground">{r.count}</span>}
          </motion.button>
        ))}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full glass-card text-xs ml-auto hover:bg-secondary/80 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
          {comments.length > 0 && <span className="font-bold text-foreground">{comments.length}</span>}
        </button>
      </div>

      {totalReactions > 0 && (
        <p className="text-[10px] text-muted-foreground px-1">
          {totalReactions} {totalReactions === 1 ? 'pessoa reagiu' : 'pessoas reagiram'}
        </p>
      )}

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2 glass-card rounded-xl px-3 py-2.5">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs shrink-0 overflow-hidden">
                  {c.profiles?.avatar_url && isEmoji(c.profiles.avatar_url)
                    ? c.profiles.avatar_url
                    : c.profiles?.avatar_url
                    ? <img src={c.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    : '🦁'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-foreground">{c.profiles?.nome ?? 'Usuário'}</span>
                  <p className="text-xs text-muted-foreground">{c.conteudo}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                placeholder="Comentar..."
                className="flex-1 px-3.5 py-2.5 rounded-xl glass-card text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleSubmitComment}
                className="p-2.5 rounded-xl gradient-cta shadow-lg shadow-accent/20">
                <Send className="w-3.5 h-3.5 text-accent-foreground" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
