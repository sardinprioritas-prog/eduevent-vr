import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Shield, UserCheck, BarChart3, ArrowRight, Target } from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'operator',
      title: 'Portal Operator',
      desc: 'Input data harian kegiatan VR sekolah',
      icon: <Building2 className="w-8 h-8 text-emerald-400" />,
      color: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
      path: '/operator',
    },
    {
      id: 'admin',
      title: 'Portal Admin',
      desc: 'Kelola data kota dan hak akses',
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      color: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
      path: '/admin',
    },
    {
      id: 'pimpinan',
      title: 'Portal Pimpinan',
      desc: 'Visualisasi strategis & laporan',
      icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
      color: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
      path: '/pimpinan',
    },
    {
      id: 'kadin',
      title: 'Portal Kepala Dinas',
      desc: 'Monitoring VR wilayah tugas',
      icon: <UserCheck className="w-8 h-8 text-amber-400" />,
      color: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
      path: '/kadin',
    },
    {
      id: 'pioneer',
      title: 'Portal Pioneer',
      desc: 'Manajemen target sekolah & progres',
      icon: <Target className="w-8 h-8 text-rose-400" />,
      color: 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20',
      path: '/pioneer',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fadeIn">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/10 border border-indigo-500/30">
            <Building2 className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            EduEvent VR Monitoring System
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Sistem informasi monitoring pelaksanaan kegiatan Virtual Reality di lingkungan pendidikan Provinsi Sulawesi Selatan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          {portals.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(p.path)}
              className={`flex items-center p-6 rounded-2xl border transition-all duration-300 text-left group ${p.color}`}
            >
              <div className="p-4 bg-slate-900/50 rounded-xl mr-5 group-hover:scale-110 transition-transform">
                {p.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-100 mb-1">{p.title}</h3>
                <p className="text-slate-400 text-sm">{p.desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
