import React, { useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { Wallet, TrendingUp, Target, Award } from 'lucide-react';

export const SalaryWidget = ({ role = 'operator' }) => {
  const { events, currentUser, salarySettings, payouts } = useAuth();

  const { fee, bonus, totalParticipating, uniqueEventDays, qualifyingDays } = useMemo(() => {
    // 1. Dapatkan setting fee personal untuk currentUser
    let baseFee = 0;
    let bonusFee = 0;

    if (Array.isArray(salarySettings) && currentUser) {
      const userSettings = salarySettings.find(s => s.userId === currentUser.id);
      if (userSettings) {
        baseFee = userSettings.fee;
        bonusFee = userSettings.bonus;
      }
    }

    // 2. Kumpulkan ID event yang sudah dicairkan untuk currentUser ini (format baru)
    const paidEventIds = new Set(
      payouts
        .filter(p => p.userId === currentUser?.id)
        .flatMap(p => p.details?.eventIds || [])
    );

    // Backward compatibility: payout lama tidak menyimpan eventIds
    const userHasOldFormatPayout = payouts
      .filter(p => p.userId === currentUser?.id)
      .some(p => !p.details?.eventIds);

    // 3. Hitung hanya event di kota yang sama yang BELUM dicairkan untuk user ini
    const userCity = currentUser?.city;
    
    const cityEventsUnpaid = events.filter((evt) => {
      if (evt.cityName !== userCity) return false;
      if (paidEventIds.has(evt.id)) return false;
      if (userHasOldFormatPayout && evt.payoutId) return false;
      return true;
    });

    const totalStudents = cityEventsUnpaid.reduce((sum, evt) => {
      return sum + (parseInt(evt.participatingStudents, 10) || 0);
    }, 0);

    // Kelompokkan per tanggal → hitung siswa harian → qualifying days
    const dailyStudentMap = new Map();
    cityEventsUnpaid.forEach(evt => {
      const students = parseInt(evt.participatingStudents, 10) || 0;
      dailyStudentMap.set(evt.date, (dailyStudentMap.get(evt.date) || 0) + students);
    });
    const totalEventDays = dailyStudentMap.size;
    const daysAbove250 = [...dailyStudentMap.values()].filter(count => count >= 250).length;

    return {
      fee: baseFee,
      bonus: bonusFee,
      totalParticipating: totalStudents,
      uniqueEventDays: totalEventDays,
      qualifyingDays: daysAbove250,
    };
  }, [events, currentUser, salarySettings, payouts]);

  // Perhitungan final
  const baseSalary = totalParticipating * fee;
  let bonusSalary = 0;
  let isBonusAchieved = false;
  let bonusStatusText = "";

  if (role === 'operator') {
    isBonusAchieved = totalParticipating >= 1000;
    bonusSalary = isBonusAchieved ? bonus : 0;
    bonusStatusText = isBonusAchieved ? `Tercapai (>= 1000)` : `Belum (Target: 1000)`;
  } else if (role === 'pioneer') {
    // Syarat: minimal 4 hari event dalam sepekan
    // Bonus: bonusFee × hari yang siswanya >= 250
    isBonusAchieved = uniqueEventDays >= 4 && qualifyingDays > 0;
    bonusSalary = isBonusAchieved ? bonus * qualifyingDays : 0;
    bonusStatusText = isBonusAchieved
      ? `Tercapai (${qualifyingDays} hari ≥250 siswa dari ${uniqueEventDays} hari)`
      : uniqueEventDays < 4
        ? `Belum (${uniqueEventDays}/4 hari, syarat minimal 4 hari)`
        : `Belum (0 hari dengan ≥250 siswa)`;
  }

  const totalSalary = baseSalary + bonusSalary;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 relative z-10 border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Estimasi Fee Mingguan</h2>
            <p className="text-xs text-slate-400">Total akumulasi fee belum cair di wilayah {currentUser?.city || 'Anda'}</p>
          </div>
        </div>
        {role === 'pioneer' && (
          <div className="text-right">
            <div className="text-sm font-bold text-indigo-400">{uniqueEventDays} Hari Aktif</div>
            <div className="text-xs text-slate-400">
              {qualifyingDays > 0 ? `${qualifyingDays} hari ≥250 siswa` : 'Belum ada hari ≥250 siswa'}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        
        {/* Card: Total Siswa */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Total Siswa
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {totalParticipating.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Card: Base Fee */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
            Base Fee (Rp {fee})
          </div>
          <div className="text-xl font-bold text-slate-200">
            Rp {baseSalary.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Card: Bonus Fee */}
        <div className={`bg-slate-900/60 p-4 rounded-xl border ${isBonusAchieved ? 'border-emerald-500/30' : 'border-slate-800'}`}>
          <div className="flex flex-col mb-1">
            <div className="flex items-center text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <Award className={`w-3.5 h-3.5 mr-1.5 ${isBonusAchieved ? 'text-emerald-400' : 'text-slate-500'}`} />
              Bonus {role === 'operator' ? '(Flat)' : '(Per Hari ≥250)'}
            </div>
            <span className={`text-[10px] mt-1 ${isBonusAchieved ? 'text-emerald-500' : 'text-rose-500/70'}`}>
              {bonusStatusText}
            </span>
          </div>
          <div className={`text-xl font-bold mt-2 ${isBonusAchieved ? 'text-emerald-400' : 'text-slate-500'}`}>
            + Rp {bonusSalary.toLocaleString('id-ID')}
          </div>
        </div>

        {/* Card: Total */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 p-4 rounded-xl border border-emerald-500/30">
          <div className="flex items-center text-emerald-400/80 text-xs font-bold mb-1 uppercase tracking-wider">
            Total Estimasi
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            Rp {totalSalary.toLocaleString('id-ID')}
          </div>
        </div>

      </div>
    </div>
  );
};
