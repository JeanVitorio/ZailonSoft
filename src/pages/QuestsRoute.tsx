import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import QuestsPage from '@/pages/QuestsPage';
import QuestTemplatesPage from '@/pages/QuestTemplatesPage';

export default function QuestsRoute() {
  const [view, setView] = useState<'list' | 'templates'>('list');

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {view === 'list' ? (
        <QuestsPage onNavigateTemplates={() => setView('templates')} />
      ) : (
        <QuestTemplatesPage />
      )}
      <BottomNav />
    </div>
  );
}
