import React, { useState } from 'react';
import { Shield, X, MapPin, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const REGIONS = [
  { id: 'palu', name: 'Kota Palu', passcode: 'PLW-01' },
  { id: 'samarinda', name: 'Samarinda', passcode: 'SMD-11' },
  { id: 'balikpapan', name: 'Balikpapan', passcode: 'BPN-12' },
  { id: 'tenggarong', name: 'Tenggarong', passcode: 'TGR-13' },
  { id: 'baubau', name: 'BauBau', passcode: 'BUW-14' }
];

export const PortalSekolahModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedRegion) {
      setError('Pilih wilayah terlebih dahulu');
      return;
    }

    const region = REGIONS.find(r => r.id === selectedRegion);
    if (!region) {
      setError('Wilayah tidak valid');
      return;
    }

    if (passcode !== region.passcode) {
      setError('Passcode tidak valid untuk wilayah ini');
      return;
    }

    // Success!
    onClose();
    navigate('/sekolah', { state: { regionName: region.name } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Akses Portal Sekolah</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Pilih Wilayah</span>
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none"
            >
              <option value="">-- Pilih Wilayah --</option>
              {REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center space-x-2">
              <Key className="w-4 h-4 text-slate-400" />
              <span>Passcode Wilayah</span>
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              placeholder="Masukkan passcode..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center">
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl px-4 py-3 font-medium transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex justify-center items-center space-x-2"
            >
              <span>Masuk Portal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
