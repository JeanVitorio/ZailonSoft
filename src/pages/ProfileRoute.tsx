import BottomNav from '@/components/BottomNav';
import ProfilePage from '@/pages/ProfilePage';
import { useProfile } from '@/hooks/useProfile';

export default function ProfileRoute() {
  const { data: profile } = useProfile();

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <ProfilePage profile={profile} />
      <BottomNav />
    </div>
  );
}
