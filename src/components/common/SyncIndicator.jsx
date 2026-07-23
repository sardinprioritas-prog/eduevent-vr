import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import {
  Cloud,
  CloudOff,
  Loader2,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
} from 'lucide-react';

/**
 * SyncIndicator
 * ─────────────────────────────────────────────
 * Indikator kecil di footer yang menampilkan:
 * - Status koneksi ke Supabase (online / offline / syncing)
 * - Mode database aktif (supabase / localStorage)
 * - Tombol Refresh untuk manual re-sync
 * - Panel detail yang bisa di-toggle
 */
export const SyncIndicator = () => {
  const { isOnline, isSyncing, dbMode, isSupabaseConfigured, refreshData } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // ────── Status configs ──────
  const getStatus = () => {
    if (!isSupabaseConfigured) {
      return {
        dot: 'bg-slate-500',
        label: 'Mode Lokal',
        sublabel: 'Supabase belum dikonfigurasi',
        icon: <Database className="w-3.5 h-3.5 text-slate-400" />,
        panelBorder: 'border-slate-700',
        badge: 'bg-slate-800 text-slate-400 border-slate-700',
      };
    }
    if (isSyncing || isRefreshing) {
      return {
        dot: 'bg-amber-400 animate-pulse',
        label: 'Menyinkronkan...',
        sublabel: 'Memuat data dari Supabase',
        icon: <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
        panelBorder: 'border-amber-500/30',
        badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      };
    }
    if (isOnline && dbMode === 'supabase') {
      return {
        dot: 'bg-emerald-400',
        label: 'Terhubung ke Cloud',
        sublabel: 'Data tersinkron dengan Supabase',
        icon: <Cloud className="w-3.5 h-3.5 text-emerald-400" />,
        panelBorder: 'border-emerald-500/30',
        badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      };
    }
    return {
      dot: 'bg-rose-400 animate-pulse',
      label: 'Mode Offline',
      sublabel: 'Supabase tidak terjangkau — pakai data lokal',
      icon: <CloudOff className="w-3.5 h-3.5 text-rose-400" />,
      panelBorder: 'border-rose-500/30',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    };
  };

  const status = getStatus();

  return (
    <div className="relative inline-flex flex-col items-end">
      {/* ── Collapsed pill button ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all hover:brightness-110 ${status.badge}`}
        title="Klik untuk detail koneksi database"
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
        {status.icon}
        <span>{status.label}</span>
        {expanded ? (
          <ChevronUp className="w-3 h-3 ml-0.5 opacity-60" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
        )}
      </button>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div
          className={`absolute bottom-full mb-2 right-0 w-72 bg-slate-900/95 backdrop-blur-md border ${status.panelBorder} rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Status Database
              </span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Status Rows */}
          <div className="px-4 py-3 space-y-2.5 text-xs">
            {/* Supabase Config */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Supabase dikonfigurasi</span>
              <span className={`flex items-center space-x-1 font-semibold ${isSupabaseConfigured ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isSupabaseConfigured ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /><span>Ya</span></>
                ) : (
                  <><AlertTriangle className="w-3.5 h-3.5" /><span>Belum</span></>
                )}
              </span>
            </div>

            {/* Connection */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Koneksi realtime</span>
              <span className={`flex items-center space-x-1 font-semibold ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isOnline ? (
                  <><Wifi className="w-3.5 h-3.5" /><span>Online</span></>
                ) : (
                  <><WifiOff className="w-3.5 h-3.5" /><span>Offline</span></>
                )}
              </span>
            </div>

            {/* Active Mode */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mode penyimpanan aktif</span>
              <span className={`font-bold uppercase tracking-wider ${dbMode === 'supabase' ? 'text-indigo-400' : 'text-amber-400'}`}>
                {dbMode === 'supabase' ? 'Supabase Cloud' : 'localStorage'}
              </span>
            </div>

            {/* Sub-status message */}
            <p className="text-slate-500 italic text-[10px] pt-1 border-t border-slate-800">
              {status.sublabel}
            </p>
          </div>

          {/* Actions */}
          <div className="px-4 pb-3 flex items-center justify-between gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Menyinkron...' : 'Sync Manual'}</span>
            </button>

            {!isSupabaseConfigured && (
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                Setup Supabase →
              </a>
            )}
          </div>

          {/* Setup hint when not configured */}
          {!isSupabaseConfigured && (
            <div className="mx-3 mb-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 space-y-0.5">
              <p className="font-bold">⚡ Untuk mengaktifkan cloud sync:</p>
              <p>Salin <code className="bg-slate-800 px-1 rounded">.env.example</code> → <code className="bg-slate-800 px-1 rounded">.env</code></p>
              <p>Isi dengan credentials dari Supabase Dashboard</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
