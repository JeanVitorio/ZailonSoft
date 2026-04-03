import { useRef, useCallback } from 'react';
import { Download, Share2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { CommunityPost } from '@/types/zailon';
import PostInteractions from '@/components/PostInteractions';
import { useAuth } from '@/contexts/AuthContext';

interface AchievementCardProps {
  post: CommunityPost;
  index: number;
  onDelete?: (postId: string) => void;
}

export default function AchievementCard({ post, index, onDelete }: AchievementCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const profile = post.profiles;
  const meta = post.metadata ?? {};
  const cardColor = meta.card_color || '#1a1a2e';
  const cardImage = meta.card_image_url;
  const isOwner = user?.id === post.user_id;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true, pixelRatio: 3, backgroundColor: cardColor,
        style: { borderRadius: '0' },
      });
      const link = document.createElement('a');
      link.download = `zailon-${profile?.nome ?? 'card'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error('Erro ao baixar card:', err); }
  }, [profile?.nome, cardColor]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'zailon-achievement.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        const shareUrl = `${window.location.origin}/u/${profile?.username || post.user_id}`;
        await navigator.share({
          title: `${profile?.nome ?? 'Usuário'} no Zailon`,
          text: post.conteudo, url: shareUrl, files: [file],
        });
      } else {
        handleDownload();
      }
    } catch { handleDownload(); }
  }, [post, profile, handleDownload]);

  const timeAgo = getTimeAgo(post.created_at);
  const isEmoji = (s: string) => s.length <= 4 && /\p{Emoji}/u.test(s);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Downloadable card */}
      <div ref={cardRef} className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: cardColor }}>
        <div className="relative aspect-[4/5] overflow-hidden">
          {cardImage ? (
            <img src={cardImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${cardColor}, ${adjustBrightness(cardColor, 40)})` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {meta.xp_earned && (
            <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20">
              <span className="text-sm font-extrabold text-white">+{meta.xp_earned} XP</span>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5">
            {meta.task_titulo && (
              <p className="text-white font-extrabold text-xl leading-tight drop-shadow-lg mb-4">
                ✅ {meta.task_titulo}
              </p>
            )}

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-xl border-2 border-white/30 overflow-hidden shrink-0">
                {profile?.avatar_url && isEmoji(profile.avatar_url) ? profile.avatar_url
                  : profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-white truncate">{profile?.nome ?? 'Usuário'}</p>
                <p className="text-[11px] text-white/60">Nível {profile?.level ?? 1} · {timeAgo}</p>
              </div>
            </div>

            <p className="text-sm text-white/80 mt-3 leading-relaxed">{post.conteudo}</p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Zailon</span>
              {meta.pontos_earned && (
                <span className="text-[10px] font-bold text-white/40">+{meta.pontos_earned} pts</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex gap-2">
          {isOwner && onDelete && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(post.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
              <Trash2 className="w-3.5 h-3.5" /> Apagar
            </motion.button>
          )}
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
            <Download className="w-3.5 h-3.5" /> Baixar
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full gradient-cta text-accent-foreground text-xs font-semibold">
            <Share2 className="w-3.5 h-3.5" /> Compartilhar
          </motion.button>
        </div>
      </div>

      <PostInteractions postId={post.id} />
    </motion.div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

function adjustBrightness(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xFF) + amount);
    const g = Math.min(255, ((num >> 8) & 0xFF) + amount);
    const b = Math.min(255, (num & 0xFF) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  } catch { return hex; }
}
