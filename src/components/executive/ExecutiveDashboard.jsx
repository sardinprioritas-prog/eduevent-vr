import React from 'react';
import { useAuth } from '../../context/useAuth';
import { MetricCards } from './MetricCards';
import { RegionalCharts } from './RegionalCharts';
import { RecapTable } from './RecapTable';
import { MapPin, Building2, Globe } from 'lucide-react';

export const ExecutiveDashboard = () => {
  const { currentUser, kadinCity } = useAuth();

  const isKadin = currentUser?.role === 'kadin';
  const selectedCity = isKadin ? kadinCity : null; // null = all cities (pimpinan)

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900/80 p-6 rounded-2xl border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              Executive Dashboard Monitoring VR
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Visualisasi strategis real-time untuk mengevaluasi tingkat partisipasi, efektivitas, dan sebaran program Virtual Reality di sekolah-sekolah per wilayah.
            </p>
          </div>

          {/* Region Badge */}
          {isKadin ? (
            <div className="flex-shrink-0 flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-xl">
              <div className="p-1.5 bg-amber-500/20 rounded-lg">
                <Building2 className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-widest">Wilayah Tugas</p>
                <p className="text-sm font-black text-amber-300 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {kadinCity}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0 flex items-center space-x-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2.5 rounded-xl">
              <div className="p-1.5 bg-purple-500/20 rounded-lg">
                <Globe className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] text-purple-400/80 font-semibold uppercase tracking-widest">Cakupan Data</p>
                <p className="text-sm font-black text-purple-300">Semua Wilayah</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Highlight Metrics */}
      <MetricCards selectedCity={selectedCity} />

      {/* Analytics Visual Charts */}
      <RegionalCharts selectedCity={selectedCity} />

      {/* Detail Recapitulation & Export Table */}
      <RecapTable selectedCity={selectedCity} />
    </div>
  );
};
