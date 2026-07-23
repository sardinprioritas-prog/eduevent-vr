import React from 'react';
import { useAuth } from '../../context/useAuth';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { BarChart2, PieChart as PieIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4'];

export const RegionalCharts = ({ selectedCity }) => {
  const { events, cities } = useAuth();

  // Filter events based on selectedCity
  const filteredEvents = selectedCity
    ? events.filter((e) => e.cityName === selectedCity || e.cityId === selectedCity)
    : events;

  // Aggregate Data by City (only relevant cities when filtered)
  const cityDataMap = {};

  if (selectedCity) {
    // For kadin: show school-level breakdown instead of city-level
    filteredEvents.forEach((evt) => {
      const school = evt.schoolName;
      if (!cityDataMap[school]) {
        cityDataMap[school] = {
          cityName: school,
          totalParticipants: 0,
          totalDapodik: 0,
          totalEvents: 0,
        };
      }
      cityDataMap[school].totalParticipants += evt.participatingStudents || 0;
      cityDataMap[school].totalDapodik += evt.dapodikStudents || 0;
      cityDataMap[school].totalEvents += 1;
    });
  } else {
    // For pimpinan: show city-level aggregation
    cities.forEach((c) => {
      cityDataMap[c.name] = {
        cityName: c.name,
        totalParticipants: 0,
        totalDapodik: 0,
        totalEvents: 0,
      };
    });

    events.forEach((evt) => {
      const cName = evt.cityName || 'Unknown';
      if (!cityDataMap[cName]) {
        cityDataMap[cName] = {
          cityName: cName,
          totalParticipants: 0,
          totalDapodik: 0,
          totalEvents: 0,
        };
      }
      cityDataMap[cName].totalParticipants += evt.participatingStudents || 0;
      cityDataMap[cName].totalDapodik += evt.dapodikStudents || 0;
      cityDataMap[cName].totalEvents += 1;
    });
  }

  const barChartData = Object.values(cityDataMap).filter(
    (c) => c.totalEvents > 0 || c.totalParticipants > 0
  );

  // Pie Chart Data - Distribution by Events Count
  const pieChartData = barChartData.map((item) => ({
    name: item.cityName,
    value: item.totalParticipants,
  }));

  // Timeline data for kadin (monthly trend within city)
  const timelineData = selectedCity
    ? (() => {
        const byDate = {};
        filteredEvents.forEach((e) => {
          const day = e.date;
          if (!byDate[day]) byDate[day] = { date: day, partisipan: 0, dapodik: 0 };
          byDate[day].partisipan += e.participatingStudents || 0;
          byDate[day].dapodik += e.dapodikStudents || 0;
        });
        return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
      })()
    : null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-200">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="font-semibold">
              {entry.name}: {entry.value.toLocaleString()} siswa
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart: Comparison */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
          <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-slate-800">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {selectedCity
                  ? `Partisipasi VR Per Sekolah — ${selectedCity}`
                  : 'Perbandingan Partisipasi VR Per Wilayah / Kota'}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedCity
                  ? `Data sekolah di wilayah ${selectedCity}`
                  : 'Membandingkan total siswa Dapodik vs aktual siswa yang berpartisipasi'}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {barChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Belum ada data grafik untuk ditampilkan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="cityName"
                    stroke="#94a3b8"
                    tick={{ fontSize: selectedCity ? 10 : 12 }}
                    angle={selectedCity ? -20 : 0}
                    textAnchor={selectedCity ? 'end' : 'middle'}
                    height={selectedCity ? 50 : 30}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="totalDapodik" name="Total Dapodik" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalParticipants" name="Partisipan VR" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut Chart: Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
          <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-slate-800">
            <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {selectedCity ? 'Sebaran Per Sekolah' : 'Sebaran Partisipan'}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedCity ? `Kontribusi sekolah di ${selectedCity}` : 'Persentase kontribusi per wilayah'}
              </p>
            </div>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {pieChartData.length === 0 ? (
              <div className="text-xs text-slate-500">Belum ada data sebaran.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Chart — only shown for kadin (city filtered view) */}
      {selectedCity && timelineData && timelineData.length > 0 && (
        <div className="glass-card rounded-2xl p-6 border border-amber-500/20 shadow-2xl">
          <div className="flex items-center space-x-3 pb-4 mb-6 border-b border-slate-800">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Tren Harian Partisipasi VR — {selectedCity}
              </h3>
              <p className="text-xs text-slate-400">
                Perkembangan jumlah partisipan per tanggal kegiatan di wilayah ini
              </p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="dapodik"
                  name="Total Dapodik"
                  stroke="#475569"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="partisipan"
                  name="Partisipan VR"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#f59e0b' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
