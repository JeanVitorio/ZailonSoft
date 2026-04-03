import { useRef, useCallback } from 'react';
import { Download, Share2, Trash2, ExternalLink } from 'lucide-react';
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
  const cardColor = meta.card_color || '#0a1628';
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full"
    >
      {/* Downloadable card */}
      <div ref={cardRef} className="rounded-2xl overflow-hidden shadow-2xl relative group" style={{ backgroundColor: cardColor }}>
        <div className="relative aspect-[4/5] overflow-hidden">
          {cardImage ? (
            <img src={cardImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{
              background: `linear-gradient(145deg, ${cardColor}, ${adjustBrightness(cardColor, 25)})`,
            }}>
              {/* Decorative elements */}
              <div className="absolute top-8 right-8 w-40 h-40 rounded-full opacity-[0.06]"
                style={{ background: `radial-gradient(circle, hsl(160 84% 39%), transparent)` }} />
              <div className="absolute bottom-20 left-4 w-32 h-32 rounded-full opacity-[0.04]"
                style={{ background: `radial-gradient(circle, hsl(25 95% 53%), transparent)` }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          {meta.xp_earned && (
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.08 + 0.3, type: 'spring' }}
              className="absolute top-4 right-4 glass-card rounded-full px-4 py-1.5"
            >
              <span className="text-sm font-extrabold text-gradient-primary">+{meta.xp_earned} XP</span>
            </motion.div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-5">
            {meta.task_titulo && (
              <p className="text-white font-extrabold text-xl leading-tight drop-shadow-lg mb-4">
                ✅ {meta.task_titulo}
              </p>
            )}

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-xl border-2 border-white/20 overflow-hidden shrink-0">
                {profile?.avatar_url && isEmoji(profile.avatar_url) ? profile.avatar_url
                  : profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  : '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-white truncate">{profile?.nome ?? 'Usuário'}</p>
                <p className="text-[11px] text-white/50 font-medium">Nível {profile?.level ?? 1} · {timeAgo}</p>
              </div>
            </div>

            <p className="text-sm text-white/75 mt-3 leading-relaxed">{post.conteudo}</p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/8">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center">
                  <span className="text-[8px] font-black text-primary-foreground">Z</span>
                </div>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Zailon</span>
              </div>
              {meta.pontos_earned && (
                <span className="text-[10px] font-bold text-white/30">+{meta.pontos_earned} pts</span>
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/15 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Apagar
            </motion.button>
          )}
        </div>
        <div className="flex gap-2">
          <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.02 }} onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-card text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors">
            <Download className="w-3.5 h-3.5" /> Baixar
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.02 }} onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full gradient-cta text-accent-foreground text-xs font-semibold shadow-lg shadow-accent/20">
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
