import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send } from 'lucide-react';
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
      <div className="flex items-center gap-1">
        {reactionCounts.map(r => (
          <motion.button
            key={r.tipo}
            whileTap={{ scale: 0.85 }}
            onClick={() => toggleReaction.mutate({ postId, tipo: r.tipo })}
            className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs transition-all ${
              r.myReaction ? 'bg-cta/20 ring-1 ring-cta/30' : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <span className="text-sm">{r.emoji}</span>
            {r.count > 0 && <span className="font-bold text-foreground">{r.count}</span>}
          </motion.button>
        ))}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs ml-auto"
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
              <div key={c.id} className="flex items-start gap-2 bg-secondary/50 rounded-xl px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs shrink-0 overflow-hidden">
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
                className="flex-1 px-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-cta/30"
              />
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleSubmitComment}
                className="p-2 rounded-xl gradient-cta">
                <Send className="w-3.5 h-3.5 text-accent-foreground" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
