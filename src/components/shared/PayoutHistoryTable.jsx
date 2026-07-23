import React from 'react';
import { useAuth } from '../../context/useAuth';
import { History, Calendar, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const PayoutHistoryTable = () => {
  const { payouts, currentUser, showToast } = useAuth();
  
  const userPayouts = payouts.filter(p => p.userId === currentUser?.id);

  const exportToPDF = () => {
    if (userPayouts.length === 0) {
      showToast('Tidak ada riwayat pencairan untuk diekspor', 'warning');
      return;
    }

    const doc = new jsPDF('landscape');
    const role = currentUser?.role === 'pioneer' ? 'PIONEER' : 'OPERATOR';

    doc.setFontSize(15);
    doc.setTextColor(30, 41, 59);
    doc.text(`RIWAYAT PENCAIRAN FEE — ${role}: ${(currentUser?.name || '').toUpperCase()}`, 14, 15);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Wilayah: ${currentUser?.city || '-'}  |  Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}  |  Total: ${userPayouts.length} pencairan`,
      14, 22
    );

    const columns = ['No', 'Tanggal Pencairan', 'Siswa', currentUser?.role === 'pioneer' ? 'Hari Kualifikasi' : '', 'Fee Dasar', 'Bonus', 'Total Dibayarkan'].filter(Boolean);
    const rows = userPayouts.map((p, i) => {
      const date = new Date(p.createdAt).toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const base = [
        i + 1,
        date,
        `${p.details?.totalStudents || 0} siswa`,
      ];
      if (currentUser?.role === 'pioneer') {
        const qDays = p.details?.qualifyingDays != null
          ? `${p.details.qualifyingDays} hari ≥250 (${p.details.uniqueEventDays || 0} total)`
          : `${p.details?.uniqueEventDays || 0} hari`;
        base.push(qDays);
      }
      base.push(
        `Rp ${(p.details?.baseSalary || 0).toLocaleString('id-ID')}`,
        `Rp ${(p.details?.bonusSalary || 0).toLocaleString('id-ID')}`,
        `Rp ${(p.amount || 0).toLocaleString('id-ID')}`,
      );
      return base;
    });

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });

    const name = (currentUser?.name || 'user').replace(/\s+/g, '_');
    doc.save(`Riwayat_Pencairan_${name}_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Berhasil mengekspor Riwayat Pencairan PDF', 'success');
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 mr-3">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Riwayat Pencairan</h2>
            <p className="text-sm text-slate-400">Histori pencairan fee yang telah dibayarkan oleh admin.</p>
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

      {userPayouts.length === 0 ? (
        <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800/80">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-400">Belum ada riwayat pencairan</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-sm">
                <th className="py-3 px-4 font-medium">Tanggal Pencairan</th>
                <th className="py-3 px-4 font-medium text-center">Partisipan / Hari</th>
                <th className="py-3 px-4 font-medium text-right">Fee Dasar</th>
                <th className="py-3 px-4 font-medium text-right">Bonus</th>
                <th className="py-3 px-4 font-medium text-right text-emerald-400">Total Dibayarkan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {userPayouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 text-sm text-slate-300">
                    {new Date(p.createdAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-4 px-4 text-center text-sm">
                    {p.details?.totalStudents || 0} Siswa
                    {currentUser?.role === 'pioneer' && (
                      <div className="text-xs text-slate-500">
                        {p.details?.qualifyingDays != null
                          ? `${p.details.qualifyingDays} hari ≥250 siswa (${p.details.uniqueEventDays || 0} hari total)`
                          : `${p.details?.uniqueEventDays || 0} Hari`}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right text-sm">Rp {(p.details?.baseSalary || 0).toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4 text-right text-sm">Rp {(p.details?.bonusSalary || 0).toLocaleString('id-ID')}</td>
                  <td className="py-4 px-4 text-right font-bold text-emerald-400">
                    Rp {(p.amount || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
