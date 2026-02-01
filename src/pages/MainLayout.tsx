import React from 'react';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-black font-poppins text-slate-50">
      {/* Topbar com tema Dark/Emerald */}
      <header className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 font-semibold text-emerald-400">
          Zailon
        </div>
      </header>
      
      {/* O Outlet será renderizado sobre o fundo bg-slate-950 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}