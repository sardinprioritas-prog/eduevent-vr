import React, { useState } from 'react';
import { Printer, CheckCircle, Building2, Phone } from 'lucide-react';
import html2canvas from 'html2canvas';

const terbilang = (angka) => {
  if (angka === 0) return '';
  const bilangan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  if (angka < 12) return bilangan[angka];
  if (angka < 20) return terbilang(angka - 10) + ' belas';
  if (angka < 100) return terbilang(Math.floor(angka / 10)) + ' puluh ' + terbilang(angka % 10);
  if (angka < 200) return 'seratus ' + terbilang(angka - 100);
  if (angka < 1000) return terbilang(Math.floor(angka / 100)) + ' ratus ' + terbilang(angka % 100);
  if (angka < 2000) return 'seribu ' + terbilang(angka - 1000);
  if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' ribu ' + terbilang(angka % 1000);
  if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + ' juta ' + terbilang(angka % 1000000);
  if (angka < 1000000000000) return terbilang(Math.floor(angka / 1000000000)) + ' miliar ' + terbilang(angka % 1000000000);
  return '';
};

export const ReceiptGenerator = () => {
  const [formData, setFormData] = useState({
    tanggal: '',
    namaSekolah: '',
    namaPic: '',
    noHp: '',
    jumlahSiswa: ''
  });
  const [isVerified, setIsVerified] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const jumlahSiswaInt = parseInt(formData.jumlahSiswa) || 0;
  const totalPembayaran = jumlahSiswaInt * 20000;

  const handleVerify = () => {
    setIsVerified(true);
  };

  const handleDownloadPng = async () => {
    const element = document.getElementById('receipt-print-area');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Nota_Laporan_${formData.tanggal ? formData.tanggal.replace(/\s+/g, '_') : 'Kegiatan'}.png`;
      link.click();
    } catch (error) {
      console.error("Gagal membuat PNG:", error);
    }
  };

  const qrData = `Nama Sekolah: ${formData.namaSekolah}, Nama PIC: ${formData.namaPic}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden print-container">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="p-6 border-b border-slate-800 no-print">
        <h2 className="text-xl font-bold text-white mb-4">Cetak Nota Laporan Kegiatan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Tanggal Kegiatan</label>
            <input 
              type="text" 
              name="tanggal"
              value={formData.tanggal}
              onChange={handleInputChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Contoh: Senin, 12 Agustus 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nama Sekolah</label>
            <input 
              type="text" 
              name="namaSekolah"
              value={formData.namaSekolah}
              onChange={handleInputChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Contoh: SMA Negeri 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nama PIC / Kepala Sekolah</label>
            <input 
              type="text" 
              name="namaPic"
              value={formData.namaPic}
              onChange={handleInputChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nama PIC atau Kepala Sekolah"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nomor HP / PIC Sekolah</label>
            <input 
              type="text" 
              name="noHp"
              value={formData.noHp}
              onChange={handleInputChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0812xxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Jumlah Siswa Partisipasi</label>
            <input 
              type="number" 
              name="jumlahSiswa"
              value={formData.jumlahSiswa}
              onChange={handleInputChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Total Pembayaran (Siswa x 20.000)</label>
            <div className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-indigo-400 font-bold">
              Rp {totalPembayaran.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleVerify}
            disabled={isVerified}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isVerified 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {isVerified ? 'Telah Diverifikasi' : 'Verifikasi Pihak Sekolah'}
          </button>
          
          <button 
            onClick={handleDownloadPng}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak PNG
          </button>
        </div>
      </div>

      <div className="bg-slate-300 p-4 sm:p-8 overflow-auto no-print flex justify-center">
        <div id="receipt-print-area" className="w-[210mm] h-[148.5mm] bg-white text-black shadow-2xl relative print-area overflow-hidden flex-shrink-0" style={{ transform: 'scale(0.95)', transformOrigin: 'top center' }}>
          {/* Header Decorations */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-[#51a8d8]"></div>
          <div className="absolute top-0 right-0" style={{ width: '300px', height: '60px' }}>
            <div className="absolute inset-0 bg-[#3157a3]" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
            <div className="absolute inset-0 bg-[#4271c7]" style={{ clipPath: 'polygon(45% 0%, 100% 0%, 100% 100%, 20% 100%)', opacity: 0.8 }}></div>
          </div>

          <div className="px-12 pt-6 pb-12 relative z-10 flex flex-col h-full">
            
            {/* Header Content */}
            <div className="flex items-center mb-2">
              <img src="/logo-header.png" alt="Logo Triesakti" className="h-12 object-contain" />
            </div>

            <div className="text-center mb-2">
              <h2 className="text-base font-bold text-slate-700 leading-tight">LAPORAN KEGIATAN</h2>
              <h2 className="text-base font-bold text-slate-700 leading-tight">OUTING CLASS VIRTUAL REALITY</h2>
            </div>
            
            <div className="w-full border-b border-slate-500 mb-2"></div>

            {/* Details section */}
            <div className="space-y-1 mb-2 text-[13px] font-medium text-slate-800">
              <div className="grid grid-cols-[200px_auto]">
                <div>Hari / Tanggal</div>
                <div>: {formData.tanggal ? formData.tanggal : <span className="text-transparent border-b border-slate-400 inline-block w-64">___</span>}</div>
              </div>
              <div className="grid grid-cols-[200px_auto]">
                <div>Sekolah</div>
                <div>: {formData.namaSekolah ? formData.namaSekolah : <span className="text-transparent border-b border-slate-400 inline-block w-64">___</span>}</div>
              </div>
              <div className="grid grid-cols-[200px_auto]">
                <div>Nama Kepala Sekolah</div>
                <div>: {formData.namaPic ? formData.namaPic : <span className="text-transparent border-b border-slate-400 inline-block w-64">___</span>}</div>
              </div>
              <div className="grid grid-cols-[200px_auto]">
                <div>PIC Sekolah / No. Telepon</div>
                <div>: {formData.noHp ? formData.noHp : <span className="text-transparent border-b border-slate-400 inline-block w-64">___</span>}</div>
              </div>
            </div>

            {/* Table and School Box section */}
            <div className="flex gap-4 mb-2 items-start">
              {/* Table */}
              <div className="w-7/12 flex flex-col">
                <div className="border border-slate-800 flex flex-col">
                  <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-50 text-center text-sm">
                    <div className="py-2 px-1 border-r border-slate-800 font-medium">Jumlah Siswa</div>
                    <div className="py-2 px-1 border-r border-slate-800 font-medium">Harga Tiket</div>
                    <div className="py-2 px-1 font-medium">Total Pembayaran</div>
                  </div>
                  <div className="grid grid-cols-3 text-center items-center">
                    <div className="py-2 px-1 border-r border-slate-800 text-lg font-bold min-h-[50px] flex items-center justify-center">
                      {formData.jumlahSiswa}
                    </div>
                    <div className="py-2 px-1 border-r border-slate-800 text-sm min-h-[50px] flex items-center justify-center">
                      Rp20.000,-
                    </div>
                    <div className="py-2 px-2 text-lg font-bold text-left min-h-[50px] flex items-center whitespace-nowrap">
                      Rp {totalPembayaran > 0 ? totalPembayaran.toLocaleString('id-ID') : ''}
                    </div>
                  </div>
                </div>
                {/* Terbilang Section */}
                <div className="mt-1 bg-slate-100 p-1.5 rounded border border-slate-200 text-[11px] italic text-slate-700">
                  <span className="font-semibold not-italic">Terbilang: </span>
                  {totalPembayaran > 0 ? `(${terbilang(totalPembayaran).trim().replace(/\s+/g, ' ')} rupiah)` : ''}
                </div>
              </div>

              {/* School Verification Box */}
              <div className="w-5/12 border border-slate-800 p-2 flex flex-col">
                <div className="text-center text-[11px] font-medium mb-1">atas nama pihak sekolah,</div>
                <div className="flex-1 flex flex-col items-center justify-center min-h-[65px]">
                  {isVerified ? (
                    <div className="flex flex-col items-center">
                      <img src={qrUrl} alt="QR Code" className="w-12 h-12" crossOrigin="anonymous" />
                      <div className="text-emerald-700 font-bold text-[10px] tracking-widest mt-1">APPROVED</div>
                    </div>
                  ) : (
                    <div className="text-slate-300 italic text-[10px]">(Verifikasi untuk QRCode)</div>
                  )}
                </div>
                <div className="w-full border-b border-slate-400 mb-1 mt-1"></div>
                <div className="text-center text-xs font-bold truncate px-1 h-4">
                  {formData.namaPic || ''}
                </div>
              </div>
            </div>

            {/* Footer section */}
            <div className="flex justify-between items-start mt-4 pb-0">
              {/* Signature Area */}
              <div>
                <p className="mb-0.5 text-[11px]">Management</p>
                <p className="font-bold text-[11px] mb-0.5">Triesakti Edutainment,</p>
                <div className="relative -mt-2">
                  <img src="/signature-stamp.png" alt="Signature and Stamp" className="w-44 object-contain" />
                </div>
              </div>

              {/* Contact Info Area */}
              <div className="space-y-1.5 text-[10px] font-medium text-slate-700 max-w-[250px]">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5"><Building2 className="w-4 h-4 text-slate-800" /></div>
                  <div className="leading-tight">Jl. Arung Teko, Building Corner Griya Angkasa<br/>No. 1A – Sudiang, Makassar</div>
                </div>
                <div className="flex items-center gap-2">
                  <div><Phone className="w-4 h-4 text-slate-800" /></div>
                  <div>0813-5458-1418</div>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-800"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </div>
                  <div>triesakti_edutainment</div>
                </div>
              </div>
            </div>

          </div>
          {/* Footer Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#51a8d8]"></div>
        </div>
      </div>
    </div>
  );
};
