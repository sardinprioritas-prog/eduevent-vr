import React, { useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { Wallet, TrendingUp, Target, Award } from 'lucide-react';

export const SalaryWidget = ({ role = 'operator' }) => {
  const { events, currentUser, salarySettings } = useAuth();

  const { fee, bonus, threshold, totalParticipating } = useMemo(() => {
    // 1. Dapatkan setting fee
    let baseFee = 1000;
    let bonusFee = 500;
    let targetThreshold = 1000;

    if (salarySettings) {
      if (role === 'pioneer') {
        baseFee = salarySettings.pioneerFee;
        bonusFee = salarySettings.pioneerBonus;
      } else {
        baseFee = salarySettings.operatorFee;
        bonusFee = salarySettings.operatorBonus;
      }
      targetThreshold = salarySettings.bonusThreshold;
    }

    // 2. Hitung jumlah partisipan di kota yang sama pada minggu ini
    const userCity = currentUser?.city;
    
    // Tentukan hari Senin s/d Minggu untuk minggu ini
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1 = Senin, 7 = Minggu
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const cityEventsThisWeek = events.filter((evt) => {
      const evtDate = new Date(evt.date);
      return evt.cityName === userCity && evtDate >= startOfWeek && evtDate <= endOfWeek;
    });

    const totalStudents = cityEventsThisWeek.reduce((sum, evt) => {
      return sum + (parseInt(evt.participatingStudents, 10) || 0);
    }, 0);

    return {
      fee: baseFee,
      bonus: bonusFee,
      threshold: targetThreshold,
      totalParticipating: totalStudents
    };
  }, [events, currentUser, salarySettings, role]);

  // Perhitungan final
  const baseSalary = totalParticipating * fee;
  const isBonusAchieved = totalParticipating >= threshold;
  const bonusSalary = isBonusAchieved ? (totalParticipating * bonus) : 0;
  const totalSalary = baseSalary + bonusSalary;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center space-x-3 mb-6 relative z-10 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-100">Estimasi Fee Mingguan</h2>
          <p className="text-xs text-slate-400">Total partisipan di wilayah {currentUser?.city || 'Anda'} minggu ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
        
        {/* Card: Total Siswa */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
            Total Siswa
          </div>
          <div className="text-2xl font-bold text-slate-100">
            {totalParticipating.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-400">/ {threshold}</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isBonusAchieved ? 'bg-emerald-500' : 'bg-blue-500'}`} 
              style={{ width: `${Math.min((totalParticipating / threshold) * 100, 100)}%` }} 
            />
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
          <div className="flex items-center text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
            <Award className={`w-3.5 h-3.5 mr-1.5 ${isBonusAchieved ? 'text-emerald-400' : 'text-slate-500'}`} />
            Bonus (Rp {bonus})
          </div>
          <div className={`text-xl font-bold ${isBonusAchieved ? 'text-emerald-400' : 'text-slate-500'}`}>
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
