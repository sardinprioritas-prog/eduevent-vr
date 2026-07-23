import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { Settings, Save, CheckCircle } from 'lucide-react';

export const SalarySettings = () => {
  const { salarySettings, handleSaveSalarySettings } = useAuth();

  const [formData, setFormData] = useState({
    id: 'default',
    operatorFee: 1000,
    operatorBonus: 500,
    pioneerFee: 1500,
    pioneerBonus: 750,
    bonusThreshold: 1000,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (salarySettings) {
      setFormData(salarySettings);
    }
  }, [salarySettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="glass-card rounded-3xl p-8 mb-8 border border-slate-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center space-x-4 mb-8 border-b border-slate-800 pb-4 relative z-10">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Pengaturan Gaji & Fee</h2>
          <p className="text-sm text-slate-400">Konfigurasi nilai komisi mingguan Operator dan Pioneer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Operator Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">Komisi Operator</h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Nilai Fee (per Siswa)</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-slate-500">Rp</span>
                <input
                  type="number"
                  name="operatorFee"
                  value={formData.operatorFee}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Nilai Bonus (per Siswa)</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-slate-500">Rp</span>
                <input
                  type="number"
                  name="operatorBonus"
                  value={formData.operatorBonus}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Pioneer Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider border-b border-slate-800 pb-2">Komisi Pioneer</h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Nilai Fee (per Siswa)</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-slate-500">Rp</span>
                <input
                  type="number"
                  name="pioneerFee"
                  value={formData.pioneerFee}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Nilai Bonus (per Siswa)</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-slate-500">Rp</span>
                <input
                  type="number"
                  name="pioneerBonus"
                  value={formData.pioneerBonus}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-12 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Threshold */}
        <div className="space-y-4 md:w-1/2 pt-4">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-2">Pengaturan Target</h3>
          
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Target Siswa Mingguan untuk Bonus</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                name="bonusThreshold"
                value={formData.bonusThreshold}
                onChange={handleChange}
                min="0"
                required
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <span className="text-slate-400 text-sm">Siswa</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
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
    </div>
  );
};
