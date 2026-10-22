import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  GraduationCap,
  User,
  Users,
  Phone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  ChevronLeft,
  Share2,
  Copy,
} from 'lucide-react';

export const ParentStudentRegistration = () => {
  const { schoolRegId } = useParams();
  const navigate = useNavigate();
  const { schoolRegistrations = [], handleSaveStudentRegistration, showToast } = useAuth();

  // Cari data registrasi sekolah
  const selectedSchool = useMemo(() => {
    if (!schoolRegId) return null;
    return schoolRegistrations.find((reg) => reg.id === schoolRegId);
  }, [schoolRegId, schoolRegistrations]);

  // Jika tanpa ID di URL, pilih dari daftar yang aktif
  const [manualSchoolId, setManualSchoolId] = useState('');
  const activeSchool = selectedSchool || schoolRegistrations.find((s) => s.id === manualSchoolId);

  const [formData, setFormData] = useState({
    studentName: '',
    gradeRombel: '',
    parentName: '',
    parentPhone: '',
    notes: '',
    agree: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  // Daftar rombel dinamis sekolah
  const availableRombels = useMemo(() => {
    if (!activeSchool) return [];
    const isSMP = (activeSchool.schoolName || '').toUpperCase().includes('SMP');
    const grades = isSMP ? [7, 8, 9] : [1, 2, 3, 4, 5, 6];
    const rombelCount = parseInt(activeSchool.rombelCount) || 1;

    const list = [];
    for (const g of grades) {
      for (let r = 0; r < rombelCount; r++) {
        const code = `${g}${String.fromCharCode(65 + r)}`;
        list.push({ code, label: `Kelas ${g} - Rombel ${String.fromCharCode(65 + r)}` });
      }
    }
    return list;
  }, [activeSchool]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeSchool) {
      alert('Pilih sekolah terlebih dahulu!');
      return;
    }
    if (!formData.studentName.trim()) {
      alert('Nama lengkap siswa wajib diisi!');
      return;
    }
    if (!formData.gradeRombel) {
      alert('Pilih kelas / rombel siswa!');
      return;
    }
    if (!formData.parentName.trim()) {
      alert('Nama orang tua / wali wajib diisi!');
      return;
    }
    if (!formData.parentPhone.trim()) {
      alert('Nomor WhatsApp aktif wajib diisi!');
      return;
    }
    if (!formData.agree) {
      alert('Mohon centang persetujuan keikutsertaan kegiatan VR!');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        schoolRegId: activeSchool.id,
        studentName: formData.studentName.trim(),
        gradeRombel: formData.gradeRombel,
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
        notes: formData.notes.trim() || null,
        status: 'unpaid',
      };

      const result = await handleSaveStudentRegistration(payload);
      const createdItem = Array.isArray(result) ? result[0] : payload;
      setRegisteredSuccess({
        ...payload,
        id: createdItem?.id || `std-${Date.now()}`,
        schoolName: activeSchool.schoolName,
        cityName: activeSchool.cityName,
        submittedAt: new Date().toLocaleString('id-ID'),
      });
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim pendaftaran: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setRegisteredSuccess(null);
    setFormData({
      studentName: '',
      gradeRombel: '',
      parentName: '',
      parentPhone: '',
      notes: '',
      agree: false,
    });
  };

  const copyBukti = () => {
    if (!registeredSuccess) return;
    const text = `*BUKTI PENDAFTARAN OUTING CLASS VR*\n\nID: ${registeredSuccess.id}\nNama Siswa: ${registeredSuccess.studentName}\nKelas/Rombel: ${registeredSuccess.gradeRombel}\nSekolah: ${registeredSuccess.schoolName}\nOrang Tua: ${registeredSuccess.parentName}\nNo. WA: ${registeredSuccess.parentPhone}\nWaktu: ${registeredSuccess.submittedAt}\n\n_Data telah terhubung ke Guru Kelas dan Guru PJ Sekolah._`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Bukti pendaftaran disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Beranda EduEvent</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Pendaftaran Siswa VR
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-xl mx-auto w-full px-4 py-6 flex-1">
        {registeredSuccess ? (
          /* ======================================================== */
          /* SUCCESS SLIP / BUKTI PENDAFTARAN */
          /* ======================================================== */
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 bg-slate-900/90 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Pendaftaran Berhasil!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Data siswa telah tersimpan dan terhubung ke Guru Kelas.
              </p>
            </div>

            {/* Slip Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs mb-6 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">ID REGISTRASI</span>
                <span className="text-indigo-400 font-bold">{registeredSuccess.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">NAMA SISWA</span>
                <span className="text-slate-200 font-bold text-sm">{registeredSuccess.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">KELAS / ROMBEL</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  {registeredSuccess.gradeRombel}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">SEKOLAH</span>
                <span className="text-slate-200 text-right">{registeredSuccess.schoolName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">ORANG TUA / WALI</span>
                <span className="text-slate-200">{registeredSuccess.parentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NO. WHATSAPP</span>
                <span className="text-slate-300">{registeredSuccess.parentPhone}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={copyBukti}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Bukti Pendaftaran'}</span>
              </button>

              <button
                onClick={handleResetForm}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-all"
              >
                Daftarkan Siswa Lain (Adik / Kakak)
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* FORM PENDAFTARAN ORANG TUA */
          /* ======================================================== */
          <div className="glass-card rounded-2xl p-5 md:p-6 border border-slate-800 bg-slate-900/90 shadow-2xl">
            {/* Title & School Badge */}
            <div className="mb-6 pb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-white">
                    Pendaftaran Mandiri Outing Class VR
                  </h1>
                  <p className="text-xs text-slate-400">
                    Formulir partisipasi siswa dalam simulasi Virtual Reality
                  </p>
                </div>
              </div>

              {/* Sekolah Terpilih */}
              {activeSchool ? (
                <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                      Sekolah Tujuan
                    </span>
                    <span className="text-xs font-extrabold text-white">
                      {activeSchool.schoolName}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Wilayah: {activeSchool.cityName} {activeSchool.kecamatan ? `• Kec. ${activeSchool.kecamatan}` : ''}
                    </span>
                  </div>
                  <Building2 className="w-5 h-5 text-indigo-400 shrink-0" />
                </div>
              ) : (
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pilih Sekolah Anak Anda <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={manualSchoolId}
                    onChange={(e) => setManualSchoolId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
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
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Lengkap Siswa */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rayhan"
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Kelas / Rombel */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Kelas / Rombel <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    required
                    value={formData.gradeRombel}
                    onChange={(e) => setFormData({ ...formData, gradeRombel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Pilih Kelas / Rombel --</option>
                    {availableRombels.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Pilih rombel sesuai kelas anak Anda saat ini.
                </p>
              </div>

              {/* Nama Orang Tua */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nama Orang Tua / Wali <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Hendra Saputra"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Nomor WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Catatan Khusus */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Catatan Khusus (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Contoh: Menggunakan kacamata minus, dsb."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Checkbox Persetujuan */}
              <div className="pt-2">
                <label className="flex items-start space-x-2.5 cursor-pointer select-none p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    required
                    checked={formData.agree}
                    onChange={(e) => setFormData({ ...formData, agree: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500/50 bg-slate-900"
                  />
                  <span className="text-[11px] text-slate-300 leading-relaxed">
                    Saya menyatakan data di atas benar dan memberikan izin kepada anak saya untuk mengikuti program Outing Class EduEvent VR di sekolah.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran Siswa'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[10px] text-slate-500 border-t border-slate-900">
        EduEvent VR System • Terintegrasi dengan Guru Kelas & Portal Sekolah
      </footer>
    </div>
  );
};
