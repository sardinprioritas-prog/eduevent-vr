import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { useLocation } from 'react-router-dom';
import { useSchoolData } from '../../hooks/useSchoolData';
import {
  GraduationCap,
  MapPin,
  Building2,
  ListOrdered,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  X,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Pencil,
  Loader2,
  User,
  Phone,
  Calendar,
  Users,
  Info,
  ChevronLeft,
  ChevronRight,
  Play,
  Share2,
  Copy
} from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

// ── Konstanta Kecamatan ─────────────────────────────────────────
const KECAMATAN_OPTIONS = [
  'PALU BARAT', 'ULUJADI', 'PALU SELATAN', 'PALU TIMUR',
  'PALU UTARA', 'MANTIKULORE', 'TATANGA', 'TAWAELI',
];

// ── Helper Kalender Oktober ─────────────────────────────────────
const OCTOBER_YEAR = 2026;
const OCTOBER_MONTH = 9; // 0-indexed

/**
 * Kembalikan array tanggal (1..31) untuk bulan Oktober 2026.
 * Hari pertama minggu: Senin=1…Minggu=0 (getDay() → 0=Sun,6=Sat)
 */
const buildOctoberDays = () => {
  const days = [];
  const firstDayOfMonth = new Date(OCTOBER_YEAR, OCTOBER_MONTH, 1).getDay(); // 0=Sun
  // Isi padding awal (Minggu=7 supaya grid mulai dari Senin)
  const startPad = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= 31; d++) days.push(d);
  return days;
};

const isWeekend = (day) => {
  const date = new Date(OCTOBER_YEAR, OCTOBER_MONTH, day);
  const dow = date.getDay(); // 0=Sun, 6=Sat
  return dow === 0 || dow === 6;
};

/**
 * Hitung berapa hari yang dialokasikan berdasarkan jumlah siswa.
 * <300   → 1 hari
 * 300-499 (eksklusif 300 & inklusif 499) → 2 hari berturut (tidak termasuk Sabtu/Minggu)
 * ≥500   → 3 hari berturut (tidak termasuk Sabtu/Minggu)
 *
 * Catatan soal: "jika >300 tapi <500" → 2 hari; "jika >590" → 3 hari
 * Kita terapkan: <300=1, 300–499=2, ≥500=3 (berdasarkan konteks)
 */
const getDayCount = (studentCount) => {
  if (studentCount < 300) return 1;
  if (studentCount < 500) return 2;
  return 3;
};

/**
 * Dari tanggal awal, hitung array tanggal kegiatan (skip Sabtu/Minggu)
 */
const computeActivityDates = (startDay, dayCount) => {
  const result = [];
  let current = startDay;
  while (result.length < dayCount) {
    if (!isWeekend(current) && current <= 31) {
      result.push(current);
    }
    current++;
    if (current > 31) break;
  }
  return result;
};

// ── Komponen Kalender Oktober ────────────────────────────────────
const OctoberCalendar = ({
  bookedDates, // array of day numbers booked by OTHER schools
  myDates,     // array of day numbers already selected/saved for THIS school
  onSelectDates,
  disabled,
  bookedSchoolsMap = {}, // map of day -> array of school names
}) => {
  const days = useMemo(() => buildOctoberDays(), []);
  const [hoveredDay, setHoveredDay] = useState(null); // tanggal yang sedang di-hover

  // Semua tanggal yang sudah terpesan (termasuk milik sekolah lain)
  const bookedSet = useMemo(() => new Set(bookedDates), [bookedDates]);
  const mySet = useMemo(() => new Set(myDates), [myDates]);

  // Toggle tanggal: klik = tambah, klik lagi = hapus
  const handleDayClick = (day) => {
    if (disabled || !day || isWeekend(day)) return;
    if (bookedSet.has(day)) return; // sudah dipakai sekolah lain

    if (mySet.has(day)) {
      // Sudah terpilih → hapus
      onSelectDates(myDates.filter(d => d !== day));
    } else {
      // Belum terpilih → tambah, urutkan
      onSelectDates([...myDates, day].sort((a, b) => a - b));
    }
  };

  const handleDayHover = (day) => {
    if (disabled || !day || isWeekend(day) || bookedSet.has(day) || mySet.has(day)) {
      setHoveredDay(null);
      return;
    }
    setHoveredDay(day);
  };

  const getDayStatus = (day) => {
    if (!day) return 'empty';
    if (isWeekend(day)) return 'weekend';
    if (mySet.has(day)) return 'mine';
    if (bookedSet.has(day)) return 'booked';
    if (hoveredDay === day) return 'preview';
    return 'available';
  };

  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-300/90 leading-relaxed">
          Klik tanggal yang tersedia untuk <strong className="text-indigo-200">memilih</strong> atau <strong className="text-indigo-200">membatalkan</strong> pilihan. Sabtu &amp; Minggu tidak dapat dipilih.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] font-semibold">
        {[
          { color: 'bg-indigo-600/80 border-indigo-500', label: 'Terpilih (Sekolah Ini)' },
          { color: 'bg-slate-700/60 border-slate-600 opacity-50', label: 'Sabtu / Minggu' },
          { color: 'bg-rose-900/60 border-rose-700/60', label: 'Sudah Dipesan' },
          { color: 'bg-amber-500/20 border-amber-500/50', label: 'Hover' },
          { color: 'bg-slate-800/80 border-slate-700/60 hover:border-indigo-500', label: 'Tersedia' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center space-x-1.5">
            <span className={`w-4 h-4 rounded border ${color} flex-shrink-0`} />
            <span className="text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Grid Kalender */}
      <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60">
        {/* Header bulan */}
        <div className="flex items-center justify-center gap-2 p-4 bg-indigo-950/40 border-b border-slate-800">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold text-indigo-200">Oktober 2026</span>
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

        {/* Tanggal */}
        <div className="grid grid-cols-7 gap-px bg-slate-800">
          {days.map((day, idx) => {
            const status = getDayStatus(day);
            const isClickable = day && status !== 'weekend' && status !== 'booked' && !disabled;

            const base = 'flex flex-col items-center justify-start text-xs font-bold transition-all duration-150 select-none overflow-hidden relative group';
            const sizeClass = 'min-h-[50px] w-full rounded-sm pt-1 pb-0.5 px-0.5';
            let colorClass = '';
            let cursor = 'cursor-default';

            if (status === 'empty') {
              colorClass = 'bg-slate-950/20';
            } else if (status === 'weekend') {
              colorClass = 'bg-slate-900/40 text-slate-700';
            } else if (status === 'mine') {
              colorClass = 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40';
            } else if (status === 'booked') {
              colorClass = 'bg-rose-950/60 text-rose-700';
            } else if (status === 'preview') {
              colorClass = 'bg-amber-500/20 text-amber-200 border border-amber-500/50';
              cursor = 'cursor-pointer';
            } else {
              // available
              colorClass = `bg-slate-900 text-slate-200 ${isClickable ? 'hover:bg-indigo-900/50 hover:text-indigo-200 hover:border-indigo-500/50 border border-slate-800' : 'border border-slate-800/40'}`;
              cursor = isClickable ? 'cursor-pointer' : 'cursor-default';
            }

            const schoolsHere = day && bookedSchoolsMap[day] ? bookedSchoolsMap[day] : [];
            const schoolsText = schoolsHere.length > 0 ? `Sudah dipesan oleh:\n- ${schoolsHere.join('\n- ')}` : '';

            return (
              <div
                key={idx}
                className={`${base} ${sizeClass} ${colorClass} ${cursor}`}
                onClick={() => day && handleDayClick(day)}
                onMouseEnter={() => handleDayHover(day)}
                onMouseLeave={() => setHoveredDay(null)}
                title={
                  schoolsText
                    ? (status === 'mine' ? `Klik batalkan pilihan.\n\n${schoolsText}` : schoolsText)
                    : status === 'mine'
                    ? `Klik untuk batalkan pilihan tanggal ${day}`
                    : status === 'weekend'
                    ? 'Sabtu / Minggu (tidak tersedia)'
                    : day
                    ? `Pilih ${day} Oktober 2026`
                    : ''
                }
              >
                <span className={status === 'booked' ? 'line-through' : ''}>{day || ''}</span>
                {day && schoolsHere.length > 0 && (
                  <div className="mt-auto w-full flex flex-col space-y-[1px]">
                    {schoolsHere.map((sName, i) => (
                      <span key={i} className="block w-full text-[7px] leading-[9px] truncate font-normal text-center opacity-80" title={sName}>
                        {sName}
                      </span>
                    ))}
                  </div>
                )}
                {status === 'mine' && (
                  <span className="sr-only">terpilih</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tanggal terpilih */}
      {myDates && myDates.length > 0 && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/25">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-300">Tanggal Kegiatan Terpilih:</p>
            <p className="text-sm font-extrabold text-white mt-0.5">
              {myDates.map(d => `${d} Oktober 2026`).join(' • ')}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={() => onSelectDates([])}
              className="ml-auto p-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-rose-400 hover:text-rose-300 transition-all text-xs"
              title="Hapus pilihan tanggal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Komponen Utama SchoolPortal ─────────────────────────────────
export const SchoolPortal = () => {
  const {
    schoolRegistrations,
    cities,
    users,
    handleSaveSchoolRegistration,
    handleDeleteSchoolRegistration,
  } = useAuth();
  const location = useLocation();
  const regionName = location.state?.regionName;

  // Load data sekolah dari Excel (via JSON)
  const { schoolData, loading: excelLoading } = useSchoolData();

  const [formData, setFormData] = useState({
    schoolName: '',
    kecamatan: '',
    pjName: '',
    noHp: '',
    rombelCount: '',
    passcode: '',
  });

  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pendingRegAction, setPendingRegAction] = useState(null);
  const [inputPasscode, setInputPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Sekolah yang tersedia berdasarkan kecamatan terpilih
  const schoolsByKecamatan = formData.kecamatan
    ? schoolData.filter(s => s.kecamatan === formData.kecamatan)
    : [];

  // Data sekolah yang sedang dipilih (termasuk jumlahSiswa dari Excel)
  const selectedSchoolData = formData.schoolName
    ? schoolData.find(s => s.schoolName === formData.schoolName && s.kecamatan === formData.kecamatan)
    : null;

  const [classDetails, setClassDetails] = useState({});
  const [totalStudents, setTotalStudents] = useState(0);
  const [selectedDates, setSelectedDates] = useState([]); // tanggal kegiatan terpilih
  const [activeTab, setActiveTab] = useState('input'); // 'input' | 'riwayat'
  const [selectedReg, setSelectedReg] = useState(null); // For detail modal
  const [shareReg, setShareReg] = useState(null); // For share modal
  const [showIgModal, setShowIgModal] = useState(false); // For Instagram Ad modal

  // Sort registrations ascending by earliest selected date
  const sortedRegistrations = useMemo(() => {
    return [...schoolRegistrations].sort((a, b) => {
      const aDate = a.selectedDates && a.selectedDates.length > 0 ? Math.min(...a.selectedDates) : Infinity;
      const bDate = b.selectedDates && b.selectedDates.length > 0 ? Math.min(...b.selectedDates) : Infinity;
      return aDate - bDate;
    });
  }, [schoolRegistrations]);

  // ── Sync State ─────────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle'|'checking'|'matched'|'not_found'
  const [editingRegId, setEditingRegId] = useState(null);
  const syncDebounceRef = useRef(null);

  const isSMP = (formData.schoolName || '').toUpperCase().includes('SMP');
  const grades = isSMP ? [7, 8, 9] : [1, 2, 3, 4, 5, 6];

  // ── Map tanggal ke nama sekolah yang memesannya ─────────
  const bookedSchoolsMap = useMemo(() => {
    const map = {};
    schoolRegistrations.forEach(reg => {
      // Jangan hitung tanggal milik sekolah yang sedang diedit
      if (editingRegId && reg.id === editingRegId) return;
      (reg.selectedDates || []).forEach(d => {
        if (!map[d]) map[d] = [];
        map[d].push(reg.schoolName);
      });
    });
    return map;
  }, [schoolRegistrations, editingRegId]);

  // ── Semua tanggal yang SUDAH dipesan oleh sekolah LAIN (Penuh >= 2) ─────────
  const allBookedDates = useMemo(() => {
    return Object.keys(bookedSchoolsMap)
      .filter(d => bookedSchoolsMap[d].length >= 2)
      .map(d => parseInt(d));
  }, [bookedSchoolsMap]);

  // ── Jumlah siswa sekolah yang dipilih (dari Excel) ─────────────
  const excelStudentCount = selectedSchoolData?.jumlahSiswa || 0;

  // ── Reset/re-initialize classDetails when rombelCount changes ──
  useEffect(() => {
    const rc = parseInt(formData.rombelCount) || 1;
    const newDetails = {};
    for (let grade of grades) {
      for (let r = 0; r < rc; r++) {
        const className = `${grade}${String.fromCharCode(65 + r)}`;
        newDetails[className] = classDetails[className] !== undefined ? classDetails[className] : '';
      }
    }
    setClassDetails(newDetails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.rombelCount, isSMP]);

  // ── Recalculate total students in real-time ───────────────────
  useEffect(() => {
    const sum = Object.values(classDetails).reduce((acc, curr) => {
      const val = parseInt(curr) || 0;
      return acc + val;
    }, 0);
    setTotalStudents(sum);
  }, [classDetails]);

  // ── Auto-Sync: trigger debounced check saat 2 field terisi ────
  useEffect(() => {
    const schoolReady = formData.schoolName.trim().length > 0;
    const kecamatanReady = formData.kecamatan.length > 0;

    if (!schoolReady || !kecamatanReady) {
      if (syncStatus !== 'idle') {
        setSyncStatus('idle');
        setEditingRegId(null);
        setClassDetails({});
        setSelectedDates([]);
      }
      return;
    }

    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      setSyncStatus('checking');

      const matched = schoolRegistrations.find((reg) => {
        const schoolMatch = (reg.schoolName || '').trim().toLowerCase() === formData.schoolName.trim().toLowerCase();
        const kecamatanMatch = reg.kecamatan === formData.kecamatan;
        const cityMatch = reg.cityName === (regionName || 'Kota Palu');
        return schoolMatch && kecamatanMatch && cityMatch;
      });

      if (matched) {
        setSyncStatus('matched');
        setEditingRegId(matched.id);
        setFormData(prev => ({
          ...prev,
          rombelCount: matched.rombelCount || '',
          pjName: matched.pjName && matched.pjName !== '-' ? matched.pjName : prev.pjName,
          noHp: matched.noHp || prev.noHp,
        }));
        setClassDetails(matched.classDetails || {});
        setSelectedDates(matched.selectedDates || []);
      } else {
        setSyncStatus('not_found');
        setEditingRegId(null);
        setClassDetails({});
        setSelectedDates([]);
      }
    }, 500);

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.schoolName, formData.kecamatan, regionName, schoolRegistrations]);

  const handleClassValueChange = (className, value) => {
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setClassDetails({
        ...classDetails,
        [className]: value === '' ? '' : parseInt(value),
      });
    }
  };

  const handleEditRegistration = (reg) => {
    setFormData({
      schoolName: reg.schoolName || '',
      kecamatan: reg.kecamatan || '',
      pjName: reg.pjName && reg.pjName !== '-' ? reg.pjName : '',
      noHp: reg.noHp || '',
      rombelCount: reg.rombelCount || '',
      passcode: reg.passcode || '',
    });
    setClassDetails(reg.classDetails || {});
    setSelectedDates(reg.selectedDates || []);
    setTotalStudents(reg.totalStudents || 0);
    setSyncStatus('matched');
    setEditingRegId(reg.id);
    setActiveTab('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestEdit = (reg) => {
    setPendingRegAction({ type: 'edit', reg });
    setShowPasscodeModal(true);
    setInputPasscode('');
    setPasscodeError('');
  };

  const handleVerifyPasscode = () => {
    const adminPasscode = 'ADMINVR2026';
    const reg = pendingRegAction.reg;
    
    if (inputPasscode === reg.passcode || inputPasscode === adminPasscode) {
      setShowPasscodeModal(false);
      if (pendingRegAction.type === 'edit') {
        handleEditRegistration(reg);
      }
    } else {
      setPasscodeError('PIN Akses salah! Jika Anda admin, gunakan Master PIN.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.schoolName.trim()) {
      alert('Nama Sekolah tidak boleh kosong!');
      return;
    }
    if (!formData.kecamatan) {
      alert('Silakan pilih Kecamatan terlebih dahulu!');
      return;
    }
    if (!formData.pjName.trim()) {
      alert('Nama Kepala Sekolah / Guru PJ wajib diisi!');
      return;
    }
    if (!formData.passcode || formData.passcode.length < 4) {
      alert('Mohon buat PIN Akses minimal 4 karakter!');
      return;
    }

    const currentCityName = regionName || 'Kota Palu';
    const matchedCity = cities.find(c => c.name === currentCityName);

    const registrationData = {
      ...(editingRegId ? { id: editingRegId } : {}),
      schoolName: formData.schoolName.trim(),
      kecamatan: formData.kecamatan,
      pjName: formData.pjName.trim(),
      noHp: formData.noHp.trim(),
      cityName: currentCityName,
      cityId: matchedCity?.id || null,
      rombelCount: parseInt(formData.rombelCount) || 1,
      classDetails: classDetails,
      totalStudents: totalStudents,
      selectedDates: selectedDates,
      passcode: formData.passcode,
    };

    handleSaveSchoolRegistration(registrationData);

    // Reset Form
    setFormData({
      schoolName: '',
      kecamatan: '',
      pjName: '',
      noHp: '',
      rombelCount: '',
      passcode: '',
    });
    setClassDetails({});
    setTotalStudents(0);
    setSelectedDates([]);
    setSyncStatus('idle');
    setEditingRegId(null);
    setActiveTab('riwayat');
  };

  // Reset form
  const handleResetIdentity = () => {
    setSyncStatus('idle');
    setEditingRegId(null);
    setClassDetails({});
    setSelectedDates([]);
    setFormData(prev => ({
      ...prev,
      schoolName: '',
      kecamatan: '',
      pjName: '',
      noHp: '',
      rombelCount: '',
      passcode: '',
    }));
  };

  // Helper to generate dynamic grade columns
  const getSubdivisions = (rombelCount) => {
    const arr = [];
    const count = parseInt(rombelCount) || 1;
    for (let i = 0; i < count; i++) {
      arr.push(String.fromCharCode(65 + i));
    }
    return arr;
  };

  // ── Sync Banner Component ─────────────────────────────────────
  const SyncBanner = () => {
    if (syncStatus === 'idle') return null;

    if (syncStatus === 'checking') {
      return (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 animate-pulse">
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
          <p className="text-sm text-slate-300">Mengecek sinkronisasi data...</p>
        </div>
      );
    }

    if (syncStatus === 'matched') {
      return (
        <div className="flex items-start space-x-4 p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 animate-fadeIn">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-emerald-300">Data Ditemukan — Mode Edit</p>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              Identitas Sekolah dan Kecamatan cocok. Data jumlah siswa sebelumnya telah dimuat.
              Silakan perbarui dan klik <strong>"Perbarui Data Siswa"</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetIdentity}
            className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Ganti</span>
          </button>
        </div>
      );
    }

    if (syncStatus === 'not_found') {
      return (
        <div className="flex items-start space-x-4 p-5 rounded-xl bg-amber-950/30 border border-amber-500/30 animate-fadeIn">
          <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-300">Belum Ada Data — Pendaftaran Baru</p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              Tidak ditemukan data registrasi untuk kombinasi Sekolah dan Kecamatan ini.
              Silakan isi jumlah siswa dan klik <strong>"Simpan Pendaftaran"</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetIdentity}
            className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Ganti</span>
          </button>
        </div>
      );
    }

    return null;
  };

  // ── Apakah form kelas boleh ditampilkan ──────────────────────
  const showClassSection = syncStatus === 'matched' || syncStatus === 'not_found';

  // ── Badge jumlah siswa dari Excel ────────────────────────────
  const StudentCountBadge = ({ count }) => {
    if (!count) return null;
    const dayCount = getDayCount(count);
    const colorMap = {
      1: 'bg-emerald-900/50 border-emerald-600/40 text-emerald-300',
      2: 'bg-amber-900/40 border-amber-600/40 text-amber-300',
      3: 'bg-rose-900/40 border-rose-600/40 text-rose-300',
    };
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${colorMap[dayCount]}`}>
        <Users className="w-3.5 h-3.5 shrink-0" />
        <span>{count} siswa dari Excel</span>
        <span className="text-[10px] opacity-75">→ {dayCount} hari kegiatan</span>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-8 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Pendaftaran VR Mandiri</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Portal Pendaftaran Sekolah
            </h1>
            {regionName && (
              <div className="inline-block mb-4 px-4 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold">
                Wilayah Terpilih: {regionName}
              </div>
            )}
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
              Silakan masukkan data pendaftaran siswa untuk kegiatan Virtual Reality (VR). Anda dapat menyimpan data terlebih dahulu dan memilih tanggal kegiatan (opsional) menyusul.
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('input')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'input'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Form Input Data
              </button>
              <button
                onClick={() => setActiveTab('riwayat')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                  activeTab === 'riwayat'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Riwayat Pendaftaran
                {schoolRegistrations.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {schoolRegistrations.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="md:col-span-4 flex justify-center md:justify-end">
            <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-pink-500 via-purple-500 to-indigo-500 p-[2px] shadow-xl shadow-pink-500/20 max-w-sm w-full">
              <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              <div className="relative bg-slate-950 rounded-[14px] p-5 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <InstagramIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">@triesakti_edutainment</h3>
                  <p className="text-[10px] text-slate-400 mt-1">Ikuti keseruan VR Edukasi terbaru!</p>
                </div>
                <button
                  onClick={() => setShowIgModal(true)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-pink-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>edutainment show</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {activeTab === 'input' ? (
        /* Form Card */
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-8">

          {/* Section 1: Identitas Sekolah & Kecamatan */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/60">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Identitas Sekolah</h2>
                <p className="text-xs text-slate-500">Pilih Kecamatan lalu pilih nama Sekolah dari data Excel.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 1. Kecamatan — dipilih pertama */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Kecamatan <span className="text-rose-500">*</span>
                </label>
                {excelLoading ? (
                  <div className="flex items-center space-x-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <select
                      required
                      value={formData.kecamatan}
                      onChange={(e) => {
                        setFormData({ ...formData, kecamatan: e.target.value, schoolName: '' });
                        setSyncStatus('idle');
                        setClassDetails({});
                        setSelectedDates([]);
                        setEditingRegId(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    >
                      <option value="">-- Pilih Kecamatan --</option>
                      {KECAMATAN_OPTIONS.map(kec => (
                        <option key={kec} value={kec}>
                          {kec} ({schoolData.filter(s => s.kecamatan === kec).length} sekolah)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {formData.kecamatan && (
                  <p className="text-[10px] text-indigo-400/80">
                    {schoolsByKecamatan.length} sekolah tersedia di {formData.kecamatan}
                  </p>
                )}
              </div>

              {/* 2. Nama Sekolah — dropdown + tampil jumlah siswa */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nama Sekolah <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <select
                    required
                    disabled={!formData.kecamatan || excelLoading}
                    value={formData.schoolName}
                    onChange={(e) => {
                      setFormData({ ...formData, schoolName: e.target.value });
                      setSyncStatus('idle');
                      setSelectedDates([]);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.kecamatan ? 'Pilih Kecamatan Terlebih Dahulu' : '-- Pilih Nama Sekolah --'}
                    </option>
                    {schoolsByKecamatan.map((s, idx) => (
                      <option key={idx} value={s.schoolName}>
                        {s.schoolName} ({s.jumlahSiswa} siswa)
                      </option>
                    ))}
                  </select>
                </div>
                {selectedSchoolData && (
                  <div className="flex flex-col space-y-1.5 mt-2">
                    <p className="text-[10px] text-emerald-400/80 flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Sekolah dipilih dari data Excel</span>
                    </p>
                    <StudentCountBadge count={selectedSchoolData.jumlahSiswa} />
                  </div>
                )}
              </div>

            </div>

            {/* 3. Nama Kepala Sekolah / Guru PJ, Nomor HP, & PIN Akses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nama Kepala Sekolah / Guru PJ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Drs. Ahmad Yani, M.Pd."
                    value={formData.pjName}
                    onChange={(e) => setFormData({ ...formData, pjName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nomor HP <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Buat PIN Akses <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Minimal 4 karakter (Cth: 1234)"
                    value={formData.passcode}
                    onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Harap catat PIN ini! Digunakan jika Anda ingin mengubah data pendaftaran nanti.</p>
              </div>
            </div>

            {/* Sync Banner */}
            <SyncBanner />
          </div>

          {/* Section 2: Input Jumlah Siswa (hanya tampil setelah sync) */}
          {showClassSection && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">
                      {syncStatus === 'matched' ? 'Edit Jumlah Siswa Per Kelas' : 'Input Jumlah Siswa Per Kelas'}
                    </h2>
                    <p className="text-xs text-slate-500">Tingkat {isSMP ? '7 – 9' : '1 – 6'}, berdasarkan rombongan belajar.</p>
                  </div>
                </div>
                {syncStatus === 'matched' && (
                  <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-600/30 text-emerald-400 text-[10px] font-bold">
                    <Pencil className="w-3 h-3" />
                    <span>Mode Edit</span>
                  </span>
                )}
              </div>

              {/* Jumlah Rombel */}
              <div className="max-w-xs space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Jumlah Rombel Per Tingkatan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    placeholder="Masukkan jumlah rombel"
                    value={formData.rombelCount}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setFormData({ ...formData, rombelCount: '' });
                        return;
                      }
                      const val = Math.min(10, Math.max(1, parseInt(raw) || 1));
                      setFormData({ ...formData, rombelCount: val });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Misal diinput 2: kelas {isSMP ? '7 terdiri dari 7A, 7B' : '1 terdiri dari 1A, 1B'}; dst. (Maks. 10 rombel)
                </p>
              </div>

              {/* Dynamic Class Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {grades.map((grade) => {
                  const subdivisions = getSubdivisions(formData.rombelCount);
                  return (
                    <div
                      key={grade}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/60 transition-all flex flex-col space-y-4 shadow-md"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-sm font-bold text-indigo-400">Kelas {grade}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          {subdivisions.length} Rombel
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {subdivisions.map((letter) => {
                          const className = `${grade}${letter}`;
                          return (
                            <div key={className} className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-400 tracking-wider">
                                Rombel {className}
                              </label>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={classDetails[className] !== undefined ? classDetails[className] : ''}
                                onChange={(e) => handleClassValueChange(className, e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-center text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 animate-fadeIn"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Kalender Oktober (tampil setelah sync ready) */}
          {showClassSection && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/60">
                <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    Pilih Tanggal Kegiatan <span className="text-sm font-normal text-slate-400 italic">(Opsional)</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Klik tanggal untuk memilih. Klik lagi untuk membatalkan. Tanggal dipesan sekolah lain tidak bisa dipilih.
                  </p>
                </div>
              </div>

              <OctoberCalendar
                bookedDates={allBookedDates}
                myDates={selectedDates}
                onSelectDates={setSelectedDates}
                disabled={false}
                bookedSchoolsMap={bookedSchoolsMap}
              />
            </div>
          )}

          {/* Section 4: Summary Counter & Submit */}
          {showClassSection && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 animate-fadeIn">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Total Pendaftar Sementara</h3>
                  <p className="text-xs text-slate-400">Akumulasi jumlah siswa dari semua kelas yang telah dimasukkan.</p>
                  {selectedDates.length > 0 && (
                    <p className="text-[11px] text-violet-300 mt-1 font-semibold">
                      📅 Tgl. Kegiatan: {selectedDates.map(d => `${d} Okt`).join(' & ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-center md:text-right">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{totalStudents}</span>
                  <span className="text-xs text-indigo-400 ml-1.5 font-bold">Siswa</span>
                </div>

                <button
                  type="submit"
                  className={`px-6 py-3.5 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center space-x-2 ${
                    syncStatus === 'matched'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  {syncStatus === 'matched' ? (
                    <>
                      <Pencil className="w-4 h-4" />
                      <span>Perbarui Data Siswa</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Simpan Pendaftaran</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Placeholder saat belum sync */}
          {!showClassSection && syncStatus === 'idle' && (
            <div className="flex flex-col items-center justify-center py-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-700/60 space-y-3">
              <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-400">Form input jumlah siswa akan muncul di sini</p>
              <p className="text-xs text-slate-500">Lengkapi Nama Sekolah dan Kecamatan di atas untuk melanjutkan.</p>
            </div>
          )}

        </form>
      ) : (
        /* History Card */
        <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Riwayat Pendaftaran Sekolah</h2>
                <p className="text-xs text-slate-400">
                  Daftar sekolah yang telah menginputkan data jumlah siswa dan memilih tanggal kegiatan.
                </p>
              </div>
            </div>
          </div>

          {schoolRegistrations.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30 text-indigo-400" />
              <p className="text-sm font-semibold">Belum Ada Data Pendaftaran Terdaftar</p>
              <p className="text-xs mt-1">Gunakan tab Form Input Data untuk mendaftarkan sekolah baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                    <th className="py-3.5 px-4">Nama Sekolah</th>
                    <th className="py-3.5 px-4">Kecamatan</th>
                    <th className="py-3.5 px-4">Kepala Sekolah / Guru PJ</th>
                    <th className="py-3.5 px-4">Nomor HP</th>
                    <th className="py-3.5 px-4 text-center">Rombel</th>
                    <th className="py-3.5 px-4 text-center">Total Siswa</th>
                    <th className="py-3.5 px-4 text-center">Tanggal Kegiatan</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {sortedRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100">{reg.schoolName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{reg.cityName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{reg.kecamatan || '-'}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-semibold">
                          {reg.pjName && reg.pjName !== '-' ? reg.pjName : <span className="text-slate-600 italic">—</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {reg.noHp ? (
                          <a
                            href={`https://wa.me/${reg.noHp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{reg.noHp}</span>
                          </a>
                        ) : (
                          <span className="text-slate-600 italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-300">{reg.rombelCount} Rombel</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-indigo-300">{reg.totalStudents} siswa</td>
                      <td className="py-3.5 px-4 text-center">
                        {reg.selectedDates && reg.selectedDates.length > 0 ? (
                          <div className="flex flex-col items-center gap-1">
                            {reg.selectedDates.map(d => (
                              <span key={d} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-violet-900/40 border border-violet-600/30 text-violet-300 text-[10px] font-bold">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{d} Okt 2026</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 italic text-[10px]">Belum dipilih</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleRequestEdit(reg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-400 transition-colors"
                            title="Edit Data Pendaftaran"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-400 transition-colors"
                            title="Lihat Detail Rombel"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShareReg(reg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-900/40 text-slate-300 hover:text-blue-400 transition-colors"
                            title="Bagikan Jadwal"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus pendaftaran ${reg.schoolName}?`)) {
                                const passcode = window.prompt('Masukkan Passcode Pioneer untuk menghapus registrasi ini:');
                                if (passcode) {
                                  const isValidPioneer = users?.some(u => u.passcode === passcode && u.role === 'pioneer');
                                  if (isValidPioneer) {
                                    handleDeleteSchoolRegistration(reg.id);
                                  } else {
                                    alert('Gagal Hapus: Passcode salah atau Anda bukan Pioneer.');
                                  }
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 transition-colors"
                            title="Hapus Registrasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rincian Siswa Per Rombel</h3>
                  <p className="text-xs text-slate-400">{selectedReg.schoolName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                <div>
                  <span className="block text-slate-500">Kecamatan</span>
                  <span className="font-bold text-slate-200">{selectedReg.kecamatan || '-'}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Wilayah</span>
                  <span className="font-bold text-slate-200">{selectedReg.cityName}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Total Terdaftar</span>
                  <span className="font-bold text-indigo-400">{selectedReg.totalStudents} siswa ({selectedReg.rombelCount} Rombel)</span>
                </div>
              </div>

              {/* Tanggal Kegiatan */}
              {selectedReg.selectedDates && selectedReg.selectedDates.length > 0 && (
                <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/25">
                  <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Tanggal Kegiatan VR</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReg.selectedDates.map(d => (
                      <span key={d} className="px-3 py-1.5 rounded-lg bg-violet-900/50 border border-violet-600/40 text-violet-200 text-sm font-bold">
                        {d} Oktober 2025
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Kontak PJ */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Kontak Penanggung Jawab</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Nama Kepsek / Guru PJ</span>
                      <span className="font-bold text-slate-200 text-sm">
                        {selectedReg.pjName && selectedReg.pjName !== '-' ? selectedReg.pjName : <span className="text-slate-500 italic">Tidak tersedia</span>}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Nomor HP (WhatsApp)</span>
                      {selectedReg.noHp ? (
                        <a
                          href={`https://wa.me/${selectedReg.noHp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                        >
                          {selectedReg.noHp}
                        </a>
                      ) : (
                        <span className="text-slate-500 italic text-sm">Tidak tersedia</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rombel breakdown table */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Distribusi Kelas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(selectedReg ? ((selectedReg.schoolName || '').toUpperCase().includes('SMP') ? [7, 8, 9] : [1, 2, 3, 4, 5, 6]) : []).map((grade) => {
                    const subs = getSubdivisions(selectedReg.rombelCount);
                    return (
                      <div key={grade} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col space-y-2.5">
                        <span className="text-xs font-bold text-indigo-400 border-b border-slate-800 pb-1.5 block">
                          Tingkat Kelas {grade}
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {subs.map((letter) => {
                            const cName = `${grade}${letter}`;
                            const count = selectedReg.classDetails[cName] || 0;
                            return (
                              <div key={cName} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                                <span className="block text-[10px] text-slate-500 font-bold">{cName}</span>
                                <span className="text-xs font-bold text-slate-200">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 bg-slate-950 border-t border-slate-800">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Input Passcode */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Keamanan Data</h3>
                  <p className="text-xs text-slate-400">Otorisasi Perubahan</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasscodeModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-xs text-slate-300 mb-4 text-center leading-relaxed">
                Masukkan PIN Akses sekolah ini untuk mengubah data. <br/>
                Jika Anda Admin, masukkan <span className="font-bold text-indigo-400">Master PIN</span>.
              </p>
              
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Masukkan PIN / Master PIN"
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-center tracking-widest text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                
                {passcodeError && (
                  <p className="text-xs text-rose-400 text-center font-semibold bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                    {passcodeError}
                  </p>
                )}
                
                <button
                  onClick={handleVerifyPasscode}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Verifikasi Akses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bagikan Jadwal */}
      {shareReg && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Bagikan Jadwal Kegiatan</h3>
                  <p className="text-xs text-slate-400">Informasi untuk Guru PJ</p>
                </div>
              </div>
              <button
                onClick={() => setShareReg(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-center space-y-2">
                  <Calendar className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <h4 className="text-lg font-bold text-white">{shareReg.schoolName}</h4>
                  <p className="text-sm text-slate-400">Jadwal Pelaksanaan Edukasi VR</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {shareReg.selectedDates && shareReg.selectedDates.length > 0 ? (
                      shareReg.selectedDates.map(d => (
                        <span key={d} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30">
                          {d} Oktober 2026
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic text-sm">Belum ada tanggal yang dipilih</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pratinjau Pesan</p>
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-sm text-slate-300 whitespace-pre-wrap font-mono text-xs">
                  {`Halo Bapak/Ibu ${shareReg.pjName || 'Guru PJ'},\n\nBerikut adalah informasi jadwal pelaksanaan kegiatan Edukasi VR untuk sekolah ${shareReg.schoolName}:\n\nTanggal: ${shareReg.selectedDates && shareReg.selectedDates.length > 0 ? shareReg.selectedDates.map(d => d + ' Oktober 2026').join(', ') : 'Belum ditentukan'}\nTotal Siswa: ${shareReg.totalStudents} Siswa\n\nMohon persiapannya. Terima kasih!`}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    const text = `Halo Bapak/Ibu ${shareReg.pjName || 'Guru PJ'},\n\nBerikut adalah informasi jadwal pelaksanaan kegiatan Edukasi VR untuk sekolah ${shareReg.schoolName}:\n\nTanggal: ${shareReg.selectedDates && shareReg.selectedDates.length > 0 ? shareReg.selectedDates.map(d => d + ' Oktober 2026').join(', ') : 'Belum ditentukan'}\nTotal Siswa: ${shareReg.totalStudents} Siswa\n\nMohon persiapannya. Terima kasih!`;
                    navigator.clipboard.writeText(text);
                    alert('Pesan disalin ke clipboard!');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all border border-slate-700"
                >
                  <Copy className="w-4 h-4" />
                  <span>Salin Pesan</span>
                </button>
                <a
                  href={`https://wa.me/${shareReg.noHp ? shareReg.noHp.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`Halo Bapak/Ibu ${shareReg.pjName || 'Guru PJ'},\n\nBerikut adalah informasi jadwal pelaksanaan kegiatan Edukasi VR untuk sekolah ${shareReg.schoolName}:\n\nTanggal: ${shareReg.selectedDates && shareReg.selectedDates.length > 0 ? shareReg.selectedDates.map(d => d + ' Oktober 2026').join(', ') : 'Belum ditentukan'}\nTotal Siswa: ${shareReg.totalStudents} Siswa\n\nMohon persiapannya. Terima kasih!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Kirim via WA</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Iframe Modal */}
      {showIgModal && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-slate-950/95 backdrop-blur-md animate-fadeIn">
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-600 to-purple-600 shadow-xl z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <InstagramIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Triesakti Edutainment Show</h3>
                <p className="text-[10px] text-pink-100">Instagram Resmi</p>
              </div>
            </div>
            <button
              onClick={() => setShowIgModal(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl backdrop-blur-sm border border-white/20 transition-all flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Portal Sekolah</span>
            </button>
          </div>
          
          {/* Iframe Alternative Container */}
          <div className="flex-1 w-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-sm p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/20">
                <InstagramIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight mb-3">Menuju ke Instagram</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Untuk menjaga keamanan, Instagram tidak mengizinkan halamannya dibuka langsung di dalam aplikasi ini. 
                <br/><br/>
                Silakan klik tombol di bawah untuk membuka profil resmi <strong className="text-pink-400">@triesakti_edutainment</strong>.
              </p>
              <a 
                href="https://www.instagram.com/triesakti_edutainment/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowIgModal(false)}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-pink-500/30 transition-all hover:scale-105"
              >
                <InstagramIcon className="w-5 h-5" />
                <span>Buka Instagram</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
