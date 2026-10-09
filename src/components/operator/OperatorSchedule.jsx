import React, { useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { useSchoolData } from '../../hooks/useSchoolData';
import {
  CalendarDays, MapPin, Users, Clock, CheckCircle2,
  AlertCircle, CalendarClock, Building2, ClipboardList,
} from 'lucide-react';

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
  const latest = d2 || d1;
  const earliest = d1;

  if (!earliest) return { label: 'Belum Terjadwal', color: 'slate' };

  if (latest < TODAY) return { label: 'Selesai', color: 'emerald' };

  if (
    earliest.getTime() === TODAY.getTime() ||
    (d2 && d2.getTime() === TODAY.getTime())
  ) return { label: 'Hari Ini!', color: 'amber' };

  const days = Math.ceil((earliest - TODAY) / (1000 * 60 * 60 * 24));
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
  const { schoolData, loading: excelLoading } = useSchoolData();

  // Hitung set nama sekolah yang telah selesai diinput kegiatannya di kota ini
  const completedSchoolNames = useMemo(() => {
    const userCity = currentUser?.city;
    const cityEvents = (events || []).filter(e => e.cityName === userCity);

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
        // Tampilkan jika: assignedTo kosong/null (All Team) ATAU mengandung userId (baik event 1 atau event 2)
        const assigned1 = s.assignedTo;
        const assigned2 = s.assignedTo2;
        
        const isAssigned1 = !assigned1 || (Array.isArray(assigned1) && assigned1.length === 0) || (Array.isArray(assigned1) && assigned1.includes(userId)) || assigned1 === userId;
        const isAssigned2 = s.eventDate2 && (!assigned2 || (Array.isArray(assigned2) && assigned2.length === 0) || (Array.isArray(assigned2) && assigned2.includes(userId)) || assigned2 === userId);
        
        return isAssigned1 || isAssigned2;
      })
      .filter((s) => {
        // Hanya sekolah di kota operator
        const city = cities.find((c) => c.id === s.cityId);
        return city?.name === currentUser?.city;
      })
      .filter((s) => {
        // Sembunyikan sekolah jika event yang ditugaskan ke operator ini sudah selesai
        const sNameKey = (s.name || '').trim().toLowerCase();
        
        const evts = events.filter(e => (e.schoolName || '').trim().toLowerCase() === sNameKey);
        const hasFullday = evts.some(e => e.session === 'Fullday');
        const hasHari1   = evts.some(e => e.session === 'Hari-1');
        const hasHari2   = evts.some(e => e.session === 'Hari-2');
        
        if (hasFullday) return false;

        const assigned1 = s.assignedTo;
        const assigned2 = s.assignedTo2;
        const isAssigned1 = !assigned1 || (Array.isArray(assigned1) && assigned1.length === 0) || (Array.isArray(assigned1) && assigned1.includes(userId)) || assigned1 === userId;
        const isAssigned2 = s.eventDate2 && (!assigned2 || (Array.isArray(assigned2) && assigned2.length === 0) || (Array.isArray(assigned2) && assigned2.includes(userId)) || assigned2 === userId);

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
        let eff1 = s.eventDate;
        let eff2 = s.eventDate2;
        
        const hasOct = reg?.selectedDates && reg.selectedDates.length > 0;
        const hasNov = reg?.selectedDatesNov && reg.selectedDatesNov.length > 0;
        
        if (hasOct || hasNov) {
          const allDates = [];
          if (hasOct) reg.selectedDates.forEach(d => allDates.push({ y: 2026, m: 10, d }));
          if (hasNov) reg.selectedDatesNov.forEach(d => allDates.push({ y: 2026, m: 11, d }));
          allDates.sort((a, b) => a.m !== b.m ? a.m - b.m : a.d - b.d);
          
          if (allDates.length > 0) {
            eff1 = `${allDates[0].y}-${String(allDates[0].m).padStart(2, '0')}-${String(allDates[0].d).padStart(2, '0')}`;
            eff2 = null;
            if (allDates.length > 1) {
              eff2 = `${allDates[1].y}-${String(allDates[1].m).padStart(2, '0')}-${String(allDates[1].d).padStart(2, '0')}`;
            }
          }
        }
        
        const assigned1 = s.assignedTo;
        const assigned2 = s.assignedTo2;
        const isAssigned1 = !assigned1 || (Array.isArray(assigned1) && assigned1.length === 0) || (Array.isArray(assigned1) && assigned1.includes(userId)) || assigned1 === userId;
        const isAssigned2 = s.eventDate2 && (!assigned2 || (Array.isArray(assigned2) && assigned2.length === 0) || (Array.isArray(assigned2) && assigned2.includes(userId)) || assigned2 === userId);
        
        if (!isAssigned1) eff1 = null;
        if (!isAssigned2) eff2 = null;

        return { ...s, effectiveDate1: eff1, effectiveDate2: eff2 };
      })
      .sort((a, b) => {
        const da = parseDate(a.effectiveDate1);
        const db = parseDate(b.effectiveDate1);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      });
  }, [schools, cities, currentUser, schoolRegistrations, completedSchoolNames]);

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
              <ScheduleCard key={s.id} school={s} cities={cities} schoolData={schoolData} schoolRegistrations={schoolRegistrations} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ScheduleCard = ({ school, cities, schoolData = [], schoolRegistrations = [], dimmed = false }) => {
  const cityName = cities.find((c) => c.id === school.cityId)?.name || '-';
  const status = getStatus(school.effectiveDate1 || school.eventDate, school.effectiveDate2 || school.eventDate2);
  const isMultiDay = !!school.effectiveDate2;
  const borderCls = cardBorderStyles[status.color] || cardBorderStyles.slate;
  const isToday = status.color === 'amber';

  // Ambil jumlahSiswa dari schoolData (Excel JSON) berdasarkan nama sekolah
  const matchedSchool = schoolData.find(
    (r) => r.schoolName?.toLowerCase().trim() === school.name?.toLowerCase().trim()
  );
  const dapodikCount = matchedSchool?.jumlahSiswa || 0;

  // Ambil total siswa peserta dari pendaftaran portal sekolah
  const reg = schoolRegistrations.find(
    (r) => r.schoolName?.toLowerCase().trim() === school.name?.toLowerCase().trim()
  );
  const participatingCount = reg?.totalStudents || school.studentCount || 0;

  return (
    <div
      className={`relative rounded-xl border bg-slate-900/60 p-4 flex flex-col gap-3 transition-all
        ${borderCls} ${dimmed ? 'opacity-50' : 'hover:bg-slate-800/60'}
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

        {/* Tanggal Event */}
        {school.effectiveDate1 ? (
          <div className="flex items-start gap-2">
            <Clock className="w-3 h-3 mt-0.5 text-purple-400/70 flex-shrink-0" />
            <div className="text-[11px] text-slate-300 leading-relaxed">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span>{formatDate(school.effectiveDate1)}</span>
                {(school.effectiveDate1 && school.effectiveDate2) && (
                  <span className="px-1 py-0 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Hari 1
                  </span>
                )}
              </div>
              {school.effectiveDate2 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  <span>{formatDate(school.effectiveDate2)}</span>
                  <span className="px-1 py-0 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Hari 2
                  </span>
                </div>
              )}
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
