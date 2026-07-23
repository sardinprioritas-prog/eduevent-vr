import React from 'react';
import { useAuth } from '../../context/useAuth';
import { School, Users, TrendingUp, CalendarCheck, Award, Zap, MapPin } from 'lucide-react';

export const MetricCards = ({ selectedCity }) => {
  const { events } = useAuth();

  // Filter events based on selected city (for kadin)
  const filteredEvents = selectedCity
    ? events.filter((e) => e.cityName === selectedCity || e.cityId === selectedCity)
    : events;

  // Calculate high level KPIs
  const uniqueSchools = new Set(filteredEvents.map((e) => e.schoolName.trim().toLowerCase())).size;
  const totalDapodik = filteredEvents.reduce((sum, e) => sum + (e.dapodikStudents || 0), 0);
  const totalParticipating = filteredEvents.reduce((sum, e) => sum + (e.participatingStudents || 0), 0);
  const avgConversion =
    totalDapodik > 0 ? ((totalParticipating / totalDapodik) * 100).toFixed(1) : 0;
  const totalEvents = filteredEvents.length;

  return (
    <div className="space-y-3">
      {/* Regional Filter Indicator */}
      {selectedCity && (
        <div className="flex items-center space-x-2 text-xs text-amber-400/80">
          <MapPin className="w-3.5 h-3.5" />
          <span>Menampilkan data wilayah: <strong className="text-amber-300">{selectedCity}</strong></span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1: Total Sekolah */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sekolah</p>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{uniqueSchools}</h3>
              <p className="text-[11px] text-indigo-400 mt-1 flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                Sudah Dikunjungi VR
              </p>
            </div>
            <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <School className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KPI 2: Total Partisipan VR */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Partisipan VR vs Dapodik</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {totalParticipating.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {totalDapodik.toLocaleString()}</span>
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center">
                <Users className="w-3 h-3 mr-1" />
                Siswa Berpartisipasi
              </p>
            </div>
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KPI 3: Rata-Rata Konversi */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tingkat Konversi</p>
              <h3 className="text-2xl font-extrabold text-purple-300 mt-1">{avgConversion}%</h3>
              <p className="text-[11px] text-purple-400 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Rata-rata Partisipasi
              </p>
            </div>
            <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* KPI 4: Sesi Terselenggara */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sesi VR</p>
              <h3 className="text-2xl font-extrabold text-amber-300 mt-1">{totalEvents}</h3>
              <p className="text-[11px] text-amber-400 mt-1 flex items-center">
                <CalendarCheck className="w-3 h-3 mr-1" />
                Kegiatan Selesai
              </p>
            </div>
            <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
