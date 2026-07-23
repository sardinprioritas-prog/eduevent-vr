import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { UserCheck, Shield, BarChart3, Plus, Key, Edit, Trash2, CheckCircle2, XCircle, Search, Mail } from 'lucide-react';

export const UserManagement = () => {
  const { users, cities, handleSaveUser, handleDeleteUser, showToast } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'operator',
    city: cities[0]?.name || 'Bone',
    active: true,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingUser) {
      handleSaveUser({
        ...editingUser,
        ...formData,
      });
      setEditingUser(null);
    } else {
      handleSaveUser(formData);
    }

    setFormData({ name: '', email: '', role: 'operator', city: cities[0]?.name || 'Bone', active: true });
    setShowAddForm(false);
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role || 'operator',
      city: user.city || (cities[0]?.name || 'Bone'),
      active: user.active !== false,
    });
    setShowAddForm(true);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'operator', city: cities[0]?.name || 'Bone', active: true });
  };

  const handleResetPassword = (email) => {
    showToast(`Link reset password telah dikirim ke ${email}`, 'info');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case 'operator':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <UserCheck className="w-3 h-3 mr-1 text-emerald-400" />
            Operator Lapangan
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Shield className="w-3 h-3 mr-1 text-blue-400" />
            Admin Sistem
          </span>
        );
      case 'pimpinan':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <BarChart3 className="w-3 h-3 mr-1 text-purple-400" />
            Pimpinan / Executive
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Manajemen Pengguna & Otorisasi Hak Akses (RBAC)</h2>
            <p className="text-xs text-slate-400">
              Kelola pendaftaran akun, peran pengguna (Operator, Admin, Pimpinan), dan reset password
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-48">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-500"
            />
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all"
            >
              <Plus className="w-4 h-4 mr-1" />
              Daftarkan Akun Baru
            </button>
          )}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-900/80 rounded-xl border border-slate-700 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {editingUser ? 'Edit Hak Akses Akun' : 'Daftarkan Akun Pengguna Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Nama Pengguna"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Kredensial</label>
              <input
                type="email"
                required
                placeholder="email@eduevent.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Role / Hak Akses</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-semibold text-purple-300"
              >
                <option value="operator">Operator (Data Entry)</option>
                <option value="admin">Admin (System Management)</option>
                <option value="pimpinan">Pimpinan (Executive Analytics)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Kota Domisili / Tugas</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
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
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
            >
              {editingUser ? 'Simpan Akun' : 'Daftarkan Akun'}
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/80">
              <th className="py-3 px-4">Nama Pengguna</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Peran (Role)</th>
              <th className="py-3 px-4">Wilayah Tugas</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Aksi & Keamanan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-100">{u.name}</td>
                <td className="py-3 px-4 text-slate-300 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {u.email}
                </td>
                <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                <td className="py-3 px-4 text-slate-400">{u.city || 'Nasional'}</td>
                <td className="py-3 px-4 text-center">
                  {u.active !== false ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400">
                      Non-Aktif
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleResetPassword(u.email)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                      title="Reset Password Sim"
                    >
                      <Key className="w-4 h-4 text-amber-400" />
                    </button>
                    <button
                      onClick={() => startEdit(u)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Account"
                    >
                      <Edit className="w-4 h-4 text-purple-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 transition-colors"
                      title="Hapus Account"
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
