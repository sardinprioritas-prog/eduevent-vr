import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { 
  GraduationCap, 
  User, 
  MapPin, 
  Building2, 
  ListOrdered, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';

export const SchoolPortal = () => {
  const { 
    cities, 
    schools, 
    schoolRegistrations, 
    handleSaveSchoolRegistration, 
    handleDeleteSchoolRegistration 
  } = useAuth();

  const [formData, setFormData] = useState({
    pjName: '',
    cityId: '',
    cityName: '',
    schoolId: '',
    schoolName: '',
    isManualSchool: false,
    manualSchoolName: '',
    rombelCount: 1,
  });

  const [classDetails, setClassDetails] = useState({});
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeTab, setActiveTab] = useState('input'); // 'input' | 'riwayat'
  const [selectedReg, setSelectedReg] = useState(null); // For detail modal

  // Reset/re-initialize classDetails when rombelCount changes
  useEffect(() => {
    const rc = parseInt(formData.rombelCount) || 1;
    const newDetails = {};
    for (let grade = 1; grade <= 6; grade++) {
      for (let r = 0; r < rc; r++) {
        const className = `${grade}${String.fromCharCode(65 + r)}`;
        // Keep existing value if it matches, otherwise default to empty string or 0
        newDetails[className] = classDetails[className] !== undefined ? classDetails[className] : '';
      }
    }
    setClassDetails(newDetails);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.rombelCount]);

  // Recalculate total students in real-time
  useEffect(() => {
    const sum = Object.values(classDetails).reduce((acc, curr) => {
      const val = parseInt(curr) || 0;
      return acc + val;
    }, 0);
    setTotalStudents(sum);
  }, [classDetails]);

  // Filter schools based on selected city
  const filteredSchools = schools.filter(s => s.cityId === formData.cityId && s.active !== false);

  const handleCityChange = (e) => {
    const cId = e.target.value;
    const city = cities.find(c => c.id === cId);
    setFormData({
      ...formData,
      cityId: cId,
      cityName: city ? city.name : '',
      schoolId: '',
      schoolName: '',
      isManualSchool: false,
      manualSchoolName: ''
    });
  };

  const handleSchoolChange = (e) => {
    const val = e.target.value;
    if (val === 'manual') {
      setFormData({
        ...formData,
        schoolId: 'manual',
        schoolName: '',
        isManualSchool: true,
      });
    } else {
      const sch = schools.find(s => s.id === val);
      setFormData({
        ...formData,
        schoolId: val,
        schoolName: sch ? sch.name : '',
        isManualSchool: false,
        manualSchoolName: ''
      });
    }
  };

  const handleClassValueChange = (className, value) => {
    // Only accept numeric inputs
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setClassDetails({
        ...classDetails,
        [className]: value === '' ? '' : parseInt(value)
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.pjName.trim()) {
      alert('Nama Guru Penanggung Jawab wajib diisi!');
      return;
    }
    if (!formData.cityId) {
      alert('Silakan pilih Wilayah terlebih dahulu!');
      return;
    }
    
    const finalSchoolName = formData.isManualSchool 
      ? formData.manualSchoolName.trim() 
      : formData.schoolName;

    if (!finalSchoolName) {
      alert('Nama Sekolah tidak boleh kosong!');
      return;
    }

    // Save registration
    const registrationData = {
      pjName: formData.pjName.trim(),
      cityId: formData.cityId,
      cityName: formData.cityName,
      schoolId: formData.schoolId,
      schoolName: finalSchoolName,
      rombelCount: parseInt(formData.rombelCount),
      classDetails: classDetails,
      totalStudents: totalStudents,
    };

    handleSaveSchoolRegistration(registrationData);

    // Reset Form
    setFormData({
      pjName: '',
      cityId: '',
      cityName: '',
      schoolId: '',
      schoolName: '',
      isManualSchool: false,
      manualSchoolName: '',
      rombelCount: 1,
    });
    setClassDetails({});
    setTotalStudents(0);
    setActiveTab('riwayat');
  };

  // Helper to generate dynamic grade columns
  const getSubdivisions = (rombelCount) => {
    const arr = [];
    for (let i = 0; i < rombelCount; i++) {
      arr.push(String.fromCharCode(65 + i));
    }
    return arr;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Pendaftaran VR Mandiri</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Portal Pendaftaran Sekolah
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            Silakan masukkan data pendaftaran siswa untuk kegiatan Virtual Reality (VR) di sekolah Anda. Sistem akan mengelompokkan input jumlah siswa berdasarkan tingkatan kelas dan rombongan belajar (rombel) secara otomatis.
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'input'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Form Input Data
            </button>
            <button
              onClick={() => setActiveTab('riwayat')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'riwayat'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Riwayat Pendaftaran
              {schoolRegistrations.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {schoolRegistrations.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'input' ? (
        /* Form Card */
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-8">
          
          {/* Section 1: Validation & Metadata */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/60">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Informasi Penanggung Jawab & Sekolah</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Guru PJ */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nama Guru Penanggung Jawab (PJ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Drs. Ahmad Yani, M.Pd."
                    value={formData.pjName}
                    onChange={(e) => setFormData({ ...formData, pjName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Nama guru/staf penanggung jawab yang melakukan pengisian untuk validasi data pendaftaran.
                </p>
              </div>

              {/* Wilayah / Kota */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Wilayah / Kabupaten / Kota <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    required
                    value={formData.cityId}
                    onChange={handleCityChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">-- Pilih Wilayah Sekolah --</option>
                    {cities.filter(c => c.active !== false).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sekolah */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Nama Sekolah <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    required
                    disabled={!formData.cityId}
                    value={formData.isManualSchool ? 'manual' : formData.schoolId}
                    onChange={handleSchoolChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 appearance-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option value="">
                      {!formData.cityId ? 'Pilih Wilayah Terlebih Dahulu' : '-- Pilih Sekolah --'}
                    </option>
                    {filteredSchools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    {formData.cityId && (
                      <option value="manual">-- Sekolah Lainnya (Input Manual) --</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Manual School Name (If selected manual) */}
              {formData.isManualSchool && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Ketik Nama Sekolah Anda <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap sekolah (Contoh: SD Negeri 10 Bone)"
                      value={formData.manualSchoolName}
                      onChange={(e) => setFormData({ ...formData, manualSchoolName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Jumlah Rombel */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Jumlah Rombel Per Tingkatan <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    placeholder="Masukkan jumlah rombel"
                    value={formData.rombelCount}
                    onChange={(e) => {
                      const val = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
                      setFormData({ ...formData, rombelCount: val });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Misal diinput 2: maka kelas 1 terdiri dari 1A, 1B; kelas 2: 2A, 2B, dst sampai kelas 6. (Maksimal 10 rombel)
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Class Inputs */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/60">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-100">Input Jumlah Siswa Per Kelas (Tingkat 1 - 6)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((grade) => {
                const subdivisions = getSubdivisions(formData.rombelCount);
                return (
                  <div 
                    key={grade} 
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/60 transition-all flex flex-col space-y-4 shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-sm font-bold text-indigo-400">Kelas {grade}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        {subdivisions.length} Rombel
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {subdivisions.map((letter) => {
                        const className = `${grade}${letter}`;
                        return (
                          <div key={className} className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-400 tracking-wider">
                              Rombel {className}
                            </label>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={classDetails[className] !== undefined ? classDetails[className] : ''}
                              onChange={(e) => handleClassValueChange(className, e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-center text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 animate-fadeIn"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Summary Counter & Submit */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Total Pendaftar Sementara</h3>
                <p className="text-xs text-slate-400">Akumulasi jumlah siswa dari semua kelas yang telah Anda masukkan.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center md:text-right">
                <span className="text-3xl font-extrabold text-white tracking-tight">{totalStudents}</span>
                <span className="text-xs text-indigo-400 ml-1.5 font-bold">Siswa</span>
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Simpan Pendaftaran</span>
              </button>
            </div>
          </div>

        </form>
      ) : (
        /* History Card */
        <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Riwayat Pendaftaran Sekolah</h2>
                <p className="text-xs text-slate-400">
                  Daftar sekolah yang telah menginputkan pendaftaran siswa kegiatan VR.
                </p>
              </div>
            </div>
          </div>

          {schoolRegistrations.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30 text-indigo-400" />
              <p className="text-sm font-semibold">Belum Ada Data Pendaftaran Terdaftar</p>
              <p className="text-xs mt-1">Gunakan tab Form Input Data untuk mendaftarkan sekolah baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                    <th className="py-3.5 px-4">Nama Sekolah</th>
                    <th className="py-3.5 px-4">Wilayah</th>
                    <th className="py-3.5 px-4">Nama Guru PJ</th>
                    <th className="py-3.5 px-4 text-center">Jumlah Rombel</th>
                    <th className="py-3.5 px-4 text-center">Total Siswa</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {schoolRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-100">{reg.schoolName}</td>
                      <td className="py-3.5 px-4 text-slate-400">{reg.cityName}</td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">{reg.pjName}</td>
                      <td className="py-3.5 px-4 text-center text-slate-300">{reg.rombelCount} Rombel</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-indigo-300">{reg.totalStudents} siswa</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedReg(reg)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-400 transition-colors"
                            title="Lihat Detail Rombel"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus pendaftaran ${reg.schoolName}?`)) {
                                handleDeleteSchoolRegistration(reg.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 transition-colors"
                            title="Hapus Registrasi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Rincian Siswa Per Rombel</h3>
                  <p className="text-xs text-slate-400">{selectedReg.schoolName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                <div>
                  <span className="block text-slate-500">Guru PJ</span>
                  <span className="font-bold text-slate-200">{selectedReg.pjName}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Wilayah</span>
                  <span className="font-bold text-slate-200">{selectedReg.cityName}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Rombel</span>
                  <span className="font-bold text-slate-200">{selectedReg.rombelCount} Rombel</span>
                </div>
                <div>
                  <span className="block text-slate-500">Total Terdaftar</span>
                  <span className="font-bold text-indigo-400">{selectedReg.totalStudents} siswa</span>
                </div>
              </div>

              {/* Rombel breakdown table */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Distribusi Kelas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((grade) => {
                    const subs = getSubdivisions(selectedReg.rombelCount);
                    return (
                      <div key={grade} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col space-y-2.5">
                        <span className="text-xs font-bold text-indigo-400 border-b border-slate-800 pb-1.5 block">
                          Tingkat Kelas {grade}
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {subs.map((letter) => {
                            const cName = `${grade}${letter}`;
                            const count = selectedReg.classDetails[cName] || 0;
                            return (
                              <div key={cName} className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-center">
                                <span className="block text-[10px] text-slate-500 font-bold">{cName}</span>
                                <span className="text-xs font-bold text-slate-200">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 bg-slate-950 border-t border-slate-800">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
