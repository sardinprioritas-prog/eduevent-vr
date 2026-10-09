import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { PlusCircle, Pencil, Trash2, Building2, MapPin, Users, Calendar, AlertCircle, Link2, ChevronDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { OperatorAssignmentForm } from '../school/OperatorAssignmentForm';

export const SchoolManagement = () => {
  const { schools, cities, schoolRegistrations, handleSaveSchool, handleDeleteSchool, currentUser, users, showToast } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [operatorAssignments, setOperatorAssignments] = useState([]);

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
    eventDate2: '',
    assignedTo: [],
    assignedTo2: [],
    active: true,
    operatorAssignments: [],
  });

  // Sekolah dari Portal Sekolah yang sudah mendaftar, difilter berdasarkan cityId terpilih.
  // Sekolah yang sudah ditambahkan ke daftar target (schools) disembunyikan dari list,
  // KECUALI jika data sekolah tersebut sedang diedit (editingSchool) atau telah dihapus dari database.
  const portalSchoolOptions = useMemo(() => {
    if (!formData.cityId) return [];
    const selectedCity = cities.find(c => c.id === formData.cityId);
    if (!selectedCity) return [];

    // Nama sekolah yang SUDAH ditambahkan di tabel schools untuk kota ini.
    // Jika sedang dalam mode edit (editingSchool), kecualikan sekolah yang sedang diedit agar tetap tampil di dropdown.
    const addedSchoolNames = new Set(
      schools
        .filter(s => {
          // Jangan kecualikan sekolah yang saat ini sedang diedit
          if (editingSchool && s.id === editingSchool.id) return false;

          // Cocokkan kota berdasarkan cityId atau nama kota
          if (s.cityId && s.cityId === formData.cityId) return true;
          const sCity = cities.find(c => c.id === s.cityId);
          if (sCity && selectedCity) {
            const scName = (sCity.name || '').toLowerCase().replace('kota ', '').trim();
            const selName = (selectedCity.name || '').toLowerCase().replace('kota ', '').trim();
            if (scName === selName || scName.includes(selName) || selName.includes(scName)) {
              return true;
            }
          }
          return false;
        })
        .map(s => (s.name || '').trim().toLowerCase())
        .filter(Boolean)
    );

    // Filter schoolRegistrations berdasarkan nama kota yang cocok dan belum ditambahkan
    return schoolRegistrations.filter(reg => {
      // 1. Prioritaskan cityId jika tersedia
      let cityMatches = false;
      if (reg.cityId && reg.cityId === formData.cityId) {
        cityMatches = true;
      } else {
        // Fallback pencocokan nama (abaikan awalan 'kota ')
        const regCity = (reg.cityName || '').toLowerCase().replace('kota ', '').trim();
        const selCity = (selectedCity.name || '').toLowerCase().replace('kota ', '').trim();
        cityMatches = regCity === selCity || regCity.includes(selCity) || selCity.includes(regCity);
      }

      if (!cityMatches) return false;

      // 2. Filter sekolah yang sudah ada di daftar target (kecuali yang sedang diedit)
      const regName = (reg.schoolName || '').trim().toLowerCase();
      if (addedSchoolNames.has(regName)) {
        return false;
      }

      return true;
    });
  }, [schoolRegistrations, formData.cityId, cities, schools, editingSchool]);

  // Handler saat sekolah dipilih dari dropdown Portal
  const handleSchoolSelect = (schoolName) => {
    if (!schoolName) {
      setFormData(prev => ({ ...prev, name: '', eventDate: '', eventDate2: '' }));
      return;
    }
    const reg = portalSchoolOptions.find(r => r.schoolName === schoolName);
    if (reg) {
      // Auto-fill jumlah siswa dari totalStudents Portal Sekolah
      const autoStudentCount = reg.totalStudents || 0;
      let autoEventDate = '';
      let autoEventDate2 = '';
      const hasOct = reg.selectedDates && reg.selectedDates.length > 0;
      const hasNov = reg.selectedDatesNov && reg.selectedDatesNov.length > 0;
      
      if (hasOct || hasNov) {
        const allDates = [];
        if (hasOct) reg.selectedDates.forEach(d => allDates.push({ y: 2026, m: 10, d }));
        if (hasNov) reg.selectedDatesNov.forEach(d => allDates.push({ y: 2026, m: 11, d }));
        
        allDates.sort((a, b) => a.m !== b.m ? a.m - b.m : a.d - b.d);
        
        if (allDates.length > 0) {
          autoEventDate = `${allDates[0].y}-${String(allDates[0].m).padStart(2, '0')}-${String(allDates[0].d).padStart(2, '0')}`;
          if (allDates.length > 1) {
            autoEventDate2 = `${allDates[1].y}-${String(allDates[1].m).padStart(2, '0')}-${String(allDates[1].d).padStart(2, '0')}`;
          }
        }
      }
      setFormData(prev => ({
        ...prev,
        name: reg.schoolName,
        studentCount: autoStudentCount,
        eventDate: autoEventDate,
        eventDate2: autoEventDate2,
      }));
    } else {
      setFormData(prev => ({ ...prev, name: schoolName, eventDate: '', eventDate2: '' }));
    }
  };

  const filteredSchools = (schools || []).filter((s) => {
    const matchesSearch = (s?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by city for non-admin/pimpinan
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'pimpinan') {
      const schoolCity = cities.find(c => c.id === s?.cityId);
      return matchesSearch && (schoolCity?.name || '').trim().toLowerCase() === (currentUser?.city || '').trim().toLowerCase();
    }
    
    return matchesSearch;
  }).sort((a, b) => {
    // Data tanpa eventDate diletakkan di paling bawah
    if (!a.eventDate && !b.eventDate) return 0;
    if (!a.eventDate) return 1;
    if (!b.eventDate) return -1;
    return new Date(a.eventDate) - new Date(b.eventDate);
  });

  // Deteksi sekolah yang tidak sinkron dengan Portal Sekolah
  const getPortalStudentCount = (schoolName) => {
    const reg = (schoolRegistrations || []).find(
      r => r.schoolName?.toLowerCase().trim() === schoolName?.toLowerCase().trim()
    );
    return reg ? reg.totalStudents : null;
  };

  const isOutOfSync = (school) => {
    const portalCount = getPortalStudentCount(school.name);
    return portalCount !== null && portalCount !== school.studentCount;
  };

  // Hitung berapa sekolah yang tidak sinkron
  const outOfSyncCount = filteredSchools.filter(isOutOfSync).length;

  // Sinkronkan semua sekolah dari Portal Sekolah sekaligus
  const handleSyncAllFromPortal = async () => {
    setIsSyncing(true);
    try {
      let updatedCount = 0;
      for (const school of filteredSchools) {
        const portalCount = getPortalStudentCount(school.name);
        if (portalCount !== null && portalCount !== school.studentCount) {
          await handleSaveSchool({ ...school, studentCount: portalCount });
          updatedCount++;
        }
      }
      if (updatedCount > 0) {
        showToast(`Berhasil sinkronkan ${updatedCount} sekolah dari Portal Sekolah!`, 'success');
      } else {
        showToast('Semua data jumlah siswa sudah sinkron dengan Portal Sekolah.', 'info');
      }
    } catch (err) {
      showToast('Gagal sinkronisasi: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cityId: activeCities.length > 0 ? activeCities[0].id : '',
      name: '',
      studentCount: 0,
      demoDate: '',
      eventDate: '',
      eventDate2: '',
      assignedTo: [],
      assignedTo2: [],
      active: true,
      operatorAssignments: [],
    });
    setOperatorAssignments([]);
    setEditingSchool(null);
    setShowForm(false);
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    let initialOpAssignments = school.operatorAssignments || [];
    if ((!initialOpAssignments || initialOpAssignments.length === 0) && (school.eventDate || school.eventDate2)) {
      const reconstructed = [];
      if (school.eventDate) {
        const isFull = !school.assignedTo || school.assignedTo.length === 0;
        reconstructed.push({
          day: 1,
          date: school.eventDate,
          isFullTeam: isFull,
          operators: isFull ? [] : (Array.isArray(school.assignedTo) ? school.assignedTo : [school.assignedTo]),
        });
      }
      if (school.eventDate2) {
        const isFull = !school.assignedTo2 || school.assignedTo2.length === 0;
        reconstructed.push({
          day: 2,
          date: school.eventDate2,
          isFullTeam: isFull,
          operators: isFull ? [] : (Array.isArray(school.assignedTo2) ? school.assignedTo2 : [school.assignedTo2]),
        });
      }
      initialOpAssignments = reconstructed;
    }

    setFormData({
      cityId: school.cityId,
      name: school.name,
      studentCount: school.studentCount,
      demoDate: school.demoDate || '',
      eventDate: school.eventDate || '',
      eventDate2: school.eventDate2 || '',
      assignedTo: Array.isArray(school.assignedTo) ? school.assignedTo : (school.assignedTo ? [school.assignedTo] : []),
      assignedTo2: Array.isArray(school.assignedTo2) ? school.assignedTo2 : (school.assignedTo2 ? [school.assignedTo2] : []),
      active: school.active !== false,
      operatorAssignments: initialOpAssignments,
    });
    setOperatorAssignments(initialOpAssignments);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.cityId) return;

    // Derive assignedTo & assignedTo2 dari operatorAssignments (Penugasan Tim Operator per Hari)
    // Hari ke-1 → assignedTo, Hari ke-2 → assignedTo2
    // isFullTeam = null (semua operator), Partial = array ID operator terpilih
    let derivedAssignedTo = Array.isArray(formData.assignedTo) && formData.assignedTo.length > 0 ? formData.assignedTo : null;
    let derivedAssignedTo2 = Array.isArray(formData.assignedTo2) && formData.assignedTo2.length > 0 ? formData.assignedTo2 : null;

    if (operatorAssignments && operatorAssignments.length > 0) {
      const day1 = operatorAssignments.find(a => a.day === 1);
      const day2 = operatorAssignments.find(a => a.day === 2);

      if (day1) {
        derivedAssignedTo = day1.isFullTeam ? null : (day1.operators.length > 0 ? day1.operators : null);
      }
      if (day2) {
        derivedAssignedTo2 = day2.isFullTeam ? null : (day2.operators.length > 0 ? day2.operators : null);
      }
    }

    handleSaveSchool({
      ...(editingSchool ? { id: editingSchool.id } : {}),
      ...formData,
      demoDate: formData.demoDate || null,
      eventDate: formData.eventDate || null,
      eventDate2: formData.eventDate2 || null,
      assignedTo: derivedAssignedTo,
      assignedTo2: derivedAssignedTo2,
      studentCount: parseInt(formData.studentCount) || 0,
      operatorAssignments: operatorAssignments,
    });
    resetForm();
  };

  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : 'Unknown';
  };

  const getOperatorLabel = (assignedTo) => {
    if (!assignedTo || (Array.isArray(assignedTo) && assignedTo.length === 0)) {
      return { label: 'All Team', isAll: true };
    }
    const ids = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    const names = ids
      .map(id => users.find(u => u.id === id)?.name)
      .filter(Boolean);
    return { label: names.length > 0 ? names.join('/') : 'All Team', isAll: names.length === 0 };
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
          {/* Tombol Sinkronisasi dari Portal Sekolah */}
          {outOfSyncCount > 0 && (
            <button
              onClick={handleSyncAllFromPortal}
              disabled={isSyncing}
              title={`${outOfSyncCount} sekolah belum sinkron dengan Portal Sekolah`}
              className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : `Sinkron ${outOfSyncCount} Sekolah`}</span>
            </button>
          )}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-slate-400 mb-1">Wilayah / Kota</label>
              <select
                required
                value={formData.cityId}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cityId: e.target.value,
                  name: '',
                  studentCount: 0,
                  eventDate: '',
                  eventDate2: '',
                }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {activeCities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                Nama Sekolah
                {portalSchoolOptions.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                    <Link2 className="w-2.5 h-2.5" />
                    {portalSchoolOptions.length} Belum Ditambahkan
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
                  <option value="">-- Pilih Nama Sekolah --</option>
                  {/* Tampilkan nama sekolah yang sedang diedit jika tidak ada di portalSchoolOptions */}
                  {formData.name && !portalSchoolOptions.some(r => r.schoolName === formData.name) && (
                    <option value={formData.name}>
                      {formData.name} {editingSchool ? '(Sedang Diedit)' : ''}
                    </option>
                  )}
                  {portalSchoolOptions.length > 0 ? (
                    <optgroup label="📋 Terdaftar di Portal Sekolah (Belum Ditambahkan)">
                      {portalSchoolOptions.map((reg) => {
                        let dateText = '';
                        const hasOct = reg.selectedDates && reg.selectedDates.length > 0;
                        const hasNov = reg.selectedDatesNov && reg.selectedDatesNov.length > 0;
                        if (hasOct || hasNov) {
                          const dates = [];
                          if (hasOct) {
                            const sorted = [...reg.selectedDates].sort((a, b) => a - b);
                            dates.push(`${sorted.join(', ')} Okt`);
                          }
                          if (hasNov) {
                            const sorted = [...reg.selectedDatesNov].sort((a, b) => a - b);
                            dates.push(`${sorted.join(', ')} Nov`);
                          }
                          dateText = ` (Event: ${dates.join(' & ')})`;
                        }
                        return (
                          <option key={reg.id || reg.schoolName} value={reg.schoolName}>
                            {reg.schoolName}{dateText}
                          </option>
                        );
                      })}
                    </optgroup>
                  ) : (
                    <option disabled value="__empty__">
                      {editingSchool
                        ? '(Tidak ada pilihan sekolah lain)'
                        : '(Semua sekolah terdaftar sudah ditambahkan atau belum ada data baru)'}
                    </option>
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              </div>
              {portalSchoolOptions.length === 0 && !editingSchool && (
                <p className="mt-1 text-[10px] text-slate-500 italic">Semua data sekolah dari Portal telah ditambahkan ke target.</p>
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
              {(() => {
                const reg = portalSchoolOptions.find(r => r.schoolName === formData.name);
                const isAuto = !!reg;
                const hasSecondDate = isAuto && reg.selectedDates && reg.selectedDates.length >= 2;
                return (
                  <>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                      Tanggal Event {hasSecondDate ? '1' : ''} (Opsional)
                      {isAuto && (
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
                    {hasSecondDate && (
                      <>
                        <label className="block text-xs font-medium text-slate-400 mt-2 mb-1 flex items-center gap-1.5">
                          Tanggal Event 2
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25">
                            <Link2 className="w-2.5 h-2.5" />
                            Auto
                          </span>
                        </label>
                        <input
                          type="date"
                          value={formData.eventDate2}
                          onChange={(e) => setFormData({ ...formData, eventDate2: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Penugasan Tim Operator per Hari (dari Portal Sekolah) */}
          {(() => {
            const reg = portalSchoolOptions.find(r => r.schoolName === formData.name);
            const availableOperators = users
              .filter(u => u.role === 'operator' && u.city === getCityName(formData.cityId))
              .map(u => ({ id: u.id, name: u.name }));
            const datesForAssignment = [];
            if (reg) {
              if (reg.selectedDates && reg.selectedDates.length > 0) {
                [...reg.selectedDates].sort((a,b)=>a-b).forEach(d => datesForAssignment.push(`${d} Oktober`));
              }
              if (reg.selectedDatesNov && reg.selectedDatesNov.length > 0) {
                [...reg.selectedDatesNov].sort((a,b)=>a-b).forEach(d => datesForAssignment.push(`${d} November`));
              }
            }
            if (datesForAssignment.length === 0) {
              // Jika tidak dari reg (misal input manual atau edit sekolah), pakai tanggal event di form
              if (formData.eventDate) datesForAssignment.push(formData.eventDate);
              if (formData.eventDate2) datesForAssignment.push(formData.eventDate2);
            }
            if (datesForAssignment.length === 0 || availableOperators.length === 0) return null;
            return (
              <div className="mt-5 pt-5 border-t border-slate-700/60">
                <OperatorAssignmentForm
                  key={editingSchool ? editingSchool.id : (formData.name || 'new')}
                  selectedDates={datesForAssignment}
                  availableOperators={availableOperators}
                  initialAssignments={operatorAssignments}
                  onAssignmentsChange={setOperatorAssignments}
                />
              </div>
            );
          })()}

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
              <th className="py-3 px-4">Operator</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredSchools.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
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
                    {(() => {
                      const portalCount = getPortalStudentCount(s.name);
                      const outSync = portalCount !== null && portalCount !== s.studentCount;
                      return (
                        <div className="flex flex-col items-center gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            outSync
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            <Users className="w-3 h-3 mr-1" />
                            {s.studentCount}
                          </span>
                          {outSync && (
                            <span
                              title={`Portal Sekolah: ${portalCount} siswa`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25 cursor-help"
                            >
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Portal: {portalCount}
                            </span>
                          )}
                        </div>
                      );
                    })()}
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
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1.5 text-purple-400/70 flex-shrink-0" />
                          {s.eventDate}
                          {s.eventDate2 && (
                            <span className="ml-1.5 px-1 py-0 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">2 Hari</span>
                          )}
                        </div>
                        {s.eventDate2 && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1.5 text-purple-300/50 flex-shrink-0" />
                            {s.eventDate2}
                          </div>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {(() => {
                      const day1Label = getOperatorLabel(s.assignedTo);
                      const hasDay2 = !!(s.eventDate2 || s.assignedTo2);
                      const day2Label = hasDay2 ? getOperatorLabel(s.assignedTo2) : null;

                      if (!hasDay2) {
                        return day1Label.isAll ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            All Team
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 max-w-[140px] truncate" title={day1Label.label}>
                            {day1Label.label}
                          </span>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-400">H1:</span>
                            {day1Label.isAll ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-400">All Team</span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-300 max-w-[110px] truncate" title={day1Label.label}>
                                {day1Label.label}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-slate-400">H2:</span>
                            {day2Label.isAll ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-400">All Team</span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-500/10 text-amber-300 max-w-[110px] truncate" title={day2Label.label}>
                                {day2Label.label}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
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
