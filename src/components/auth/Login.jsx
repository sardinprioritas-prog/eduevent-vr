import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Lock, MapPin, ArrowRight, ArrowLeft, Building2, UserCheck, Shield, BarChart3, Target } from 'lucide-react';

export const Login = ({ role }) => {
  const [passcode, setPasscode] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [error, setError] = useState('');
  const { login, cities } = useAuth();
  const navigate = useNavigate();

  const needsCitySelection = role === 'operator' || role === 'kadin' || role === 'pioneer';

  const roleConfig = {
    operator: { title: 'Login Operator', icon: <Building2 className="w-6 h-6 text-emerald-400" />, color: 'emerald' },
    admin: { title: 'Login Admin', icon: <Shield className="w-6 h-6 text-blue-400" />, color: 'blue' },
    pimpinan: { title: 'Login Pimpinan', icon: <BarChart3 className="w-6 h-6 text-purple-400" />, color: 'purple' },
    kadin: { title: 'Login Kepala Dinas', icon: <UserCheck className="w-6 h-6 text-amber-400" />, color: 'amber' },
    pioneer: { title: 'Login Pioneer', icon: <Target className="w-6 h-6 text-rose-400" />, color: 'rose' },
  };

  const rc = roleConfig[role];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (needsCitySelection && !selectedCity) {
      setError('Silakan pilih wilayah terlebih dahulu');
      return;
    }
    if (!passcode.trim()) {
      setError('Passcode tidak boleh kosong');
      return;
    }

    const success = login(role, selectedCity, passcode);
    if (success) {
      navigate(`/${role}`);
    } else {
      setError('Passcode salah atau wilayah tidak cocok');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali</span>
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-fadeIn">
        <div className="flex flex-col items-center mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-${rc.color}-500/20 border border-${rc.color}-500/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] shadow-${rc.color}-500/20`}>
            {rc.icon}
          </div>
          <h2 className="text-2xl font-bold text-white">{rc.title}</h2>
          <p className="text-slate-400 text-sm mt-2 text-center">
            {needsCitySelection 
              ? 'Pilih wilayah tugas dan masukkan Passcode Anda'
              : 'Masukkan Passcode khusus Anda untuk melanjutkan'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {needsCitySelection && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Wilayah Tugas</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none transition-all"
                >
                  <option value="">-- Pilih Wilayah --</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Passcode</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Masukkan Passcode"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <span>Masuk</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
