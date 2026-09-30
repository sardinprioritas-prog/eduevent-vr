import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import {
  Lock,
  LockOpen,
  Calendar,
  Shield,
  Trash2,
  Plus,
  School,
  Info,
  CheckCircle,
  AlertTriangle,
  Pencil,
  X,
} from 'lucide-react';

// ── Konstanta ────────────────────────────────────────────────────
const OCTOBER_YEAR = 2026;
const OCTOBER_MONTH = 9; // 0-indexed

const isWeekend = (day) => {
  const date = new Date(OCTOBER_YEAR, OCTOBER_MONTH, day);
  const dow = date.getDay();
  return dow === 0 || dow === 6;
};

const buildOctoberDays = () => {
  const days = [];
  const firstDayOfMonth = new Date(OCTOBER_YEAR, OCTOBER_MONTH, 1).getDay();
  const startPad = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= 31; d++) days.push(d);
  return days;
};

// ── Komponen Utama ───────────────────────────────────────────────
export const DateLockManagement = () => {
  const {
    dateLocks,
    handleSaveDateLock,
    handleDeleteDateLock,
    schoolRegistrations,
    currentUser,
  } = useAuth();

  const [selectedDay, setSelectedDay] = useState(null);
  const [showLockForm, setShowLockForm] = useState(false);
  const [editingLock, setEditingLock] = useState(null);
  const [formSchoolName, setFormSchoolName] = useState('');
  const [formNote, setFormNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const days = useMemo(() => buildOctoberDays(), []);

  // Map: day → lock object
  const lockMap = useMemo(() => {
    const map = {};
    dateLocks.forEach((lock) => {
      if (lock.month === 10 && lock.year === 2026) {
        map[lock.day] = lock;
      }
    });
    return map;
  }, [dateLocks]);

  // Map: sekolah yang sudah mendaftar dengan selectedDates
  const bookedSchoolsMap = useMemo(() => {
    const map = {};
    schoolRegistrations.forEach((reg) => {
      (reg.selectedDates || []).forEach((d) => {
        if (!map[d]) map[d] = [];
        map[d].push(reg.schoolName);
      });
    });
    return map;
  }, [schoolRegistrations]);

  // Semua nama sekolah yang mendaftar (untuk autocomplete)
  const registeredSchools = useMemo(() => {
    const names = [...new Set(schoolRegistrations.map((r) => r.schoolName))].sort();
    return names;
  }, [schoolRegistrations]);

  const handleDayClick = (day) => {
    if (!day || isWeekend(day)) return;
    setSelectedDay(day);

    const existingLock = lockMap[day];
    if (existingLock) {
      setEditingLock(existingLock);
      setFormSchoolName(existingLock.schoolName || '');
      setFormNote(existingLock.note || '');
    } else {
      setEditingLock(null);
      setFormSchoolName('');
      setFormNote('');
    }
    setShowLockForm(true);
  };

  const handleSaveLock = async () => {
    if (!selectedDay) return;
    setIsSubmitting(true);
    try {
      await handleSaveDateLock({
        ...(editingLock ? { id: editingLock.id } : {}),
        day: selectedDay,
        month: 10,
        year: 2026,
        schoolName: formSchoolName.trim() || null,
        note: formNote.trim(),
        lockedBy: currentUser?.id || null,
      });
      setShowLockForm(false);
      setSelectedDay(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveLock = async (id) => {
    if (!window.confirm('Yakin ingin membuka kunci tanggal ini?')) return;
    await handleDeleteDateLock(id);
  };

  const handleCloseForm = () => {
    setShowLockForm(false);
    setSelectedDay(null);
    setEditingLock(null);
  };

  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  const getDayStatus = (day) => {
    if (!day) return 'empty';
    if (isWeekend(day)) return 'weekend';
    if (lockMap[day]) {
      return lockMap[day].schoolName ? 'exclusive' : 'locked';
    }
    if (bookedSchoolsMap[day]?.length > 0) return 'booked';
    return 'available';
  };

  const totalLocked = dateLocks.filter((l) => l.month === 10 && l.year === 2026).length;
  const totalExclusive = dateLocks.filter((l) => l.month === 10 && l.year === 2026 && l.schoolName).length;
  const totalFullLock = totalLocked - totalExclusive;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <Shield className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Akses Keamanan Tanggal</h2>
            <p className="text-xs text-slate-400 mt-0.5">Kunci tanggal kegiatan — eksklusif untuk 1 sekolah atau blok penuh</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Dikunci', value: totalLocked, color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/50' },
          { label: 'Dikunci Total', value: totalFullLock, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/50' },
          { label: 'Eksklusif Sekolah', value: totalExclusive, color: 'text-indigo-400', bg: 'bg-indigo-950/40 border-indigo-800/50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-xl border p-3 ${bg}`}>
            <p className={`text-xl font-extrabold ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Panduan */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-blue-950/30 border border-blue-500/20">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-300/90 leading-relaxed space-y-1">
          <p><strong className="text-blue-200">Klik tanggal</strong> di kalender untuk mengunci / mengedit / membuka kunci.</p>
          <p>🔴 <strong>Dikunci Total</strong> — tidak ada sekolah yang bisa memilih tanggal ini.</p>
          <p>🟣 <strong>Eksklusif</strong> — hanya sekolah yang ditunjuk yang bisa memilih tanggal ini.</p>
        </div>
      </div>

      {/* Kalender interaktif */}
      <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60">
        {/* Header bulan */}
        <div className="flex items-center justify-center gap-2 p-4 bg-slate-800/60 border-b border-slate-800">
          <Calendar className="w-4 h-4 text-slate-300" />
          <span className="text-sm font-bold text-white">Oktober 2026 — Manajemen Kunci Tanggal</span>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/30">
          {[
            { color: 'bg-slate-700/40 border-slate-600/40 opacity-50', label: 'Sabtu / Minggu' },
            { color: 'bg-rose-900/70 border-rose-600/60', label: 'Dikunci Total' },
            { color: 'bg-indigo-700/70 border-indigo-500/60', label: 'Eksklusif Sekolah' },
            { color: 'bg-amber-900/40 border-amber-600/40', label: 'Ada Pemesanan' },
            { color: 'bg-slate-800/80 border-slate-700/60', label: 'Tersedia' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center space-x-1.5">
              <span className={`w-3.5 h-3.5 rounded border ${color} flex-shrink-0`} />
              <span className="text-[10px] font-semibold text-slate-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Nama hari */}
        <div className="grid grid-cols-7 border-b border-slate-800">
          {dayNames.map((name, idx) => (
            <div
              key={name}
              className={`py-2 text-center text-[10px] font-bold tracking-wider uppercase ${
                idx >= 5 ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Grid tanggal */}
        <div className="grid grid-cols-7 gap-px bg-slate-800">
          {days.map((day, idx) => {
            const status = getDayStatus(day);
            const lock = day ? lockMap[day] : null;
            const bookings = day ? (bookedSchoolsMap[day] || []) : [];
            const isClickable = day && status !== 'weekend';

            let colorClass = '';
            let cursor = 'cursor-default';

            if (status === 'empty') {
              colorClass = 'bg-slate-950/20';
            } else if (status === 'weekend') {
              colorClass = 'bg-slate-900/40 text-slate-700';
            } else if (status === 'locked') {
              colorClass = 'bg-rose-950/80 text-rose-300 ring-1 ring-rose-700/50';
              cursor = 'cursor-pointer';
            } else if (status === 'exclusive') {
              colorClass = 'bg-indigo-800/70 text-indigo-200 ring-1 ring-indigo-500/50';
              cursor = 'cursor-pointer';
            } else if (status === 'booked') {
              colorClass = 'bg-amber-950/50 text-amber-300 hover:bg-amber-900/60';
              cursor = 'cursor-pointer';
            } else {
              colorClass = 'bg-slate-900 text-slate-300 hover:bg-emerald-900/30 hover:text-emerald-200 hover:ring-1 hover:ring-emerald-600/40';
              cursor = 'cursor-pointer';
            }

            const titleText = lock
              ? lock.schoolName
                ? `Eksklusif: ${lock.schoolName}${lock.note ? `\n📝 ${lock.note}` : ''}`
                : `Dikunci Total${lock.note ? `\n📝 ${lock.note}` : ''}`
              : bookings.length > 0
              ? `Dipesan oleh:\n${bookings.join(', ')}`
              : day
              ? `Klik untuk kunci tanggal ${day} Oktober 2026`
              : '';

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-start text-xs font-bold transition-all duration-150 select-none min-h-[52px] w-full rounded-sm pt-1 pb-0.5 px-0.5 relative group ${colorClass} ${cursor}`}
                onClick={() => isClickable && handleDayClick(day)}
                title={titleText}
              >
                {/* Nomor tanggal */}
                <span className="leading-none">{day || ''}</span>

                {/* Ikon kunci */}
                {lock && (
                  <span className="mt-auto">
                    {lock.schoolName
                      ? <School className="w-2.5 h-2.5 opacity-80" />
                      : <Lock className="w-2.5 h-2.5 opacity-80" />
                    }
                  </span>
                )}

                {/* Pemesanan (tanpa kunci) */}
                {!lock && bookings.length > 0 && (
                  <div className="mt-auto w-full">
                    {bookings.slice(0, 2).map((s, i) => (
                      <span key={i} className="block w-full text-[6px] leading-[8px] truncate font-normal text-center opacity-80">{s}</span>
                    ))}
                    {bookings.length > 2 && (
                      <span className="block text-[6px] text-center opacity-60">+{bookings.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Form Kunci Tanggal */}
      {showLockForm && selectedDay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${editingLock ? 'bg-amber-500/10' : 'bg-rose-500/10'}`}>
                  {editingLock
                    ? <Pencil className="w-4 h-4 text-amber-400" />
                    : <Lock className="w-4 h-4 text-rose-400" />
                  }
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingLock ? 'Edit Kunci Tanggal' : 'Kunci Tanggal'}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedDay} Oktober 2026</p>
                </div>
              </div>
              <button
                onClick={handleCloseForm}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Konten Modal */}
            <div className="p-5 space-y-4">
              {/* Tipe kunci */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Tipe Kunci</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormSchoolName('')}
                    className={`flex items-center space-x-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      formSchoolName === ''
                        ? 'bg-rose-900/50 border-rose-600/60 text-rose-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>Dikunci Total</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSchoolName(formSchoolName || ' ')}
                    className={`flex items-center space-x-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      formSchoolName !== ''
                        ? 'bg-indigo-900/50 border-indigo-600/60 text-indigo-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <School className="w-4 h-4 shrink-0" />
                    <span>Eksklusif Sekolah</span>
                  </button>
                </div>
              </div>

              {/* Input nama sekolah (jika eksklusif) */}
              {formSchoolName !== '' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Nama Sekolah yang Diizinkan
                  </label>
                  <input
                    type="text"
                    value={formSchoolName.trim()}
                    onChange={(e) => setFormSchoolName(e.target.value)}
                    placeholder="Ketik atau pilih nama sekolah..."
                    list="school-suggestions"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                  <datalist id="school-suggestions">
                    {registeredSchools.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                  <p className="text-[10px] text-slate-500">
                    Hanya sekolah ini yang dapat memilih tanggal {selectedDay} Oktober.
                    Sekolah lain akan melihat tanggal ini sebagai "Sudah Dipesan".
                  </p>
                </div>
              )}

              {/* Catatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Catatan (Opsional)</label>
                <input
                  type="text"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Contoh: Sudah konfirmasi dengan kepala sekolah..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>

              {/* Peringatan */}
              <div className="flex items-start space-x-2 p-3 rounded-xl bg-amber-950/30 border border-amber-700/30">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  {formSchoolName.trim()
                    ? `Sekolah lain yang sudah memilih tanggal ${selectedDay} akan tetap tersimpan, namun tanggal ini akan ditandai "Sudah Dipesan" untuk sekolah lain.`
                    : `Tanggal ${selectedDay} Oktober akan dikunci total. Tidak ada sekolah yang bisa memilih tanggal ini.`
                  }
                </p>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-between p-5 pt-0 gap-3">
              {/* Tombol Hapus kunci (jika edit) */}
              {editingLock && (
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveLock(editingLock.id);
                    handleCloseForm();
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/40 text-rose-300 text-xs font-semibold transition-all"
                >
                  <LockOpen className="w-3.5 h-3.5" />
                  <span>Buka Kunci</span>
                </button>
              )}

              <div className={`flex space-x-2 ${editingLock ? '' : 'ml-auto'}`}>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveLock}
                  disabled={isSubmitting || (formSchoolName !== '' && !formSchoolName.trim())}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-rose-900/30"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{editingLock ? 'Perbarui Kunci' : 'Kunci Tanggal'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daftar Kunci Aktif */}
      {dateLocks.filter((l) => l.month === 10 && l.year === 2026).length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kunci Aktif ({totalLocked})</h3>
          <div className="space-y-2">
            {dateLocks
              .filter((l) => l.month === 10 && l.year === 2026)
              .map((lock) => (
                <div
                  key={lock.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    lock.schoolName
                      ? 'bg-indigo-950/30 border-indigo-800/40'
                      : 'bg-rose-950/30 border-rose-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`p-1.5 rounded-lg ${lock.schoolName ? 'bg-indigo-500/10' : 'bg-rose-500/10'}`}>
                      {lock.schoolName
                        ? <School className="w-3.5 h-3.5 text-indigo-400" />
                        : <Lock className="w-3.5 h-3.5 text-rose-400" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">
                        {lock.day} Oktober 2026
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {lock.schoolName
                          ? <span className="text-indigo-300">Eksklusif: {lock.schoolName}</span>
                          : <span className="text-rose-400">Dikunci Total</span>
                        }
                        {lock.note && <span className="ml-2 text-slate-500">· {lock.note}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => handleDayClick(lock.day)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                      title="Edit kunci"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveLock(lock.id)}
                      className="p-1.5 rounded-lg bg-rose-900/30 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 transition-all"
                      title="Hapus kunci"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {dateLocks.filter((l) => l.month === 10 && l.year === 2026).length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-slate-600 space-y-2">
          <LockOpen className="w-8 h-8 opacity-50" />
          <p className="text-sm">Belum ada tanggal yang dikunci</p>
          <p className="text-xs">Klik pada tanggal di kalender untuk mengunci</p>
        </div>
      )}
    </div>
  );
};
