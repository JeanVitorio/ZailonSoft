import { useXylonStore } from '@/store/useXylonStore';
import BottomNav from '@/components/BottomNav';
import ProfilePage from '@/pages/ProfilePage';

export default function ProfileRoute() {
  const { stats } = useXylonStore();

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <ProfilePage stats={stats} />
      <BottomNav />
    </div>
  );
}
