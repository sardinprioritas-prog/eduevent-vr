import React, { useState } from 'react';
import { Printer, CheckCircle, Building2, Phone, Instagram } from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
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
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF / Print
          </button>
        </div>
      </div>

      <div className="bg-slate-300 p-4 sm:p-8 overflow-auto no-print flex justify-center">
        <div className="w-[210mm] min-h-[297mm] bg-white text-black shadow-2xl relative print-area overflow-hidden flex-shrink-0" style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
          {/* Header Decorations */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-[#51a8d8]"></div>
          <div className="absolute top-0 right-0" style={{ width: '400px', height: '100px' }}>
            <div className="absolute inset-0 bg-[#3157a3]" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)' }}></div>
            <div className="absolute inset-0 bg-[#4271c7]" style={{ clipPath: 'polygon(45% 0%, 100% 0%, 100% 100%, 20% 100%)', opacity: 0.8 }}></div>
          </div>

          <div className="px-16 pt-16 pb-12 relative z-10 flex flex-col min-h-[297mm]">
            
            {/* Header Content */}
            <div className="flex items-center mb-8 gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#3157a3] flex items-center justify-center p-1">
                 <img src="/logo-eduevent.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-wider">TRI<span className="text-[#51a8d8]">e</span>SAKTI</h1>
                <p className="text-md tracking-[0.2em] text-slate-500 uppercase">Edutainment</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-medium text-slate-700">LAPORAN KEGIATAN</h2>
              <h2 className="text-xl font-medium text-slate-700">OUTING CLASS VIRTUAL REALITY</h2>
            </div>
            
            <div className="w-full border-b border-slate-500 mb-6"></div>

            {/* Details section */}
            <div className="space-y-3 mb-8 text-[17px] font-medium text-slate-800">
              <div className="grid grid-cols-[250px_auto]">
                <div>Hari / Tanggal</div>
                <div>: {formData.tanggal ? formData.tanggal : <span className="text-transparent border-b border-slate-400 inline-block w-64">___</span>}</div>
              </div>
              <div className="grid grid-cols-[250px_auto]">
                <div>Sekolah</div>
                <div>: {formData.namaSekolah ? formData.namaSekolah : <span className="text-transparent border-b border-slate-400 inline-block w-64">___</span>}</div>
              </div>
              <div className="grid grid-cols-[250px_auto]">
                <div>Nama Kepala Sekolah</div>
                <div>: {formData.namaPic ? formData.namaPic : <span className="text-transparent border-b border-slate-400 inline-block w-64">___</span>}</div>
              </div>
              <div className="grid grid-cols-[250px_auto]">
                <div>PIC Sekolah / No. Telepon</div>
                <div>: {formData.noHp ? formData.noHp : <span className="text-transparent border-b border-slate-400 inline-block w-64">___</span>}</div>
              </div>
            </div>

            {/* Table and School Box section */}
            <div className="flex gap-4 mb-16 items-stretch">
              {/* Table */}
              <div className="w-7/12 border border-slate-800 flex flex-col">
                <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-50 text-center">
                  <div className="py-2 px-2 border-r border-slate-800 font-medium">Jumlah Siswa</div>
                  <div className="py-2 px-2 border-r border-slate-800 font-medium">Harga Tiket</div>
                  <div className="py-2 px-2 font-medium">Total Pembayaran</div>
                </div>
                <div className="grid grid-cols-3 flex-1 text-center items-center">
                  <div className="py-8 px-2 border-r border-slate-800 text-xl font-bold min-h-[120px] flex items-center justify-center">
                    {formData.jumlahSiswa}
                  </div>
                  <div className="py-8 px-2 border-r border-slate-800 text-lg min-h-[120px] flex items-center justify-center">
                    Rp20.000,-
                  </div>
                  <div className="py-8 px-4 text-xl font-bold text-left min-h-[120px] flex items-center">
                    Rp {totalPembayaran > 0 ? totalPembayaran.toLocaleString('id-ID') : ''}
                  </div>
                </div>
              </div>

              {/* School Verification Box */}
              <div className="w-5/12 border border-slate-800 p-3 flex flex-col">
                <div className="text-center text-sm font-medium mb-2">atas nama pihak sekolah,</div>
                <div className="flex-1 flex flex-col items-center justify-center min-h-[100px]">
                  {isVerified ? (
                    <div className="flex flex-col items-center">
                      <img src={qrUrl} alt="QR Code" className="w-20 h-20" crossOrigin="anonymous" />
                      <div className="text-emerald-700 font-bold text-sm tracking-widest mt-1">APPROVED</div>
                    </div>
                  ) : (
                    <div className="text-slate-300 italic text-xs">(Verifikasi untuk QRCode)</div>
                  )}
                </div>
                <div className="w-full border-b border-slate-400 mb-1 mt-2"></div>
                <div className="text-center text-sm font-bold truncate px-2 h-5">
                  {formData.namaPic || ''}
                </div>
              </div>
            </div>

            {/* Spacer to push footer to bottom if needed, or just let it flow */}
            <div className="flex-1"></div>

            {/* Footer section */}
            <div className="flex justify-between items-end pb-8">
              {/* Signature Area */}
              <div>
                <p className="mb-1 text-sm">Management</p>
                <p className="font-bold text-sm mb-12">Triesakti Edutainment,</p>
                <div className="relative inline-block mt-4">
                  <div className="relative z-10 w-48 text-center border-b border-black">
                    {/* Simulated signature text */}
                    <span className="font-black text-2xl" style={{ fontFamily: 'cursive', letterSpacing: '-1px' }}>Sardin Damis</span>
                  </div>
                  <div className="font-bold mt-1 text-center">Sardin Damis</div>

                  {/* Stamp Graphic Simulation */}
                  <div className="absolute top-[-50px] left-[-30px] w-28 h-28 border-4 border-[#3157a3] rounded-full opacity-40 rotate-[-15deg] flex flex-col items-center justify-center bg-transparent pointer-events-none">
                     <div className="text-[9px] font-black text-[#3157a3]">TRIESAKTI</div>
                     <div className="w-full border-t border-[#3157a3] my-1"></div>
                     <div className="text-[9px] font-bold text-[#3157a3]">EDUTAINMENT</div>
                     <div className="text-[7px] text-[#3157a3] mt-1">VR TECH</div>
                  </div>
                </div>
              </div>

              {/* Contact Info Area */}
              <div className="space-y-3 text-[13px] font-medium text-slate-700 max-w-[280px]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><Building2 className="w-5 h-5 text-slate-800" /></div>
                  <div className="leading-tight">Jl. Arung Teko, Building Corner Griya Angkasa<br/>No. 1A – Sudiang, Makassar</div>
                </div>
                <div className="flex items-center gap-3">
                  <div><Phone className="w-5 h-5 text-slate-800" /></div>
                  <div>0813-5458-1418</div>
                </div>
                <div className="flex items-center gap-3">
                  <div><Instagram className="w-5 h-5 text-slate-800" /></div>
                  <div>triesakti_edutainment</div>
                </div>
              </div>
            </div>

          </div>
          {/* Footer Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#51a8d8]"></div>
        </div>
      </div>
    </div>
  );
};
