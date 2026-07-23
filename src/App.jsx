import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Header } from './components/common/Header';
import { Toast } from './components/common/Toast';
import { SyncIndicator } from './components/common/SyncIndicator';
import { EventInputForm } from './components/operator/EventInputForm';
import { InputHistoryTable } from './components/operator/InputHistoryTable';
import { CityManagement } from './components/admin/CityManagement';
import { UserManagement } from './components/admin/UserManagement';
import { ExecutiveDashboard } from './components/executive/ExecutiveDashboard';
import { Building2, UserCheck, Shield, BarChart3, MapPin, Loader2 } from 'lucide-react';

const MainContent = () => {
  const { currentUser, kadinCity, isSyncing, dbMode } = useAuth();
  const [editingEvent, setEditingEvent] = useState(null);

  const role = currentUser?.role || 'operator';

  // Role label & accent colors
  const roleConfig = {
    operator: {
      label: 'OPERATOR',
      desc: 'Input data harian kegiatan VR sekolah & riwayat entri.',
      dot: 'bg-emerald-500',
      ping: 'bg-emerald-500',
    },
    admin: {
      label: 'ADMIN',
      desc: 'Pengelolaan master data kota & hak akses pengguna (RBAC).',
      dot: 'bg-blue-500',
      ping: 'bg-blue-500',
    },
    pimpinan: {
      label: 'PIMPINAN',
      desc: 'Visualisasi strategis KPI, grafik per wilayah & ekspor laporan.',
      dot: 'bg-purple-500',
      ping: 'bg-purple-500',
    },
    kadin: {
      label: 'KEPALA DINAS',
      desc: `Dashboard monitoring VR wilayah tugas: ${kadinCity}.`,
      dot: 'bg-amber-500',
      ping: 'bg-amber-500',
    },
  };

  const rc = roleConfig[role] || roleConfig.operator;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header with Quick Role Switcher */}
      <Header />

      {/* Role Notice & Sub-navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Role Description Banner */}
        <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Animated status dot */}
            <div className="relative flex-shrink-0">
              <div className={`w-2.5 h-2.5 rounded-full ${rc.dot}`} />
              <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full ${rc.ping} animate-ping opacity-60`} />
            </div>

            <span className="text-xs font-semibold text-slate-300 truncate">
              Modul Aktif:{' '}
              <strong className="text-white uppercase tracking-wider">{rc.label}</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-xs text-slate-400 hidden sm:inline truncate">{rc.desc}</span>

            {/* Kadin city badge */}
            {role === 'kadin' && (
              <span className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex-shrink-0">
                <MapPin className="w-3 h-3" />
                <span>{kadinCity}</span>
              </span>
            )}
          </div>

          {/* DB sync status indicator */}
          <div className="flex-shrink-0 hidden sm:flex items-center space-x-2">
            {isSyncing && (
              <span className="flex items-center space-x-1 text-[11px] text-amber-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sinkronisasi...</span>
              </span>
            )}
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                dbMode === 'supabase'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {dbMode === 'supabase' ? '☁ Supabase' : '💾 Lokal'}
            </span>
          </div>
        </div>

        {/* ── Dynamic Role Views ── */}
        {role === 'operator' && (
          <div className="space-y-8 animate-fadeIn">
            <EventInputForm
              editingEvent={editingEvent}
              onCancelEdit={() => setEditingEvent(null)}
            />
            <InputHistoryTable
              onEditEvent={(evt) => {
                setEditingEvent(evt);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {role === 'admin' && (
          <div className="space-y-8 animate-fadeIn">
            <CityManagement />
            <UserManagement />
          </div>
        )}

        {(role === 'pimpinan' || role === 'kadin') && (
          <div className="animate-fadeIn">
            <ExecutiveDashboard />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900/80 border-t border-slate-800/80 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: copyright */}
          <span>© 2026 EduEvent VR Monitoring System. All rights reserved.</span>

          {/* Right: tech stack + sync indicator */}
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline text-slate-600">
              React · Tailwind CSS · Recharts · Supabase
            </span>
            {/* ← Live DB sync status pill */}
            <SyncIndicator />
          </div>
        </div>
      </footer>

      {/* Toast Alert */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
