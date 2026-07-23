import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { Glasses, Shield, User, BarChart3, UserCheck, ChevronDown, MapPin, Building2 } from 'lucide-react';

export const Header = () => {
  const { currentUser, switchRole, cities, switchUser, kadinCity, setKadinCity } = useAuth();
  const [showKadinDropdown, setShowKadinDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowKadinDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKadinSelect = (cityName) => {
    switchRole('kadin', cityName);
    setShowKadinDropdown(false);
  };

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

  const isKadin = currentUser?.role === 'kadin';

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

          {/* Role Switcher & User Profile */}
          <div className="flex items-center space-x-4">
            {/* Quick Role Switcher Bar */}
            <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center space-x-1">
              <span className="text-xs text-slate-400 px-2 font-medium hidden md:inline-block">
                Simulasi Peran:
              </span>
              
              <button
                onClick={() => switchRole('operator')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentUser?.role === 'operator'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                Operator
              </button>

              <button
                onClick={() => switchRole('admin')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentUser?.role === 'admin'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Shield className="w-3.5 h-3.5 mr-1" />
                Admin
              </button>

              <button
                onClick={() => switchRole('pimpinan')}
                className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentUser?.role === 'pimpinan'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1" />
                Pimpinan
              </button>

              {/* Kepala Dinas Button with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowKadinDropdown((prev) => !prev)}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isKadin
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 mr-1" />
                  Kepala Dinas
                  {isKadin && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200 text-[10px] font-bold border border-amber-400/30">
                      {kadinCity}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3 h-3 ml-1 transition-transform ${showKadinDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* City Dropdown */}
                {showKadinDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <MapPin className="w-3 h-3 mr-1.5 text-amber-400" />
                        Pilih Wilayah Tugas
                      </p>
                    </div>
                    <div className="py-1 max-h-64 overflow-y-auto">
                      {cities.map((city) => (
                        <button
                          key={city.id}
                          onClick={() => handleKadinSelect(city.name)}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-all flex items-center space-x-2 ${
                            kadinCity === city.name && isKadin
                              ? 'bg-amber-600/20 text-amber-300 font-bold'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <MapPin
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              kadinCity === city.name && isKadin ? 'text-amber-400' : 'text-slate-500'
                            }`}
                          />
                          <span>{city.name}</span>
                          {kadinCity === city.name && isKadin && (
                            <span className="ml-auto text-[10px] text-amber-400 font-bold">✓ Aktif</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active User Badge */}
            <div className="hidden lg:flex items-center space-x-3 pl-2 border-l border-slate-800">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-200">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-400">{currentUser?.email}</div>
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
