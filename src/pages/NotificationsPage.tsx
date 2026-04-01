import { motion } from 'framer-motion';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationsRead } from '@/hooks/useNotifications';
import { useEffect } from 'react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationsRead();

  useEffect(() => {
    markRead.mutate();
  }, []);

  const getTimeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto pb-8">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center gap-3 pt-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="text-xl font-extrabold text-foreground">Notificações</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-2 max-w-lg mx-auto">
        {notifications.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`p-3 rounded-xl border ${!n.sent ? 'bg-cta/5 border-cta/20' : 'bg-card border-border'}`}>
            <div className="flex items-start gap-3">
              <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${!n.sent ? 'text-cta' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{getTimeAgo(n.created_at)}</span>
            </div>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="font-bold text-foreground mt-3">Tudo limpo</p>
            <p className="text-sm text-muted-foreground mt-1">Nenhuma notificação por enquanto</p>
          </div>
        )}
      </div>
    </div>
  );
}
