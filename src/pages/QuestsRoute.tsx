import BottomNav from '@/components/BottomNav';
import QuestsPage from '@/pages/QuestsPage';

export default function QuestsRoute() {
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      <QuestsPage />
      <BottomNav />
    </div>
  );
}
