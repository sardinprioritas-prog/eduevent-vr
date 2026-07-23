import React from 'react';
import { useAuth } from '../../context/useAuth';
import { History, Calendar } from 'lucide-react';

export const PayoutHistoryTable = () => {
  const { payouts, currentUser } = useAuth();
  
  const userPayouts = payouts.filter(p => p.userId === currentUser?.id);

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center mb-6">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 mr-3">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Riwayat Pencairan</h2>
          <p className="text-sm text-slate-400">Histori pencairan fee yang telah dibayarkan oleh admin.</p>
        </div>
      </div>

      {userPayouts.length === 0 ? (
        <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800/80">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-400">Belum ada riwayat pencairan</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                    {currentUser?.role === 'pioneer' && <div className="text-xs text-slate-500">{p.details?.uniqueEventDays || 0} Hari</div>}
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
