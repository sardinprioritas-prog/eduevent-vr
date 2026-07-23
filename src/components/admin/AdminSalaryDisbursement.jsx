import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { Wallet, Target, Award, CheckCircle } from 'lucide-react';

export const AdminSalaryDisbursement = () => {
  const { users, events, salarySettings, payouts, handleDisburseFee } = useAuth();
  const [processingId, setProcessingId] = useState(null);

  // Helper to calculate unpaid fee for a specific user
  const calculateUnpaidFee = (user) => {
    // Get personal fee setting
    let baseFee = 0;
    let bonusFee = 0;
    
    if (Array.isArray(salarySettings)) {
      const userSettings = salarySettings.find(s => s.userId === user.id);
      if (userSettings) {
        baseFee = userSettings.fee;
        bonusFee = userSettings.bonus;
      }
    }

    // Kumpulkan ID event yang sudah dicairkan KHUSUS untuk user ini (format baru)
    const paidEventIds = new Set(
      payouts
        .filter(p => p.userId === user.id)
        .flatMap(p => p.details?.eventIds || [])
    );

    // Backward compatibility: payout lama (sebelum fix) tidak menyimpan eventIds.
    // Jika user punya payout lama, gunakan evt.payoutId sebagai penanda tambahan
    // agar event yang sudah dibayar tidak dihitung ulang.
    const userHasOldFormatPayout = payouts
      .filter(p => p.userId === user.id)
      .some(p => !p.details?.eventIds);

    // Event belum dibayar:
    //   - Harus di kota yang sama
    //   - Belum ada di payout baru user ini (format baru)
    //   - Jika user punya payout lama: event juga tidak boleh sudah bertanda payout_id
    const unpaidEvents = events.filter((evt) => {
      if (evt.cityName !== user.city) return false;
      if (paidEventIds.has(evt.id)) return false;
      if (userHasOldFormatPayout && evt.payoutId) return false;
      return true;
    });

    const totalStudents = unpaidEvents.reduce((sum, evt) => sum + (parseInt(evt.participatingStudents, 10) || 0), 0);

    // Kelompokkan event per tanggal → hitung total siswa per hari
    const dailyStudentMap = new Map();
    unpaidEvents.forEach(evt => {
      const students = parseInt(evt.participatingStudents, 10) || 0;
      dailyStudentMap.set(evt.date, (dailyStudentMap.get(evt.date) || 0) + students);
    });
    const uniqueEventDays = dailyStudentMap.size;
    // Hari yang memenuhi syarat bonus: siswa >= 250 (sebagai multiplier bonus Pioneer)
    const qualifyingDays = [...dailyStudentMap.values()].filter(count => count >= 250).length;

    let bonusSalary = 0;
    let isBonusAchieved = false;

    if (user.role === 'operator') {
      isBonusAchieved = totalStudents >= 1000;
      bonusSalary = isBonusAchieved ? bonusFee : 0;
    } else if (user.role === 'pioneer') {
      // Syarat: minimal 4 hari event dalam sepekan
      // Bonus: bonusFee × jumlah hari yang siswanya >= 250
      isBonusAchieved = uniqueEventDays >= 4 && qualifyingDays > 0;
      bonusSalary = isBonusAchieved ? bonusFee * qualifyingDays : 0;
    }

    const baseSalary = totalStudents * baseFee;
    const totalSalary = baseSalary + bonusSalary;
    
    return {
      baseSalary,
      bonusSalary,
      totalSalary,
      totalStudents,
      uniqueEventDays,
      qualifyingDays,
      unpaidEvents,
      isBonusAchieved,
      eventIdsToUpdate: unpaidEvents.map(e => e.id)
    };
  };

  const usersWithUnpaidFees = useMemo(() => {
    return users
      .filter(u => u.role === 'operator' || u.role === 'pioneer')
      .map(user => ({
        ...user,
        feeData: calculateUnpaidFee(user)
      }));
  }, [users, events, salarySettings, payouts]);

  const onDisburse = async (userData) => {
    if (userData.feeData.totalSalary === 0) return;
    if (!window.confirm(`Yakin ingin mencairkan fee sebesar Rp ${userData.feeData.totalSalary.toLocaleString('id-ID')} untuk ${userData.name}?`)) return;

    try {
      setProcessingId(userData.id);
      const details = {
        baseSalary: userData.feeData.baseSalary,
        bonusSalary: userData.feeData.bonusSalary,
        totalStudents: userData.feeData.totalStudents,
        uniqueEventDays: userData.feeData.uniqueEventDays,
        qualifyingDays: userData.feeData.qualifyingDays,
        isBonusAchieved: userData.feeData.isBonusAchieved,
        // Simpan ID event yang dicairkan agar kalkulasi berikutnya akurat per-user
        eventIds: userData.feeData.eventIdsToUpdate,
      };
      await handleDisburseFee(
        userData.id,
        userData.feeData.totalSalary,
        details,
        userData.feeData.eventIdsToUpdate
      );
      alert('Pencairan berhasil!');
    } catch (err) {
      console.error(err);
      alert('Gagal mencairkan fee');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center mb-6">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 mr-3">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Pencairan Fee</h2>
          <p className="text-sm text-slate-400">Daftar Operator dan Pioneer beserta akumulasi fee yang belum dicairkan.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="py-4 font-medium px-4">Nama</th>
              <th className="py-4 font-medium px-4">Wilayah</th>
              <th className="py-4 font-medium px-4 text-center">Partisipan</th>
              <th className="py-4 font-medium px-4 text-right">Fee Dasar</th>
              <th className="py-4 font-medium px-4 text-right">Bonus</th>
              <th className="py-4 font-medium px-4 text-right text-emerald-400">Total Fee</th>
              <th className="py-4 font-medium px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {usersWithUnpaidFees.map((user) => {
              const { feeData } = user;
              const hasFee = feeData.totalSalary > 0;
              
              return (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-200">{user.name}</div>
                    <div className="text-xs text-slate-500 uppercase">{user.role}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-300">{user.city}</td>
                  <td className="py-4 px-4 text-center text-sm">
                    {feeData.totalStudents} Siswa
                    {user.role === 'pioneer' && <div className="text-xs text-slate-500">{feeData.uniqueEventDays} Hari</div>}
                  </td>
                  <td className="py-4 px-4 text-right text-sm">Rp {feeData.baseSalary.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4 text-right text-sm">Rp {feeData.bonusSalary.toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-400">
                    Rp {feeData.totalSalary.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {hasFee ? (
                      <button
                        onClick={() => onDisburse(user)}
                        disabled={processingId === user.id}
                        className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {processingId === user.id ? 'Memproses...' : 'Cairkan'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center text-xs text-slate-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Lunas
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
