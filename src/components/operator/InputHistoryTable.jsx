import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { History, Search, Edit3, Trash2, Calendar, MapPin, Users, Award, CheckCircle } from 'lucide-react';

export const InputHistoryTable = ({ onEditEvent }) => {
  const { events, handleDeleteEvent } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter(
    (e) =>
      e.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.cityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Riwayat Input Kegiatan VR</h2>
            <p className="text-xs text-slate-400">
              Daftar seluruh log kegiatan yang baru diinput di lapangan
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari sekolah atau kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800/80">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">Belum ada data kegiatan VR</p>
          <p className="text-xs text-slate-500 mt-1">Gunakan form di atas untuk menambahkan entri kegiatan baru.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/80">
                <th className="py-3 px-4">Sekolah</th>
                <th className="py-3 px-4">Kota</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Durasi & Sesi</th>
                <th className="py-3 px-4 text-center">Partisipan / Dapodik</th>
                <th className="py-3 px-4 text-center">Konversi %</th>
                <th className="py-3 px-4 text-center">Status Fee</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredEvents.map((item) => {
                const rate =
                  item.dapodikStudents > 0
                    ? ((item.participatingStudents / item.dapodikStudents) * 100).toFixed(1)
                    : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2.5" />
                      {item.schoolName}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center text-slate-300">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {item.cityName}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="inline-flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {item.date}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                          {item.duration}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                          {item.session}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-emerald-400 font-bold">{item.participatingStudents}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-400">{item.dapodikStudents}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          rate >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : rate >= 50
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {item.payoutId ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sudah Cair
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Belum Cair
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onEditEvent(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Kegiatan"
                        >
                          <Edit3 className="w-4 h-4 text-amber-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(item.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-800/40"
                          title="Hapus Kegiatan"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
