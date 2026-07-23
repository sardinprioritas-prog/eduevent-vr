import React from 'react';
import { useAuth } from '../../context/useAuth';
import { Glasses, Shield, User, BarChart3, UserCheck, Building2, LogOut } from 'lucide-react';

export const Header = () => {
  const { currentUser, logout } = useAuth();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'operator':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'admin':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pimpinan':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'kadin':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
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
        return <User className="w-4 h-4 mr-1.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
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

            {/* Active User Badge */}
            <div className="hidden lg:flex items-center space-x-3 pl-4 border-l border-slate-800">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-400">{currentUser?.city || 'Admin/Global'}</div>
              </div>
              <div
                className={`flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${getRoleBadgeStyle(
                  currentUser?.role
                )}`}
              >
                {getRoleIcon(currentUser?.role)}
                <span className="capitalize">{currentUser?.role === 'kadin' ? 'Kepala Dinas' : currentUser?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
