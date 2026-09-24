import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { PlusCircle, Pencil, Trash2, Building2, MapPin, Users, Calendar, AlertCircle, Link2, ChevronDown } from 'lucide-react';

export const SchoolManagement = () => {
  const { schools, cities, schoolRegistrations, handleSaveSchool, handleDeleteSchool, currentUser } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter cities: jika bukan admin/pimpinan, hanya tampilkan kota currentUser
  const activeCities = cities.filter(c => {
    if (c.active === false) return false;
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'pimpinan') {
      return c.name === currentUser?.city;
    }
    return true;
  });

  // Default form state
  const [formData, setFormData] = useState({
    cityId: activeCities.length > 0 ? activeCities[0].id : '',
    name: '',
    studentCount: 0,
    demoDate: '',
    eventDate: '',
    active: true,
  });

  // Sekolah dari Portal Sekolah yang sudah mendaftar, difilter berdasarkan cityId terpilih
  const portalSchoolOptions = useMemo(() => {
    if (!formData.cityId) return [];
    const selectedCity = cities.find(c => c.id === formData.cityId);
    if (!selectedCity) return [];
    // Filter schoolRegistrations berdasarkan nama kota yang cocok
    return schoolRegistrations.filter(reg => {
      const regCity = (reg.cityName || '').toLowerCase().trim();
      const selCity = (selectedCity.name || '').toLowerCase().trim();
      return regCity === selCity;
    });
  }, [schoolRegistrations, formData.cityId, cities]);

  // Handler saat sekolah dipilih dari dropdown Portal
  const handleSchoolSelect = (schoolName) => {
    if (!schoolName) {
      setFormData(prev => ({ ...prev, name: '' }));
      return;
    }
    const reg = portalSchoolOptions.find(r => r.schoolName === schoolName);
    if (reg) {
      // Auto-fill jumlah siswa dari totalStudents Portal Sekolah
      const autoStudentCount = reg.totalStudents || 0;
      // Auto-fill eventDate dari selectedDates Portal Sekolah (tanggal Oktober pertama → format YYYY-MM-DD)
      let autoEventDate = '';
      if (reg.selectedDates && reg.selectedDates.length > 0) {
        const firstDay = Math.min(...reg.selectedDates);
        autoEventDate = `2025-10-${String(firstDay).padStart(2, '0')}`;
      }
      setFormData(prev => ({
        ...prev,
        name: reg.schoolName,
        studentCount: autoStudentCount,
        eventDate: autoEventDate,
      }));
    } else {
      setFormData(prev => ({ ...prev, name: schoolName }));
    }
  };

  const filteredSchools = schools.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by city for non-admin/pimpinan
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'pimpinan') {
      const schoolCity = cities.find(c => c.id === s.cityId);
      return matchesSearch && schoolCity?.name === currentUser?.city;
    }
    
    return matchesSearch;
  });

  const resetForm = () => {
    setFormData({
      cityId: activeCities.length > 0 ? activeCities[0].id : '',
      name: '',
      studentCount: 0,
      demoDate: '',
      eventDate: '',
      active: true,
    });
    setEditingSchool(null);
    setShowForm(false);
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      cityId: school.cityId,
      name: school.name,
      studentCount: school.studentCount,
      demoDate: school.demoDate || '',
      eventDate: school.eventDate || '',
      active: school.active !== false,
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cityId) return;

    handleSaveSchool({
      ...(editingSchool ? { id: editingSchool.id } : {}),
      ...formData,
      demoDate: formData.demoDate || null,
      eventDate: formData.eventDate || null,
      studentCount: parseInt(formData.studentCount) || 0,
    });
    resetForm();
  };

  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : 'Unknown';
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 leading-tight">Manajemen Target Sekolah</h2>
            <p className="text-xs text-slate-400 mt-0.5">Kelola daftar sekolah, jadwal demo, dan jadwal event.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Cari sekolah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 w-48"
          />
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Sekolah</span>
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center">
            {editingSchool ? 'Edit Data Sekolah' : 'Tambah Target Sekolah Baru'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1">Wilayah / Kota</label>
              <select
                required
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {activeCities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                Nama Sekolah
                {portalSchoolOptions.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                    <Link2 className="w-2.5 h-2.5" />
                    {portalSchoolOptions.length} dari Portal
                  </span>
                )}
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.name}
                  onChange={(e) => handleSchoolSelect(e.target.value)}
                  className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 pr-8 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Pilih Sekolah --</option>
                  {portalSchoolOptions.length > 0 ? (
                    <optgroup label="📋 Terdaftar di Portal Sekolah">
                      {portalSchoolOptions.map((reg) => (
                        <option key={reg.id || reg.schoolName} value={reg.schoolName}>
                          {reg.schoolName}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <option disabled value="__empty__">
                      (Belum ada data dari Portal Sekolah untuk kota ini)
                    </option>
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              </div>
              {portalSchoolOptions.length === 0 && (
                <p className="mt-1 text-[10px] text-slate-500 italic">Sekolah muncul otomatis saat terdaftar di Portal Sekolah.</p>
              )}
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                Jumlah Siswa
                {formData.name && portalSchoolOptions.find(r => r.schoolName === formData.name) && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    <Link2 className="w-2.5 h-2.5" />
                    Auto
                  </span>
                )}
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.studentCount}
                onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1">Tanggal Demo (Opsional)</label>
              <input
                type="date"
                value={formData.demoDate}
                onChange={(e) => setFormData({ ...formData, demoDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                Tanggal Event (Opsional)
                {formData.name && portalSchoolOptions.find(r => r.schoolName === formData.name) && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25">
                    <Link2 className="w-2.5 h-2.5" />
                    Auto
                  </span>
                )}
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
            >
              {editingSchool ? 'Simpan Perubahan' : 'Tambah Sekolah'}
            </button>
          </div>
        </form>
      )}

      {/* Schools Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/80">
              <th className="py-3 px-4">Nama Sekolah</th>
              <th className="py-3 px-4">Wilayah</th>
              <th className="py-3 px-4 text-center">Jumlah Siswa</th>
              <th className="py-3 px-4">Tgl Demo</th>
              <th className="py-3 px-4">Tgl Event</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredSchools.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-50" />
                  <p>Belum ada data sekolah.</p>
                </td>
              </tr>
            ) : (
              filteredSchools.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100">
                    <div className="flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      {s.name}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1.5 text-slate-500" />
                      {getCityName(s.cityId)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                      <Users className="w-3 h-3 mr-1" />
                      {s.studentCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {s.demoDate ? (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1.5 text-blue-400/70" />
                        {s.demoDate}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {s.eventDate ? (
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1.5 text-purple-400/70" />
                        {s.eventDate}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded mr-2 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus ${s.name}?`)) {
                          handleDeleteSchool(s.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
        <div>
          Total Sekolah Terdata: <span className="text-slate-200 font-bold">{filteredSchools.length}</span>
        </div>
        <div>
          Total Keseluruhan Siswa: <span className="text-emerald-400 font-bold">{filteredSchools.reduce((sum, school) => sum + (parseInt(school.studentCount) || 0), 0)}</span>
        </div>
      </div>
    </div>
  );
};
