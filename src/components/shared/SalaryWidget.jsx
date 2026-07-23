import React, { useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { Wallet, TrendingUp, Target, Award } from 'lucide-react';

export const SalaryWidget = ({ role = 'operator' }) => {
  const { events, currentUser, salarySettings } = useAuth();

  const { fee, bonus, totalParticipating, uniqueEventDays } = useMemo(() => {
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

    // 2. Hitung jumlah partisipan & hari event di kota yang sama pada minggu ini
    const userCity = currentUser?.city;
    
    const cityEventsThisWeek = events.filter((evt) => {
      return evt.cityName === userCity && !evt.payoutId;
    });

    const totalStudents = cityEventsThisWeek.reduce((sum, evt) => {
      return sum + (parseInt(evt.participatingStudents, 10) || 0);
    }, 0);

    const uniqueDates = new Set(cityEventsThisWeek.map(evt => evt.date));
    
    return {
      fee: baseFee,
      bonus: bonusFee,
      totalParticipating: totalStudents,
      uniqueEventDays: uniqueDates.size
    };
  }, [events, currentUser, salarySettings]);

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
    isBonusAchieved = uniqueEventDays >= 4 && totalParticipating >= 250;
    bonusSalary = isBonusAchieved ? bonus * uniqueEventDays : 0;
    bonusStatusText = isBonusAchieved ? `Tercapai (${uniqueEventDays} hari, >= 250 siswa)` : `Belum (Syarat: >=4 hari & >=250 siswa)`;
  }

  const totalSalary = baseSalary + bonusSalary;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10 border-b border-slate-800 pb-4">
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
            <div className="text-xs text-slate-400">Belum Dicairkan</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        
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
              Bonus {role === 'operator' ? '(Flat)' : '(Pengali)'}
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
