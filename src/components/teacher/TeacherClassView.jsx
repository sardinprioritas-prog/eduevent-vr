import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  Users,
  GraduationCap,
  Building2,
  Plus,
  Trash2,
  Search,
  Phone,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  ChevronLeft,
  X,
  ExternalLink,
  UserCheck,
  Clock,
  Check,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const TeacherClassView = () => {
  const { schoolRegId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRombel = searchParams.get('rombel') || '';

  const {
    schoolRegistrations = [],
    studentRegistrations = [],
    handleSaveStudentRegistration,
    handleDeleteStudentRegistration,
    showToast,
  } = useAuth();

  // Cari data registrasi sekolah
  const [selectedSchoolId, setSelectedSchoolId] = useState(schoolRegId || '');
  const activeSchool = useMemo(() => {
    return schoolRegistrations.find((s) => s.id === (schoolRegId || selectedSchoolId));
  }, [schoolRegId, selectedSchoolId, schoolRegistrations]);

  const [activeRombel, setActiveRombel] = useState(initialRombel);
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all' | 'paid' | 'unpaid'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentName: '',
    gradeRombel: '',
    parentName: '',
    parentPhone: '',
    notes: '',
    status: 'paid', // Default sudah bayar jika ditambahkan manual oleh guru
  });

  // Daftar seluruh rombel sekolah ini
  const availableRombels = useMemo(() => {
    if (!activeSchool) return [];
    const isSMP = (activeSchool.schoolName || '').toUpperCase().includes('SMP');
    const grades = isSMP ? [7, 8, 9] : [1, 2, 3, 4, 5, 6];
    const rombelCount = parseInt(activeSchool.rombelCount) || 1;

    const list = [];
    for (const g of grades) {
      for (let r = 0; r < rombelCount; r++) {
        const code = `${g}${String.fromCharCode(65 + r)}`;
        list.push(code);
      }
    }
    return list;
  }, [activeSchool]);

  // Filter siswa untuk sekolah ini
  const schoolStudents = useMemo(() => {
    if (!activeSchool) return [];
    return studentRegistrations.filter((s) => s.schoolRegId === activeSchool.id);
  }, [activeSchool, studentRegistrations]);

  // Filter siswa berdasarkan rombel, status bayar & pencarian
  const filteredStudents = useMemo(() => {
    return schoolStudents.filter((s) => {
      if (activeRombel && s.gradeRombel !== activeRombel) return false;
      const isPaid = s.status === 'paid' || s.paymentStatus === 'paid';
      if (paymentFilter === 'paid' && !isPaid) return false;
      if (paymentFilter === 'unpaid' && isPaid) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = (s.studentName || '').toLowerCase().includes(query);
        const matchParent = (s.parentName || '').toLowerCase().includes(query);
        if (!matchName && !matchParent) return false;
      }
      return true;
    });
  }, [schoolStudents, activeRombel, paymentFilter, searchQuery]);

  // Statistik pembayaran
  const paidCount = useMemo(() => {
    return schoolStudents.filter((s) => s.status === 'paid' || s.paymentStatus === 'paid').length;
  }, [schoolStudents]);
  const unpaidCount = schoolStudents.length - paidCount;

  // Hitung jumlah siswa per rombel
  const countPerRombel = useMemo(() => {
    const map = {};
    schoolStudents.forEach((s) => {
      map[s.gradeRombel] = (map[s.gradeRombel] || 0) + 1;
    });
    return map;
  }, [schoolStudents]);

  const togglePaymentStatus = async (std) => {
    const isPaid = std.status === 'paid' || std.paymentStatus === 'paid';
    const nextStatus = isPaid ? 'unpaid' : 'paid';
    try {
      await handleSaveStudentRegistration({
        ...std,
        status: nextStatus,
        paymentStatus: nextStatus,
      });
      if (showToast) {
        showToast(
          nextStatus === 'paid'
            ? `Status ${std.studentName} diubah menjadi: SUDAH MEMBAYAR`
            : `Status ${std.studentName} diubah menjadi: BELUM MEMBAYAR`,
          nextStatus === 'paid' ? 'success' : 'info'
        );
      }
    } catch (err) {
      console.error('[togglePaymentStatus]', err);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!activeSchool) return;
    if (!newStudent.studentName.trim() || !newStudent.gradeRombel) {
      alert('Nama siswa dan kelas/rombel wajib diisi!');
      return;
    }

    try {
      await handleSaveStudentRegistration({
        schoolRegId: activeSchool.id,
        studentName: newStudent.studentName.trim(),
        gradeRombel: newStudent.gradeRombel,
        parentName: newStudent.parentName.trim() || '-',
        parentPhone: newStudent.parentPhone.trim() || '-',
        notes: newStudent.notes.trim() || null,
        status: newStudent.status || 'paid',
        paymentStatus: newStudent.status || 'paid',
      });
      setShowAddModal(false);
      setNewStudent({
        studentName: '',
        gradeRombel: activeRombel || '',
        parentName: '',
        parentPhone: '',
        notes: '',
        status: 'paid',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus data siswa ${name}?`)) {
      handleDeleteStudentRegistration(id, activeSchool?.id);
    }
  };

  const copyAttendanceList = () => {
    if (filteredStudents.length === 0) return;
    const title = `DAFTAR SISWA OUTING CLASS VR - ${activeSchool?.schoolName || ''}\nKELAS/ROMBEL: ${activeRombel || 'SEMUA'}\nTOTAL: ${filteredStudents.length} SISWA\n\n`;
    const rows = filteredStudents
      .map((s, idx) => `${idx + 1}. ${s.studentName} (${s.gradeRombel}) - Ortu: ${s.parentName || '-'} (${s.parentPhone || '-'})`)
      .join('\n');
    navigator.clipboard.writeText(title + rows);
    showToast('Daftar siswa berhasil disalin!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 py-3 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-white">Portal Guru Kelas</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Rekap Rombel
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeSchool ? `${activeSchool.schoolName} (${activeSchool.cityName})` : 'Pilih Sekolah'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setNewStudent((prev) => ({ ...prev, gradeRombel: activeRombel || availableRombels[0] || '' }));
                setShowAddModal(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-6xl mx-auto w-full px-4 py-6 flex-1 space-y-6">
        {/* Pilih Sekolah jika belum dipilih */}
        {!schoolRegId && (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pilih Sekolah
            </label>
            <select
              value={selectedSchoolId}
              onChange={(e) => {
                setSelectedSchoolId(e.target.value);
                setActiveRombel('');
              }}
              className="w-full max-w-md bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Pilih Sekolah Terdaftar --</option>
              {schoolRegistrations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.schoolName} ({s.cityName})
                </option>
              ))}
            </select>
          </div>
        )}

        {activeSchool ? (
          <>
            {/* Header Ringkasan & Filter Rombel */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <span>{activeSchool.schoolName}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Guru PJ: <span className="text-slate-200 font-semibold">{activeSchool.pjName || '-'}</span>
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama siswa / ortu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Status Pembayaran Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total Terdaftar</span>
                    <span className="text-lg font-extrabold text-white">{schoolStudents.length} Siswa</span>
                  </div>
                  <Users className="w-5 h-5 text-slate-500" />
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider block">Sudah Membayar</span>
                    <span className="text-lg font-extrabold text-emerald-300">{paidCount} Siswa</span>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block">Belum Membayar</span>
                    <span className="text-lg font-extrabold text-amber-300">{unpaidCount} Siswa</span>
                  </div>
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              {/* Filter Pembayaran & Rombel Tabs */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                {/* Payment Filter Pills */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400 text-[11px] font-semibold flex items-center mr-1">
                    <Filter className="w-3.5 h-3.5 mr-1" />
                    Status:
                  </span>
                  <button
                    onClick={() => setPaymentFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs ${
                      paymentFilter === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Semua ({schoolStudents.length})
                  </button>
                  <button
                    onClick={() => setPaymentFilter('paid')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs flex items-center space-x-1 ${
                      paymentFilter === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-emerald-400 hover:bg-emerald-950/40'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Sudah Bayar ({paidCount})</span>
                  </button>
                  <button
                    onClick={() => setPaymentFilter('unpaid')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all text-xs flex items-center space-x-1 ${
                      paymentFilter === 'unpaid'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-amber-400 hover:bg-amber-950/40'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Belum Bayar ({unpaidCount})</span>
                  </button>
                </div>

                {/* Rombel Tabs */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setActiveRombel('')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      activeRombel === ''
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Semua Rombel ({schoolStudents.length})
                  </button>
                  {availableRombels.map((code) => {
                    const count = countPerRombel[code] || 0;
                    return (
                      <button
                        key={code}
                        onClick={() => setActiveRombel(code)}
                        className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                          activeRombel === code
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>Kelas {code}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${count > 0 ? 'bg-indigo-400/30 text-indigo-200' : 'bg-slate-700 text-slate-400'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Table of Students */}
            <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Daftar Siswa {activeRombel ? `Rombel ${activeRombel}` : 'Seluruh Rombel'} ({filteredStudents.length})
                  </h3>
                </div>
                {filteredStudents.length > 0 && (
                  <button
                    onClick={copyAttendanceList}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Daftar Absensi</span>
                  </button>
                )}
              </div>

              {filteredStudents.length === 0 ? (
                <div className="py-16 text-center text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
                  <p className="text-sm font-semibold">Belum Ada Siswa Terdaftar</p>
                  <p className="text-xs mt-1 text-slate-400">
                    Bagikan link pendaftaran kepada orang tua siswa atau klik "Tambah Siswa" untuk input manual.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-950/60">
                        <th className="py-3 px-4 w-12 text-center">No</th>
                        <th className="py-3 px-4">Nama Siswa</th>
                        <th className="py-3 px-4 text-center">Kelas</th>
                        <th className="py-3 px-4">Nama Orang Tua</th>
                        <th className="py-3 px-4">No. WhatsApp</th>
                        <th className="py-3 px-4 text-center">Status Pembayaran</th>
                        <th className="py-3 px-4">Waktu Daftar</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredStudents.map((std, idx) => {
                        const isPaid = std.status === 'paid' || std.paymentStatus === 'paid';
                        return (
                          <tr key={std.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4 text-center text-slate-500">{idx + 1}</td>
                            <td className="py-3 px-4 font-bold text-white">{std.studentName}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                                {std.gradeRombel}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-300">{std.parentName || '-'}</td>
                            <td className="py-3 px-4">
                              {std.parentPhone && std.parentPhone !== '-' ? (
                                <a
                                  href={`https://wa.me/${std.parentPhone.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center space-x-1 text-emerald-400 hover:text-emerald-300"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{std.parentPhone}</span>
                                </a>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => togglePaymentStatus(std)}
                                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
                                  isPaid
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                                }`}
                                title={isPaid ? 'Klik untuk ubah menjadi Belum Bayar' : 'Klik untuk verifikasi Sudah Bayar'}
                              >
                                {isPaid ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Sudah Bayar</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Belum Bayar</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(std.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDelete(std.id, std.studentName)}
                                className="p-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Hapus data siswa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
            <p className="text-sm font-semibold">Silakan pilih sekolah untuk melihat rekap siswa.</p>
          </div>
        )}
      </main>

      {/* Modal Tambah Siswa Manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Tambah Siswa Manual (Guru Kelas)</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama siswa..."
                  value={newStudent.studentName}
                  onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Kelas / Rombel <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newStudent.gradeRombel}
                  onChange={(e) => setNewStudent({ ...newStudent, gradeRombel: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Pilih Rombel --</option>
                  {availableRombels.map((code) => (
                    <option key={code} value={code}>
                      Kelas {code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nama Orang Tua</label>
                <input
                  type="text"
                  placeholder="Nama ayah / ibu..."
                  value={newStudent.parentName}
                  onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Status Pembayaran</label>
                <select
                  value={newStudent.status}
                  onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="paid">Sudah Membayar</option>
                  <option value="unpaid">Belum Membayar</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
