import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';

export const CityManagement = () => {
  const { cities, handleSaveCity, handleDeleteCity } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCity, setEditingCity] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    province: 'Sulawesi Selatan',
    active: true,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCity) {
      handleSaveCity({
        ...editingCity,
        ...formData,
      });
      setEditingCity(null);
    } else {
      handleSaveCity(formData);
    }

    setFormData({ name: '', province: 'Sulawesi Selatan', active: true });
    setShowAddForm(false);
  };

  const startEdit = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      province: city.province || 'Sulawesi Selatan',
      active: city.active !== false,
    });
    setShowAddForm(true);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingCity(null);
    setFormData({ name: '', province: 'Sulawesi Selatan', active: true });
  };

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Manajemen Master Data Kota</h2>
            <p className="text-xs text-slate-400">
              Kelola referensi wilayah untuk ekspansi program VR
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-48">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
            />
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah Kota Baru
            </button>
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal/Drawer */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-900/80 rounded-xl border border-slate-700 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {editingCity ? 'Edit Data Kota' : 'Tambah Wilayah / Kota Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nama Kota / Kabupaten</label>
              <input
                type="text"
                required
                placeholder="Contoh: Wajo, Bulukumba, dll"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Provinsi</label>
              <input
                type="text"
                required
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status Aktivasi</label>
              <select
                value={formData.active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, active: e.target.value === 'active' })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="active">Aktif (Tampil di Operator)</option>
                <option value="inactive">Non-Aktif (Disembunyikan)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={cancelForm}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
            >
              {editingCity ? 'Simpan Perubahan' : 'Tambah Kota'}
            </button>
          </div>
        </form>
      )}

      {/* City List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/80">
              <th className="py-3 px-4">Nama Kota</th>
              <th className="py-3 px-4">Provinsi</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredCities.map((city) => (
              <tr key={city.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-100">{city.name}</td>
                <td className="py-3 px-4 text-slate-400">{city.province || 'Sulawesi Selatan'}</td>
                <td className="py-3 px-4 text-center">
                  {city.active !== false ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <XCircle className="w-3 h-3 mr-1 text-rose-400" />
                      Non-Aktif
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => startEdit(city)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Kota"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteCity(city.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 transition-colors"
                      title="Hapus Kota"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
