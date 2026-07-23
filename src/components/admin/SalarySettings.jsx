import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { Settings, Save, User } from 'lucide-react';

export const SalarySettings = () => {
  const { users, salarySettings, handleSaveSalarySettings } = useAuth();

  const operatorsAndPioneers = users.filter(u => u.role === 'operator' || u.role === 'pioneer');
  
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const [formData, setFormData] = useState({
    userId: '',
    fee: 0,
    bonus: 0,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedUserId && salarySettings) {
      const userSettings = salarySettings.find(s => s.userId === selectedUserId) || {
        userId: selectedUserId,
        fee: 0,
        bonus: 0,
      };
      setFormData(userSettings);
    } else {
      setFormData({ userId: '', fee: 0, bonus: 0 });
    }
  }, [selectedUserId, salarySettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsSaving(true);
    await handleSaveSalarySettings(formData);
    setIsSaving(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const isOperator = selectedUser?.role === 'operator';
  const isPioneer = selectedUser?.role === 'pioneer';

  return (
    <div className="glass-card rounded-3xl p-8 mb-8 border border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center space-x-4 mb-8 border-b border-slate-800 pb-4 relative z-10">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Pengaturan Gaji & Fee Personal</h2>
          <p className="text-sm text-slate-400">Pilih akun Operator atau Pioneer untuk mengatur tarif komisi</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {/* User Selection */}
        <div className="md:w-1/2 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Pilih Pengguna</label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-emerald-400"><User className="w-4 h-4" /></span>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>-- Pilih Operator atau Pioneer --</option>
              {operatorsAndPioneers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()} - {u.city})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Form */}
        {selectedUser && (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <h3 className={`text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-2 ${isOperator ? 'text-emerald-400' : 'text-purple-400'}`}>
                  Komisi {isOperator ? 'Operator' : 'Pioneer'}
                </h3>
                
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Nilai Fee (per Siswa)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-500">Rp</span>
                    <input
                      type="number"
                      name="fee"
                      value={formData.fee}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Dikalikan dengan total siswa di wilayah ini (seminggu)</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    {isOperator ? 'Paket Bonus (Manual Flat)' : 'Nominal Bonus (Pengali)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-500">Rp</span>
                    <input
                      type="number"
                      name="bonus"
                      value={formData.bonus}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    {isOperator 
                      ? 'Cair 100% jika total siswa wilayah mencapai 1000/minggu' 
                      : 'Cair jika event >4 hari dan total siswa wilayah >250/minggu. Dikalikan jumlah hari event aktual.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-start">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center px-6 py-2.5 rounded-xl text-sm font-semibold text-emerald-900 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="animate-pulse">Menyimpan...</span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
