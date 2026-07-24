import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, KeyRound, Eye, EyeOff, X, AlertCircle } from 'lucide-react';

export const FinancialPasscodeModal = ({ isOpen, onClose, onSuccessNavigate = '/finance' }) => {
  const { unlockFinance, currentUser } = useAuth();
  const navigate = useNavigate();

  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('Silakan masukkan passcode terlebih dahulu.');
      return;
    }

    const success = unlockFinance(passcode);
    if (success) {
      setPasscode('');
      setErrorMsg('');
      if (onClose) onClose();
      if (onSuccessNavigate) {
        navigate(onSuccessNavigate);
      }
    } else {
      setErrorMsg('Passcode salah! Periksa kembali kode PIN rahasia Anda.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleQuickKey = (num) => {
    if (passcode.length < 6) {
      setPasscode(prev => prev + num);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setPasscode(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className={`w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-transform ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Akses Terproteksi
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold tracking-wider uppercase">
                  Rahasia
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring Keuangan & Arus Kas Lembaga Edutainment
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Masukkan Passcode Rahasia
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg('');
                }}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                placeholder="Masukkan Passcode (cth: ad123)"
                autoFocus
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center font-mono tracking-widest text-lg font-bold transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 text-slate-400 hover:text-slate-200 p-1"
              >
                {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleQuickKey(num.toString())}
                className="py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl text-slate-200 font-semibold text-base transition-colors active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 bg-slate-800/50 hover:bg-red-500/20 border border-slate-700/60 text-slate-400 hover:text-red-400 rounded-xl font-medium text-xs transition-colors"
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={() => handleQuickKey('0')}
              className="py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl text-slate-200 font-semibold text-base transition-colors active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPasscode('')}
              className="py-2.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/60 text-slate-400 rounded-xl font-medium text-xs transition-colors"
            >
              Reset
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Gunakan Passcode Login Akun:</span>
            <code className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded font-mono font-bold">
              {currentUser?.passcode || 'ad123 / pim123'}
            </code>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 font-medium text-xs hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Buka Keuangan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
