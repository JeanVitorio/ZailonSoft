import { useQueryClient } from '@tanstack/react-query';
import BottomNav from '@/components/BottomNav';
import FeedPage from '@/pages/FeedPage';
import { useFeed } from '@/hooks/useFeed';
import { useProfile } from '@/hooks/useProfile';
import { useState } from 'react';

export default function Index() {
  const { data: posts = [], refetch, isRefetching } = useFeed();
  const { data: profile } = useProfile();
  const [manualRefresh, setManualRefresh] = useState(false);

  const handleRefresh = () => {
    setManualRefresh(true);
    refetch().finally(() => setTimeout(() => setManualRefresh(false), 500));
  };

  const stats = profile ? {
    xpTotal: profile.xp,
    streak: profile.streak,
    level: profile.level,
  } : { xpTotal: 0, streak: 0, level: 1 };

  return (
    <div className="w-full min-h-[100dvh] bg-background gradient-mesh noise-bg max-w-lg mx-auto relative overflow-x-hidden flex flex-col pb-20">
      <FeedPage
        posts={posts}
        stats={stats}
        onRefresh={handleRefresh}
        isRefreshing={isRefetching || manualRefresh}
      />
      <BottomNav />
    </div>
  );
}
