import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { useSchoolData } from '../../hooks/useSchoolData';
import { isSameRegion } from '../../config/regionSchoolSources';
import {
  CalendarDays, MapPin, Users, Clock, CheckCircle2,
  AlertCircle, CalendarClock, Building2, ClipboardList,
  UserRound, Phone, X, School,
} from 'lucide-react';

const findReg = (regs, schoolName) =>
  (regs || []).find(
    (r) => r.schoolName?.toLowerCase().trim() === schoolName?.toLowerCase().trim()
  );

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const parseDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  d.setHours(0, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (str) => {
  const d = parseDate(str);
  if (!d) return '-';
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const getStatus = (eventDate, eventDate2) => {
  const d1 = parseDate(eventDate);
  const d2 = parseDate(eventDate2);

  if (!d1 && !d2) return { label: 'Belum Terjadwal', color: 'slate' };

  const latest = (d1 && d2) ? (d2 > d1 ? d2 : d1) : (d2 || d1);
  const earliest = (d1 && d2) ? (d1 < d2 ? d1 : d2) : (d1 || d2);

  if (latest < TODAY) return { label: 'Selesai', color: 'emerald' };

  if (
    (d1 && d1.getTime() === TODAY.getTime()) ||
    (d2 && d2.getTime() === TODAY.getTime())
  ) return { label: 'Hari Ini!', color: 'amber' };

  // Cari tanggal tugas berikutnya (terdekat yang belum lewat)
  const upcomingDate = (d1 && d1 >= TODAY)
    ? ((d2 && d2 >= TODAY && d2 < d1) ? d2 : d1)
    : ((d2 && d2 >= TODAY) ? d2 : earliest);

  const days = Math.ceil((upcomingDate - TODAY) / (1000 * 60 * 60 * 24));
  if (days === 1) return { label: 'Besok', color: 'blue' };
  if (days <= 7) return { label: `${days} hari lagi`, color: 'indigo' };
  return { label: `${days} hari lagi`, color: 'slate' };
};

const statusStyles = {
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  amber:   'bg-amber-500/10  text-amber-400  border-amber-500/25',
  blue:    'bg-blue-500/10   text-blue-400   border-blue-500/25',
  indigo:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  slate:   'bg-slate-700/50  text-slate-400  border-slate-600/25',
};

const cardBorderStyles = {
  emerald: 'border-emerald-500/20',
  amber:   'border-amber-500/40',
  blue:    'border-blue-500/30',
  indigo:  'border-indigo-500/20',
  slate:   'border-slate-700/50',
};

export const OperatorSchedule = () => {
  const { schools, cities, events, currentUser, schoolRegistrations } = useAuth();
  const [detailSchool, setDetailSchool] = useState(null);
  // Muat data Excel sesuai wilayah operator (mis. Baubau -> Book2.xlsx) agar total siswa sekolah cocok
  const { schoolData, loading: excelLoading } = useSchoolData(currentUser?.city);

  // Hitung set nama sekolah yang telah selesai diinput kegiatannya di kota ini
  const completedSchoolNames = useMemo(() => {
    const userCity = currentUser?.city;
    const cityEvents = (events || []).filter(e => isSameRegion(e.cityName, userCity));

    const schoolEventMap = {};
    cityEvents.forEach(evt => {
      const nameKey = (evt.schoolName || '').trim().toLowerCase();
      if (!schoolEventMap[nameKey]) schoolEventMap[nameKey] = [];
      schoolEventMap[nameKey].push(evt);
    });

    const completed = new Set();
    Object.entries(schoolEventMap).forEach(([schoolNameKey, evts]) => {
      const hasFullday = evts.some(e => e.session === 'Fullday');
      const hasHari1   = evts.some(e => e.session === 'Hari-1');
      const hasHari2   = evts.some(e => e.session === 'Hari-2');
      const hasHari3   = evts.some(e => e.session === 'Hari-3');

      const is3Hari    = evts.some(e => e.duration === '3 Hari');

      const isCompleted = hasFullday
        || (!is3Hari && hasHari1 && hasHari2)
        || (is3Hari && hasHari1 && hasHari2 && hasHari3);

      if (isCompleted) {
        completed.add(schoolNameKey);
      }
    });

    return completed;
  }, [events, currentUser?.city]);

  const mySchedule = useMemo(() => {
    const userId = currentUser?.id;
    return schools
      .filter((s) => {
        const opAssignments = s.operatorAssignments || s.operator_assignments;
        let isAssigned1 = false;
        let isAssigned2 = false;

        if (Array.isArray(opAssignments) && opAssignments.length > 0) {
          const day1 = opAssignments.find(a => a.day === 1);
          const day2 = opAssignments.find(a => a.day === 2);
          isAssigned1 = day1 ? (day1.operators || []).includes(userId) : false;
          isAssigned2 = day2 ? (day2.operators || []).includes(userId) : false;
        } else {
          const assigned1 = s.assignedTo;
          const assigned2 = s.eventDate2 ? s.assignedTo2 : null;
          isAssigned1 = !assigned1 || (Array.isArray(assigned1) && assigned1.length === 0) || (Array.isArray(assigned1) && assigned1.includes(userId)) || assigned1 === userId;
          isAssigned2 = s.eventDate2 && (!assigned2 || (Array.isArray(assigned2) && assigned2.length === 0) || (Array.isArray(assigned2) && assigned2.includes(userId)) || assigned2 === userId);
        }
        
        return isAssigned1 || isAssigned2;
      })
      .filter((s) => {
        // Hanya sekolah di kota operator
        const city = cities.find((c) => c.id === s.cityId);
        return isSameRegion(city?.name, currentUser?.city);
      })
      .filter((s) => {
        // Sembunyikan sekolah jika event yang ditugaskan ke operator ini sudah selesai
        const sNameKey = (s.name || '').trim().toLowerCase();
        
        const evts = (events || []).filter(e => (e.schoolName || '').trim().toLowerCase() === sNameKey);
        const hasFullday = evts.some(e => e.session === 'Fullday');
        const hasHari1   = evts.some(e => e.session === 'Hari-1');
        const hasHari2   = evts.some(e => e.session === 'Hari-2');
        
        if (hasFullday) return false;

        const opAssignments = s.operatorAssignments || s.operator_assignments;
        let isAssigned1 = false;
        let isAssigned2 = false;

        if (Array.isArray(opAssignments) && opAssignments.length > 0) {
          const day1 = opAssignments.find(a => a.day === 1);
          const day2 = opAssignments.find(a => a.day === 2);
          isAssigned1 = day1 ? (day1.operators || []).includes(userId) : false;
          isAssigned2 = day2 ? (day2.operators || []).includes(userId) : false;
        } else {
          const assigned1 = s.assignedTo;
          const assigned2 = s.assignedTo2;
          isAssigned1 = !assigned1 || (Array.isArray(assigned1) && assigned1.length === 0) || (Array.isArray(assigned1) && assigned1.includes(userId)) || assigned1 === userId;
          isAssigned2 = s.eventDate2 && (!assigned2 || (Array.isArray(assigned2) && assigned2.length === 0) || (Array.isArray(assigned2) && assigned2.includes(userId)) || assigned2 === userId);
        }

        if (isAssigned1 && isAssigned2) {
           return !(hasHari1 && hasHari2);
        } else if (isAssigned1) {
           return !hasHari1;
        } else if (isAssigned2) {
           return !hasHari2;
        }
        return false;
      })
      .map((s) => {
        const reg = (schoolRegistrations || []).find(
          (r) => r.schoolName?.toLowerCase().trim() === s.name?.toLowerCase().trim()
        );
        let rawDate1 = s.eventDate;
        let rawDate2 = s.eventDate2;
        
        const hasOct = reg?.selectedDates && reg.selectedDates.length > 0;
        const hasNov = reg?.selectedDatesNov && reg.selectedDatesNov.length > 0;
        const hasDec = reg?.selectedDatesDec && reg.selectedDatesDec.length > 0;
        
        if (hasOct || hasNov || hasDec) {
          const allDates = [];
          if (hasOct) reg.selectedDates.forEach(d => allDates.push({ y: 2026, m: 10, d }));
          if (hasNov) reg.selectedDatesNov.forEach(d => allDates.push({ y: 2026, m: 11, d }));
          if (hasDec) reg.selectedDatesDec.forEach(d => allDates.push({ y: 2026, m: 12, d }));
          allDates.sort((a, b) => a.m !== b.m ? a.m - b.m : a.d - b.d);
          
          if (allDates.length > 0) {
            rawDate1 = `${allDates[0].y}-${String(allDates[0].m).padStart(2, '0')}-${String(allDates[0].d).padStart(2, '0')}`;
            rawDate2 = null;
            if (allDates.length > 1) {
              rawDate2 = `${allDates[1].y}-${String(allDates[1].m).padStart(2, '0')}-${String(allDates[1].d).padStart(2, '0')}`;
            }
          }
        }
        
        const assigned1 = s.assignedTo;
        const assigned2 = s.assignedTo2;
        const isAssigned1 = !assigned1 || (Array.isArray(assigned1) && assigned1.length === 0) || (Array.isArray(assigned1) && assigned1.includes(userId)) || assigned1 === userId;
        const isAssigned2 = rawDate2 && (!assigned2 || (Array.isArray(assigned2) && assigned2.length === 0) || (Array.isArray(assigned2) && assigned2.includes(userId)) || assigned2 === userId);
        
        const eff1 = isAssigned1 ? rawDate1 : null;
        const eff2 = isAssigned2 ? rawDate2 : null;

        return { 
          ...s, 
          rawDate1, 
          rawDate2, 
          effectiveDate1: eff1, 
          effectiveDate2: eff2,
          isAssigned1,
          isAssigned2,
        };
      })
      .sort((a, b) => {
        const da = parseDate(a.effectiveDate1 || a.effectiveDate2 || a.rawDate1 || a.rawDate2);
        const db = parseDate(b.effectiveDate1 || b.effectiveDate2 || b.rawDate1 || b.rawDate2);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      });
  }, [schools, cities, currentUser, schoolRegistrations, completedSchoolNames, events]);

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 leading-tight">Jadwal Event Saya</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sekolah yang dijadwalkan event dan belum selesai terinput kegiatannya
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
            {mySchedule.length} Menunggu Pelaksanaan / Input
          </span>
        </div>
      </div>

      {mySchedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">Semua jadwal event telah selesai terinput!</p>
          <p className="text-xs mt-1 text-slate-600">
            Tidak ada target sekolah yang tertunda. Log kegiatan Anda dapat dicek pada tabel Riwayat Input di bawah.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {mySchedule.map((s) => (
              <ScheduleCard
                key={s.id}
                school={s}
                cities={cities}
                schoolData={schoolData}
                schoolRegistrations={schoolRegistrations}
                onClick={() => setDetailSchool(s)}
              />
            ))}
          </div>
        </div>
      )}

      {detailSchool && (
        <ClassDetailModal
          school={detailSchool}
          reg={findReg(schoolRegistrations, detailSchool.name)}
          onClose={() => setDetailSchool(null)}
        />
      )}
    </div>
  );
};

const ScheduleCard = ({ school, cities, schoolData = [], schoolRegistrations = [], dimmed = false, onClick }) => {
  const cityName = cities.find((c) => c.id === school.cityId)?.name || '-';
  // Hitung status berdasarkan tanggal tugas operator (effectiveDate1 / effectiveDate2)
  const status = getStatus(
    school.effectiveDate1 || (!school.effectiveDate2 ? school.rawDate1 : null),
    school.effectiveDate2 || (!school.effectiveDate1 ? school.rawDate2 : null)
  );
  const borderCls = cardBorderStyles[status.color] || cardBorderStyles.slate;
  const isToday = status.color === 'amber';

  // Ambil jumlahSiswa dari schoolData (Excel JSON) berdasarkan nama sekolah
  const matchedSchool = schoolData.find(
    (r) => r.schoolName?.toLowerCase().trim() === school.name?.toLowerCase().trim()
  );
  const dapodikCount = matchedSchool?.jumlahSiswa || 0;

  // Ambil total siswa peserta dari pendaftaran portal sekolah
  const reg = findReg(schoolRegistrations, school.name);
  const participatingCount = reg?.totalStudents || school.studentCount || 0;

  // Informasi Guru PJ dari pendaftaran portal sekolah
  const pjName = reg?.pjName && reg.pjName !== '-' ? reg.pjName : '';
  const pjPhone = (reg?.noHp || '').trim();
  const waDigits = pjPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');
  const waLink = waDigits ? `https://wa.me/${waDigits}` : '';

  const hasAnyDate = Boolean(school.effectiveDate1 || school.effectiveDate2 || school.rawDate1 || school.rawDate2);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      title="Klik untuk melihat jumlah siswa per kelas"
      className={`relative rounded-xl border bg-slate-900/60 p-4 flex flex-col gap-3 transition-all cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        ${borderCls} ${dimmed ? 'opacity-50' : 'hover:bg-slate-800/60 hover:border-indigo-500/40'}
        ${isToday ? 'shadow-lg shadow-amber-500/10' : ''}`}
    >
      {/* Nama sekolah + status */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span
            className="text-sm font-bold text-slate-100 leading-tight truncate"
            title={school.name}
          >
            {school.name}
          </span>
        </div>
        <span
          className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap
            ${statusStyles[status.color]}`}
        >
          {status.label}
        </span>
      </div>

      {/* Info rows */}
      <div className="space-y-1.5">
        <InfoRow icon={<MapPin className="w-3 h-3" />} text={cityName} />
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Users className="w-3 h-3 flex-shrink-0" />
          <span>
            <span className="font-semibold text-slate-200">{participatingCount}</span>
            {' '}Siswa
            {dapodikCount > 0 && (
              <span className="text-slate-500">
                {' '}dari total{' '}
                <span className="text-slate-400 font-medium">{dapodikCount.toLocaleString('id-ID')}</span>
                {' '}siswa
              </span>
            )}
          </span>
        </div>

        {/* Guru PJ */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 min-w-0">
          <UserRound className="w-3 h-3 flex-shrink-0" />
          <span className="truncate" title={pjName || ''}>
            Guru PJ:{' '}
            <span className={pjName ? 'font-semibold text-slate-200' : 'text-slate-500 italic'}>
              {pjName || 'Belum diisi'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Phone className="w-3 h-3 flex-shrink-0" />
          {pjPhone ? (
            <a
              href={waLink || `tel:${pjPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
              title="Hubungi via WhatsApp"
            >
              {pjPhone}
            </a>
          ) : (
            <span className="text-slate-500 italic">No. HP belum diisi</span>
          )}
        </div>

        {/* Tanggal Event */}
        {hasAnyDate ? (
          <div className="flex items-start gap-2">
            <Clock className="w-3 h-3 mt-0.5 text-purple-400/70 flex-shrink-0" />
            <div className="text-[11px] text-slate-300 leading-relaxed">
              {/* Baris Hari 1 */}
              {school.effectiveDate1 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>{formatDate(school.effectiveDate1)}</span>
                  {school.rawDate2 && (
                    <span className="px-1 py-0 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Hari 1
                    </span>
                  )}
                </div>
              ) : school.rawDate1 && school.rawDate2 ? (
                <div className="flex items-center gap-1.5 flex-wrap text-slate-500 text-[10px]">
                  <span>{formatDate(school.rawDate1)}</span>
                  <span className="px-1 py-0 rounded text-[8px] bg-slate-800 text-slate-400 border border-slate-700">
                    Hari 1 (Tim Lain)
                  </span>
                </div>
              ) : null}

              {/* Baris Hari 2 */}
              {school.effectiveDate2 ? (
                <div className={`flex items-center gap-1.5 flex-wrap ${(school.effectiveDate1 || school.rawDate1) ? 'mt-1' : ''}`}>
                  <span>{formatDate(school.effectiveDate2)}</span>
                  <span className="px-1 py-0 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Hari 2
                  </span>
                </div>
              ) : school.rawDate2 && school.effectiveDate1 ? (
                <div className="flex items-center gap-1.5 flex-wrap text-slate-500 text-[10px] mt-1">
                  <span>{formatDate(school.rawDate2)}</span>
                  <span className="px-1 py-0 rounded text-[8px] bg-slate-800 text-slate-400 border border-slate-700">
                    Hari 2 (Tim Lain)
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <InfoRow
            icon={<AlertCircle className="w-3 h-3 text-amber-400/60" />}
            text="Tanggal belum ditentukan"
            muted
          />
        )}
      </div>

      {/* Tanggal Demo */}
      {school.demoDate && (
        <div className="pt-2 border-t border-slate-700/50">
          <InfoRow
            icon={<CalendarDays className="w-3 h-3 text-blue-400/70" />}
            text={`Demo: ${formatDate(school.demoDate)}`}
            muted
          />
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon, text, muted = false }) => (
  <div className={`flex items-center gap-2 text-[11px] ${muted ? 'text-slate-500' : 'text-slate-400'}`}>
    <span className="flex-shrink-0">{icon}</span>
    <span className="truncate">{text}</span>
  </div>
);


/**
 * Popup daftar jumlah siswa per kelas berdasarkan data Portal Sekolah (classDetails)
 * Format classDetails: { "1A": 25, "1B": 24, "2A": 30, ... }
 */
const ClassDetailModal = ({ school, reg, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Kelompokkan kelas per tingkat, hanya kelas dengan nilai terisi
  const grouped = useMemo(() => {
    const details = reg?.classDetails || {};
    const groups = {};
    Object.entries(details).forEach(([className, raw]) => {
      if (raw === '' || raw === null || raw === undefined) return;
      const count = parseInt(raw, 10) || 0;
      const match = String(className).match(/^(\d+)/);
      const grade = match ? match[1] : 'Lainnya';
      if (!groups[grade]) groups[grade] = [];
      groups[grade].push({ className, count });
    });
    return Object.entries(groups)
      .sort(([a], [b]) => (parseInt(a, 10) || 99) - (parseInt(b, 10) || 99))
      .map(([grade, classes]) => ({
        grade,
        classes: classes.sort((x, y) => x.className.localeCompare(y.className, 'id', { numeric: true })),
        subtotal: classes.reduce((sum, c) => sum + c.count, 0),
      }));
  }, [reg]);

  const total = grouped.reduce((sum, g) => sum + g.subtotal, 0);
  const totalClasses = grouped.reduce((sum, g) => sum + g.classes.length, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 flex-shrink-0">
              <School className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-100 truncate" title={school.name}>{school.name}</h3>
              <p className="text-[11px] text-slate-400">Jumlah siswa per kelas (data Portal Sekolah)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!reg ? (
            <EmptyState text="Sekolah ini belum melakukan pendaftaran melalui Portal Sekolah." />
          ) : grouped.length === 0 ? (
            <EmptyState text="Data jumlah siswa per kelas belum diinput oleh sekolah." />
          ) : (
            <>
              {/* Ringkasan */}
              <div className="grid grid-cols-3 gap-2">
                <SummaryBox label="Total Siswa" value={total.toLocaleString('id-ID')} highlight />
                <SummaryBox label="Jumlah Kelas" value={totalClasses} />
                <SummaryBox label="Rombel / Tingkat" value={reg.rombelCount || '-'} />
              </div>

              {/* Per tingkat */}
              <div className="space-y-3">
                {grouped.map((g) => (
                  <div key={g.grade} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-indigo-400">
                        {g.grade === 'Lainnya' ? 'Lainnya' : `Kelas ${g.grade}`}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Subtotal: <span className="font-bold text-slate-200">{g.subtotal}</span> siswa
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {g.classes.map((c) => (
                        <div
                          key={c.className}
                          className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-center"
                        >
                          <span className="block text-[10px] font-bold text-slate-500">{c.className}</span>
                          <span className={`text-sm font-bold ${c.count > 0 ? 'text-slate-100' : 'text-slate-600'}`}>
                            {c.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 p-3 border-t border-slate-800 bg-slate-950/60">
          <span className="text-[10px] text-slate-500 truncate">
            {reg?.pjName && reg.pjName !== '-' ? `Guru PJ: ${reg.pjName}` : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryBox = ({ label, value, highlight = false }) => (
  <div
    className={`rounded-xl border p-2.5 text-center ${
      highlight ? 'border-indigo-500/30 bg-indigo-500/10' : 'border-slate-800 bg-slate-950/60'
    }`}
  >
    <span className="block text-[10px] text-slate-400">{label}</span>
    <span className={`text-base font-extrabold ${highlight ? 'text-indigo-300' : 'text-slate-200'}`}>{value}</span>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
    <ClipboardList className="w-9 h-9 mb-2 opacity-30" />
    <p className="text-xs">{text}</p>
  </div>
);
