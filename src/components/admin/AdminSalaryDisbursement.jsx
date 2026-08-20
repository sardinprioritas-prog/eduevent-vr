import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { Wallet, Target, Award, CheckCircle, FileText, ChevronDown, ChevronRight, Users2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AdminSalaryDisbursement = () => {
  const { users, events, salarySettings, payouts, handleDisburseFee, showToast } = useAuth();
  const [processingId, setProcessingId] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);

  // Helper to calculate unpaid fee for a specific user
  // Supports collaboration: event counts if user is main operator OR co-operator
  // Fee is split 50% when co_operator_id is present
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

    // Backward compatibility: payout lama tidak menyimpan eventIds
    const userHasOldFormatPayout = payouts
      .filter(p => p.userId === user.id)
      .some(p => !p.details?.eventIds);

    // Event belum dibayar:
    // Event masuk hitungan jika user adalah operator utama ATAU co-operator
    const unpaidEvents = events.filter((evt) => {
      const isMainOperator = evt.operatorName === user.name && evt.cityName === user.city;
      const isCoOperator = evt.coOperatorId === user.id;
      if (!isMainOperator && !isCoOperator) return false;
      if (paidEventIds.has(evt.id)) return false;
      if (userHasOldFormatPayout && evt.payoutId) return false;
      return true;
    });

    // Hitung total siswa dengan mempertimbangkan split fee:
    // - Jika ada co_operator_id → fee dibagi 50% (splitFactor = 0.5)
    // - Jika tidak ada kolaborasi → fee penuh (splitFactor = 1.0)
    let weightedStudentTotal = 0;
    const schoolBreakdown = [];

    unpaidEvents.forEach(evt => {
      const students = parseInt(evt.participatingStudents, 10) || 0;
      const isCollaboration = !!evt.coOperatorId;
      const splitFactor = isCollaboration ? 0.5 : 1.0;
      const effectiveStudents = students * splitFactor;

      weightedStudentTotal += effectiveStudents;

      schoolBreakdown.push({
        schoolName: evt.schoolName,
        date: evt.date,
        students,
        effectiveStudents,
        isCollaboration,
        splitFactor,
        session: evt.session,
      });
    });

    // Hitung totalStudents aktual (untuk bonus logic)
    const totalStudents = unpaidEvents.reduce((sum, evt) => sum + (parseInt(evt.participatingStudents, 10) || 0), 0);

    // Kelompokkan event per tanggal → hitung total siswa per hari (untuk bonus pioneer)
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

    const baseSalary = Math.round(weightedStudentTotal * baseFee);
    const totalSalary = baseSalary + bonusSalary;

    // Hitung berapa event yang kolaborasi
    const collabEventCount = unpaidEvents.filter(e => !!e.coOperatorId).length;
    
    return {
      baseSalary,
      bonusSalary,
      totalSalary,
      totalStudents,
      weightedStudentTotal,
      collabEventCount,
      uniqueEventDays,
      qualifyingDays,
      unpaidEvents,
      schoolBreakdown,
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
        weightedStudentTotal: userData.feeData.weightedStudentTotal,
        collabEventCount: userData.feeData.collabEventCount,
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

  const exportToPDF = () => {
    if (usersWithUnpaidFees.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const doc = new jsPDF('landscape');

    doc.setFontSize(15);
    doc.setTextColor(30, 41, 59);
    doc.text('LAPORAN PENCAIRAN FEE — OPERATOR & PIONEER', 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}  |  Total Anggota: ${usersWithUnpaidFees.length}`, 14, 22);

    const columns = ['No', 'Nama', 'Peran', 'Wilayah', 'Partisipan', 'Kolaborasi', 'Fee Dasar', 'Bonus', 'Total Fee', 'Status'];
    const rows = usersWithUnpaidFees.map((u, i) => [
      i + 1,
      u.name,
      u.role.toUpperCase(),
      u.city,
      `${u.feeData.totalStudents} siswa`,
      u.feeData.collabEventCount > 0 ? `${u.feeData.collabEventCount} event (50%)` : '-',
      `Rp ${u.feeData.baseSalary.toLocaleString('id-ID')}`,
      `Rp ${u.feeData.bonusSalary.toLocaleString('id-ID')}`,
      `Rp ${u.feeData.totalSalary.toLocaleString('id-ID')}`,
      u.feeData.totalSalary > 0 ? 'Belum Cair' : 'Lunas',
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: { 0: { halign: 'center', cellWidth: 10 } },
    });

    doc.save(`Laporan_Pencairan_Fee_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Berhasil mengekspor Laporan Pencairan PDF', 'success');
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 mr-3">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Pencairan Fee</h2>
            <p className="text-sm text-slate-400">
              Daftar Operator dan Pioneer beserta akumulasi fee yang belum dicairkan.
              Event kolaborasi 2 operator → fee dibagi 50% per orang.
            </p>
          </div>
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          Ekspor PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="py-4 font-medium px-2 w-6"></th>
              <th className="py-4 font-medium px-4">Nama</th>
              <th className="py-4 font-medium px-4">Wilayah</th>
              <th className="py-4 font-medium px-4 text-center">Partisipan</th>
              <th className="py-4 font-medium px-4 text-center">Kolaborasi</th>
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
              const isExpanded = expandedUserId === user.id;
              
              return (
                <React.Fragment key={user.id}>
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    {/* Expand toggle */}
                    <td className="py-4 pl-2">
                      {feeData.schoolBreakdown.length > 0 && (
                        <button
                          onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                          className="text-slate-500 hover:text-emerald-400 transition-colors"
                          title="Lihat detail sekolah"
                        >
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-200">{user.name}</div>
                      <div className="text-xs text-slate-500 uppercase">{user.role}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">{user.city}</td>
                    <td className="py-4 px-4 text-center text-sm">
                      <div>{feeData.totalStudents} Siswa</div>
                      {user.role === 'pioneer' && <div className="text-xs text-slate-500">{feeData.uniqueEventDays} Hari</div>}
                      {feeData.collabEventCount > 0 && (
                        <div className="text-xs text-amber-400">
                          ≈{Math.round(feeData.weightedStudentTotal)} efektif
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-sm">
                      {feeData.collabEventCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Users2 className="w-3 h-3" />
                          {feeData.collabEventCount} event (50%)
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
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

                  {/* Expanded: breakdown per sekolah */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className="px-6 pb-4 pt-0 bg-slate-900/40">
                        <div className="rounded-xl border border-slate-700/50 overflow-hidden">
                          <div className="px-4 py-2 bg-slate-800/60 flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                            <Target className="w-3.5 h-3.5 text-emerald-400" />
                            Breakdown Sekolah — {user.name}
                          </div>
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-slate-700/50 text-slate-400">
                                <th className="py-2 px-4">Sekolah</th>
                                <th className="py-2 px-4">Tanggal</th>
                                <th className="py-2 px-4">Sesi</th>
                                <th className="py-2 px-4 text-center">Siswa</th>
                                <th className="py-2 px-4 text-center">Status Fee</th>
                                <th className="py-2 px-4 text-right">Siswa Efektif</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                              {feeData.schoolBreakdown.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                                  <td className="py-2 px-4 font-medium text-slate-200">{row.schoolName}</td>
                                  <td className="py-2 px-4 text-slate-400">{row.date}</td>
                                  <td className="py-2 px-4 text-slate-400">{row.session}</td>
                                  <td className="py-2 px-4 text-center text-slate-300">{row.students}</td>
                                  <td className="py-2 px-4 text-center">
                                    {row.isCollaboration ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        <Users2 className="w-3 h-3" />
                                        Kolaborasi (50%)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        <Award className="w-3 h-3" />
                                        Mandiri (100%)
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-4 text-right font-semibold text-slate-200">
                                    {Number.isInteger(row.effectiveStudents) ? row.effectiveStudents : row.effectiveStudents.toFixed(1)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-slate-700/50 bg-slate-800/30">
                                <td colSpan={5} className="py-2 px-4 font-bold text-slate-300">Total Efektif</td>
                                <td className="py-2 px-4 text-right font-bold text-emerald-400">
                                  {Math.round(feeData.weightedStudentTotal)} siswa
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
