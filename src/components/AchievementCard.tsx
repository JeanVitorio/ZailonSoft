import { useRef, useCallback } from 'react';
import { Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { CommunityPost } from '@/types/zailon';
import heroWarrior from '@/assets/hero-warrior.jpg';
import crownBadge from '@/assets/crown-badge.png';
import medalBadge from '@/assets/medal-badge.png';

interface AchievementCardProps {
  post: CommunityPost;
  index: number;
}

export default function AchievementCard({ post, index }: AchievementCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const profile = post.profiles;
  const meta = post.metadata ?? {};

  const badgeImage = meta.badge?.includes('Rei') ? crownBadge : medalBadge;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `zailon-${profile?.nome ?? 'card'}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao baixar card:', err);
    }
  }, [profile?.nome]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'zailon-achievement.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${profile?.nome ?? 'Guerreiro'} no Zailon`,
          text: post.conteudo,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      handleDownload();
    }
  }, [post, profile, handleDownload]);

  const timeAgo = getTimeAgo(post.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Downloadable card area */}
      <div
        ref={cardRef}
        className="bg-card rounded-xl overflow-hidden card-shadow border border-border"
      >
        {/* Hero image area */}
        <div className="relative h-36 overflow-hidden">
          <img
            src={heroWarrior}
            alt="Achievement hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />

          {/* XP badge */}
          {meta.xp_earned && (
            <div className="absolute top-3 right-3 bg-xp/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <span className="text-xs font-extrabold text-navy">+{meta.xp_earned} XP</span>
            </div>
          )}

          {/* Badge icon */}
          {meta.badge && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <img src={badgeImage} alt="badge" className="w-8 h-8" loading="lazy" width={32} height={32} />
              <span className="text-sm font-bold text-navy bg-card/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                {meta.badge}
              </span>
            </div>
          )}

          {/* Zailon watermark */}
          <div className="absolute bottom-3 right-3">
            <span className="text-[10px] font-bold text-navy/50">ZAILON</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-lg">
              {profile?.avatar_url && profile.avatar_url.length <= 4 ? profile.avatar_url : '🦁'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{profile?.nome ?? 'Guerreiro'}</p>
              <p className="text-[11px] text-muted-foreground">{timeAgo}</p>
            </div>
          </div>

          {meta.task_titulo && (
            <p className="text-sm font-semibold text-foreground mb-1">
              Concluiu: {meta.task_titulo}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{post.conteudo}</p>
        </div>
      </div>

      {/* Action buttons (outside downloadable area) */}
      <div className="flex items-center justify-end gap-2 mt-2 px-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold"
        >
          <Download className="w-3.5 h-3.5" />
          Baixar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-cta text-accent-foreground text-xs font-semibold"
        >
          <Share2 className="w-3.5 h-3.5" />
          Compartilhar
        </motion.button>
      </div>
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
