import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { PlusCircle, Save, X, Calendar, MapPin, School, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export const EventInputForm = ({ editingEvent, onCancelEdit }) => {
  const { cities, schools, currentUser, handleSaveEvent } = useAuth();

  const activeCities = cities.filter((c) => {
    if (c.active === false) return false;
    if (currentUser?.role === 'operator' || currentUser?.role === 'pioneer') {
      return c.name === currentUser?.city;
    }
    return true;
  });

  const [formData, setFormData] = useState({
    schoolName: '',
    date: new Date().toISOString().split('T')[0],
    cityId: activeCities.length > 0 ? activeCities[0].id : '',
    duration: '1 Hari',
    session: 'Fullday',
    dapodikStudents: '',
    participatingStudents: '',
  });

  const [validationError, setValidationError] = useState('');

  // Sync state if editing
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        id: editingEvent.id,
        schoolName: editingEvent.schoolName || '',
        date: editingEvent.date || new Date().toISOString().split('T')[0],
        cityId: editingEvent.cityId || (activeCities[0]?.id || ''),
        duration: editingEvent.duration || '1 Hari',
        session: editingEvent.session || 'Fullday',
        dapodikStudents: editingEvent.dapodikStudents || '',
        participatingStudents: editingEvent.participatingStudents || '',
      });
    }
  }, [editingEvent, cities]);

  // Handle Duration Auto-Fill Logic
  const handleDurationChange = (e) => {
    const selectedDuration = e.target.value;
    if (selectedDuration === '1 Hari') {
      setFormData((prev) => ({
        ...prev,
        duration: '1 Hari',
        session: 'Fullday', // Auto-filled & locked for 1 Hari
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        duration: '2 Hari',
        session: prev.session === 'Fullday' ? 'Hari-1' : prev.session,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.schoolName.trim()) {
      setValidationError('Nama Sekolah wajib diisi.');
      return;
    }

    if (!formData.cityId) {
      setValidationError('Pilih Kota lokasi kegiatan.');
      return;
    }

    const dapodik = parseInt(formData.dapodikStudents, 10);
    const participating = parseInt(formData.participatingStudents, 10);

    if (isNaN(dapodik) || dapodik <= 0) {
      setValidationError('Jumlah Siswa Dapodik harus berupa angka lebih dari 0.');
      return;
    }

    if (isNaN(participating) || participating < 0) {
      setValidationError('Jumlah Siswa Berpartisipasi harus berupa angka valid.');
      return;
    }

    if (participating > dapodik) {
      setValidationError('Jumlah peserta VR tidak boleh melebihi total siswa Dapodik.');
      return;
    }

    const selectedCity = cities.find((c) => c.id === formData.cityId);

    const payload = {
      ...formData,
      cityName: selectedCity ? selectedCity.name : 'Unknown',
      dapodikStudents: dapodik,
      participatingStudents: participating,
      operatorName: currentUser?.name || 'Operator Lapangan',
    };

    handleSaveEvent(payload);

    // Reset form if not editing
    if (!editingEvent) {
      setFormData({
        schoolName: '',
        date: new Date().toISOString().split('T')[0],
        cityId: activeCities[0]?.id || '',
        duration: '1 Hari',
        session: 'Fullday',
        dapodikStudents: '',
        participatingStudents: '',
      });
    } else if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const dapodikNum = parseInt(formData.dapodikStudents, 10) || 0;
  const partNum = parseInt(formData.participatingStudents, 10) || 0;
  const conversionRate = dapodikNum > 0 ? ((partNum / dapodikNum) * 100).toFixed(1) : 0;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            {editingEvent ? <Save className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {editingEvent ? 'Edit Data Kegiatan VR' : 'Form Input Kegiatan VR'}
            </h2>
            <p className="text-xs text-slate-400">
              {editingEvent
                ? 'Perbarui log data kegiatan yang telah diinput'
                : 'Entri data harian operasional lapangan dengan cepat & presisi'}
            </p>
          </div>
        </div>

        {editingEvent && (
          <button
            onClick={onCancelEdit}
            className="flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all border border-slate-700"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Batal Edit
          </button>
        )}
      </div>

      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kota Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Kota / Wilayah <span className="text-rose-400 ml-1">*</span>
            </label>
            <select
              value={formData.cityId}
              onChange={(e) => {
                setFormData({ ...formData, cityId: e.target.value, schoolName: '' });
              }}
              disabled={currentUser?.role === 'operator' || currentUser?.role === 'pioneer'}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {activeCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Sekolah */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
              <School className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Nama Sekolah <span className="text-rose-400 ml-1">*</span>
            </label>
            <select
              required
              value={formData.schoolName}
              onChange={(e) => {
                const selectedSchool = schools.find(s => s.name === e.target.value);
                setFormData({ 
                  ...formData, 
                  schoolName: e.target.value,
                  dapodikStudents: selectedSchool ? selectedSchool.studentCount : formData.dapodikStudents
                });
              }}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>-- Pilih Target Sekolah --</option>
              {schools.filter(s => s.cityId === formData.cityId && s.active !== false).map(school => (
                <option key={school.id} value={school.name}>{school.name}</option>
              ))}
            </select>
          </div>

          {/* Tanggal Kegiatan */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Tanggal Kegiatan <span className="text-rose-400 ml-1">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>


        </div>

        {/* Section Durasi & Sesi (Otomasisasi Logika) */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Pengaturan Durasi & Sesi (Otomatisasi)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Durasi */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400">
                Pilih Durasi Kegiatan
              </label>
              <select
                value={formData.duration}
                onChange={handleDurationChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all font-semibold"
              >
                <option value="1 Hari">1 Hari (Fullday)</option>
                <option value="2 Hari">2 Hari (Bertahap)</option>
              </select>
            </div>

            {/* Sesi */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400 flex items-center justify-between">
                <span>Pilih Sesi Kegiatan</span>
                {formData.duration === '1 Hari' && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Otomatis Terkunci (Fullday)
                  </span>
                )}
              </label>

              {formData.duration === '1 Hari' ? (
                <input
                  type="text"
                  disabled
                  value="Fullday"
                  className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed font-semibold"
                />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      formData.session === 'Hari-1'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="session_choice"
                      value="Hari-1"
                      checked={formData.session === 'Hari-1'}
                      onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                      className="sr-only"
                    />
                    Hari-1
                  </label>
                  <label
                    className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      formData.session === 'Hari-2'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="session_choice"
                      value="Hari-2"
                      checked={formData.session === 'Hari-2'}
                      onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                      className="sr-only"
                    />
                    Hari-2
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Matriks Peserta */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Matriks Peserta & Partisipasi</span>
            </div>

            {dapodikNum > 0 && partNum >= 0 && (
              <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Tingkat Konversi: {conversionRate}%
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Jumlah Siswa (Dapodik) */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400">
                Jumlah Siswa (Dapodik) <span className="text-rose-400 ml-1">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="Total keseluruhan siswa di sekolah"
                value={formData.dapodikStudents}
                onChange={(e) => setFormData({ ...formData, dapodikStudents: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Jumlah Siswa Berpartisipasi */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400">
                Jumlah Siswa Berpartisipasi (Aktual VR) <span className="text-rose-400 ml-1">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Jumlah aktual yang ikut mencoba VR"
                value={formData.participatingStudents}
                onChange={(e) => setFormData({ ...formData, participatingStudents: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {editingEvent ? 'Simpan Perubahan' : 'Simpan Data Kegiatan'}
          </button>
        </div>
      </form>
    </div>
  );
};
