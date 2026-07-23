import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { Table, Download, FileSpreadsheet, FileText, Filter, RefreshCw, Calendar, MapPin, Lock } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const RecapTable = ({ selectedCity }) => {
  const { events, cities, showToast } = useAuth();

  // Filter States (manual city filter only shown for pimpinan)
  const [internalCity, setInternalCity] = useState('ALL');
  const [selectedDuration, setSelectedDuration] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // isKadin means selectedCity is locked (not null)
  const isKadinView = Boolean(selectedCity);

  // Effective city filter
  const effectiveCity = isKadinView ? selectedCity : internalCity;

  // Filtering Logic
  const filteredEvents = events.filter((evt) => {
    // City filter (locked for kadin, manual for pimpinan)
    if (effectiveCity !== 'ALL' && evt.cityName !== effectiveCity && evt.cityId !== effectiveCity) {
      return false;
    }
    // Duration filter
    if (selectedDuration !== 'ALL' && evt.duration !== selectedDuration) {
      return false;
    }
    // Date Range
    if (startDate && evt.date < startDate) {
      return false;
    }
    if (endDate && evt.date > endDate) {
      return false;
    }
    // Search School
    if (searchQuery && !evt.schoolName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const resetFilters = () => {
    if (!isKadinView) setInternalCity('ALL');
    setSelectedDuration('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  // Export to Excel
  const exportToExcel = () => {
    if (filteredEvents.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const excelData = filteredEvents.map((e, index) => {
      const rate =
        e.dapodikStudents > 0
          ? ((e.participatingStudents / e.dapodikStudents) * 100).toFixed(1)
          : 0;

      return {
        'No': index + 1,
        'Nama Sekolah': e.schoolName,
        'Kota': e.cityName,
        'Tanggal Kegiatan': e.date,
        'Durasi': e.duration,
        'Sesi': e.session,
        'Total Siswa (Dapodik)': e.dapodikStudents,
        'Siswa Berpartisipasi': e.participatingStudents,
        'Tingkat Konversi (%)': `${rate}%`,
        'Operator Field': e.operatorName || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap_VR');

    const suffix = isKadinView ? `_${selectedCity}` : '';
    XLSX.writeFile(workbook, `Laporan_Rekap_VR_EduEvent${suffix}_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Berhasil mengekspor Laporan Excel (.xlsx)', 'success');
  };

  // Export to PDF
  const exportToPDF = () => {
    if (filteredEvents.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'warning');
      return;
    }

    const doc = new jsPDF('landscape');

    // Header Title
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    const titleSuffix = isKadinView ? ` — WILAYAH ${selectedCity.toUpperCase()}` : '';
    doc.text(`LAPORAN REKAPITULASI PROGRAM VIRTUAL REALITY (EDUEVENT)${titleSuffix}`, 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')} | Total Kegiatan: ${filteredEvents.length}`, 14, 22);

    // Table Columns & Rows
    const tableColumn = [
      'No',
      'Sekolah',
      'Kota',
      'Tanggal',
      'Durasi/Sesi',
      'Dapodik',
      'Partisipan',
      'Konversi (%)',
    ];

    const tableRows = filteredEvents.map((e, index) => {
      const rate =
        e.dapodikStudents > 0
          ? ((e.participatingStudents / e.dapodikStudents) * 100).toFixed(1)
          : 0;

      return [
        index + 1,
        e.schoolName,
        e.cityName,
        e.date,
        `${e.duration} (${e.session})`,
        e.dapodikStudents,
        e.participatingStudents,
        `${rate}%`,
      ];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
    });

    const suffix = isKadinView ? `_${selectedCity}` : '';
    doc.save(`Laporan_Rekap_VR_EduEvent${suffix}_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Berhasil mengekspor Laporan PDF', 'success');
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
      {/* Header Title & Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Table className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Tabel Rekapitulasi Detail Program VR
              {isKadinView && (
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedCity}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {isKadinView
                ? `Laporan terbatas wilayah ${selectedCity} dengan penyaringan & ekspor`
                : 'Laporan transaksi per sekolah dengan penyaringan komprehensif & fitur ekspor'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={exportToExcel}
            className="flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            Ekspor Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Ekspor PDF
          </button>
        </div>
      </div>

      {/* Filter Control Panel */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter &amp; Penyaringan Laporan</span>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset Filter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search School */}
          <div>
            <label className="block text-slate-400 mb-1">Pencarian Sekolah</label>
            <input
              type="text"
              placeholder="Cari sekolah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* City Filter — locked for kadin, editable for pimpinan */}
          <div>
            <label className="block text-slate-400 mb-1 flex items-center space-x-1">
              <span>Kota / Wilayah</span>
              {isKadinView && <Lock className="w-3 h-3 text-amber-400 ml-1" />}
            </label>
            {isKadinView ? (
              <div className="w-full bg-slate-950/80 border border-amber-500/30 rounded-lg px-3 py-1.5 text-amber-300 font-semibold flex items-center space-x-1.5">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{selectedCity}</span>
              </div>
            ) : (
              <select
                value={internalCity}
                onChange={(e) => setInternalCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Semua Kota</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-slate-400 mb-1">Durasi Kegiatan</label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Durasi</option>
              <option value="1 Hari">1 Hari</option>
              <option value="2 Hari">2 Hari</option>
            </select>
          </div>

          {/* Date Start */}
          <div>
            <label className="block text-slate-400 mb-1">Mulai Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Date End */}
          <div>
            <label className="block text-slate-400 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/80">
              <th className="py-3 px-4">Nama Sekolah</th>
              <th className="py-3 px-4">Kota</th>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Durasi &amp; Sesi</th>
              <th className="py-3 px-4 text-center">Partisipan / Dapodik</th>
              <th className="py-3 px-4 text-center">Konversi (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500">
                  Tidak ada data rekapitulasi yang cocok dengan filter yang dipilih.
                </td>
              </tr>
            ) : (
              filteredEvents.map((item) => {
                const rate =
                  item.dapodikStudents > 0
                    ? ((item.participatingStudents / item.dapodikStudents) * 100).toFixed(1)
                    : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100">{item.schoolName}</td>
                    <td className="py-3 px-4 text-slate-300">{item.cityName}</td>
                    <td className="py-3 px-4 text-slate-400">{item.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mr-1">
                        {item.duration}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {item.session}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-emerald-400 font-bold">{item.participatingStudents}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-400">{item.dapodikStudents}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          rate >= 80
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : rate >= 50
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
