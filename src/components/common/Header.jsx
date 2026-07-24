import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { FinancialPasscodeModal } from '../finance/FinancialPasscodeModal';
import { Glasses, Shield, User, BarChart3, UserCheck, Building2, LogOut, Lock } from 'lucide-react';

export const Header = () => {
  const { currentUser, logout, isFinanceUnlocked, isPasscodeModalOpen, setIsPasscodeModalOpen } = useAuth();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    if (isFinanceUnlocked) {
      navigate('/finance');
    } else {
      setIsPasscodeModalOpen(true);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'operator':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30';
      case 'admin':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30';
      case 'pimpinan':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30';
      case 'kadin':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'operator':
        return <UserCheck className="w-4 h-4 mr-1.5" />;
      case 'admin':
        return <Shield className="w-4 h-4 mr-1.5" />;
      case 'pimpinan':
        return <BarChart3 className="w-4 h-4 mr-1.5" />;
      case 'kadin':
        return <Building2 className="w-4 h-4 mr-1.5" />;
      default:
        return <Shield className="w-4 h-4 mr-1.5" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Name */}
            <div 
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Glasses className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                    EduEvent VR
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Monitoring System
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Sistem Monitoring Program Virtual Reality Sekolah
                </p>
              </div>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => logout()}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>

              {/* Active User Info & Clickable Admin Button */}
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200">{currentUser?.name || 'Sardin Damis'}</div>
                  <div className="text-[10px] text-slate-400">{currentUser?.city || 'Semua Wilayah'}</div>
                </div>

                {/* Clickable Admin Button (Triggers Passcode Modal / Navigates to Finance) */}
                <button
                  type="button"
                  onClick={handleAdminClick}
                  className={`flex items-center px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${getRoleBadgeStyle(
                    currentUser?.role
                  )}`}
                  title="Klik untuk membuka Monitoring Keuangan Rahasia (Passcode Required)"
                >
                  {getRoleIcon(currentUser?.role)}
                  <span className="capitalize">{currentUser?.role === 'kadin' ? 'Kepala Dinas' : (currentUser?.role || 'Admin')}</span>
                  {isFinanceUnlocked ? (
                    <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ) : (
                    <Lock className="w-3 h-3 ml-1.5 opacity-70" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Security Passcode Modal */}
      <FinancialPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccessNavigate="/finance"
      />
    </>
  );
};

