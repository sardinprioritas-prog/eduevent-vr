import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { Users2, Search, MapPin, Calendar, CheckCircle, X, Pencil, School } from 'lucide-react';

/**
 * AdminEventCollab — hanya tampil di Admin view
 * Memungkinkan Admin untuk:
 *   - Melihat semua event lintas kota
 *   - Assign / remove Co-Operator pada event yang belum selesai (belum dicairkan)
 */
export const AdminEventCollab = () => {
  const { events, users, handleSaveEvent, showToast } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [selectedCoOp, setSelectedCoOp] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Ambil daftar operator & pioneer saja
  const operatorsAndPioneers = users.filter(
    u => (u.role === 'operator' || u.role === 'pioneer') && u.active !== false
  );

  // Daftar kota unik dari events
  const cities = useMemo(() => {
    const set = new Set(events.map(e => e.cityName).filter(Boolean));
    return [...set].sort();
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchSearch =
        evt.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.operatorName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = filterCity ? evt.cityName === filterCity : true;
      return matchSearch && matchCity;
    });
  }, [events, searchQuery, filterCity]);

  const startEdit = (evt) => {
    setEditingEventId(evt.id);
    setSelectedCoOp(evt.coOperatorId || '');
  };

  const cancelEdit = () => {
    setEditingEventId(null);
    setSelectedCoOp('');
  };

  const handleSaveCoOp = async (evt) => {
    setIsSaving(true);
    try {
      await handleSaveEvent({
        ...evt,
        coOperatorId: selectedCoOp || null,
      });
      showToast(
        selectedCoOp
          ? 'Co-operator berhasil di-assign ke event ini'
          : 'Co-operator berhasil dihapus dari event ini',
        'success'
      );
      setEditingEventId(null);
      setSelectedCoOp('');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getOperatorName = (userId) => {
    if (!userId) return null;
    const user = users.find(u => u.id === userId);
    return user ? `${user.name} (${user.city})` : userId;
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Manajemen Kolaborasi Operator</h2>
            <p className="text-xs text-slate-400">
              Assign co-operator ke event sekolah. Fee akan dibagi rata 50% antara operator utama dan co-operator.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Kota */}
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-all"
          >
            <option value="">Semua Kota</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari sekolah / operator..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          Event kolaborasi (fee 50% masing-masing)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          Event mandiri (fee penuh)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <CheckCircle className="w-3 h-3 text-slate-500" />
          Event sudah dicairkan (tidak bisa diubah)
        </div>
      </div>

      {/* Table */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800/80">
          <School className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">Tidak ada event yang ditemukan</p>
          <p className="text-xs text-slate-500 mt-1">Coba ubah filter atau kata kunci pencarian.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/80">
                <th className="py-3 px-4">Sekolah</th>
                <th className="py-3 px-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />Kota
                  </span>
                </th>
                <th className="py-3 px-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />Tanggal
                  </span>
                </th>
                <th className="py-3 px-4">Operator Utama</th>
                <th className="py-3 px-4">Co-Operator</th>
                <th className="py-3 px-4 text-center">Status Fee</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredEvents.map((evt) => {
                const isEditing = editingEventId === evt.id;
                const isPaid = !!evt.payoutId;
                const hasCollab = !!evt.coOperatorId;

                return (
                  <tr
                    key={evt.id}
                    className={`transition-colors ${isEditing ? 'bg-amber-500/5 border-l-2 border-l-amber-500/40' : 'hover:bg-slate-800/40'}`}
                  >
                    {/* Sekolah */}
                    <td className="py-3 px-4 font-bold text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasCollab ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <div>
                          <div>{evt.schoolName}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{evt.session} · {evt.participatingStudents} siswa</div>
                        </div>
                      </div>
                    </td>

                    {/* Kota */}
                    <td className="py-3 px-4 text-slate-300">{evt.cityName}</td>

                    {/* Tanggal */}
                    <td className="py-3 px-4 text-slate-400">{evt.date}</td>

                    {/* Operator Utama */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {evt.operatorName || '—'}
                      </span>
                    </td>

                    {/* Co-Operator */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          value={selectedCoOp}
                          onChange={e => setSelectedCoOp(e.target.value)}
                          className="bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 transition-all min-w-[180px]"
                          autoFocus
                        >
                          <option value="">— Tidak Ada Co-Operator —</option>
                          {operatorsAndPioneers
                            .filter(u => u.name !== evt.operatorName) // jangan pilih diri sendiri
                            .map(u => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.city})
                              </option>
                            ))
                          }
                        </select>
                      ) : (
                        evt.coOperatorId ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Users2 className="w-3 h-3" />
                            {getOperatorName(evt.coOperatorId)}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )
                      )}
                    </td>

                    {/* Status Fee */}
                    <td className="py-3 px-4 text-center">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          Sudah Cair
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Belum Cair
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right">
                      {isPaid ? (
                        <span className="text-slate-600 text-[10px] italic">Terkunci</span>
                      ) : isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSaveCoOp(evt)}
                            disabled={isSaving}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all disabled:opacity-50"
                          >
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(evt)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/30 transition-all ml-auto"
                          title="Assign Co-Operator"
                        >
                          <Pencil className="w-3 h-3" />
                          Assign Co-Op
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-500 flex items-start gap-2">
        <Users2 className="w-4 h-4 text-amber-400/70 flex-shrink-0 mt-0.5" />
        <span>
          Event yang sudah dicairkan tidak dapat diubah co-operatornya. 
          Pastikan assign co-operator dilakukan <strong className="text-slate-400">sebelum</strong> pencairan fee.
          Fee kolaborasi: masing-masing operator mendapat <strong className="text-amber-400">50%</strong> dari total siswa × tarif personal.
        </span>
      </div>
    </div>
  );
};
