import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  PlusCircle,
  RefreshCw,
  Lock,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Tag,
  Trash2,
  Edit,
  PieChart as PieIcon,
  BarChart3,
  ShieldAlert,
  Key,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const FinancialManagement = () => {
  const {
    finances,
    isFinanceUnlocked,
    lockFinance,
    changeFinancePasscode,
    handleSaveFinance,
    handleDeleteFinance,
    autoSyncActivityFinances,
    cities,
    schools,
    showToast
  } = useAuth();

  // Filters & State
  const [filterType, setFilterType] = useState('all'); // 'all' | 'income' | 'expense'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all'); // 'all' | '7days' | '30days' | 'thisMonth'

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    category: 'Tiket VR Siswa',
    title: '',
    amount: '',
    cityName: 'Semua Wilayah',
    schoolName: '',
    refNo: '',
    notes: ''
  });

  // Modal State for Passcode Change
  const [isPasscodeChangeOpen, setIsPasscodeChangeOpen] = useState(false);
  const [newPasscode, setNewPasscode] = useState('');

  // Categories presets
  const INCOME_CATEGORIES = [
    'Tiket VR Siswa',
    'Kerjasama Kemitraan Sekolah',
    'Sponsorship & Donasi',
    'Layanan Demo VR',
    'Lainnya (Pemasukan)'
  ];

  const EXPENSE_CATEGORIES = [
    'Honor Operator & Pioneer',
    'Operasional Event VR',
    'Lisensi & Maintenance Hardware VR',
    'Pemasaran & Transportasi',
    'Pengadaan Perangkat Headset VR',
    'Lainnya (Pengeluaran)'
  ];

  // Helper format currency IDR
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Filtered finances
  const filteredFinances = useMemo(() => {
    return finances.filter(item => {
      // Type filter
      if (filterType !== 'all' && item.type !== filterType) return false;
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // City filter
      if (selectedCity !== 'all' && item.cityName !== selectedCity) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesRef = item.refNo?.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        const matchesSchool = item.schoolName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesRef && !matchesNotes && !matchesSchool) return false;
      }
      return true;
    });
  }, [finances, filterType, selectedCategory, selectedCity, searchQuery]);

  // Total Summary KPI calculations
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    filteredFinances.forEach(item => {
      const amt = Number(item.amount) || 0;
      if (item.type === 'income') {
        income += amt;
      } else {
        expense += amt;
      }
    });

    const netCashflow = income - expense;
    const profitMargin = income > 0 ? ((netCashflow / income) * 100).toFixed(1) : 0;

    return { income, expense, netCashflow, profitMargin };
  }, [filteredFinances]);

  // Chart data preparation
  const chartData = useMemo(() => {
    // Group transactions by date
    const dateMap = {};

    finances.forEach(item => {
      const dateKey = item.date || item.createdAt?.split('T')[0] || 'Unsorted';
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { date: dateKey, Pemasukan: 0, Pengeluaran: 0, Net: 0 };
      }
      const amt = Number(item.amount) || 0;
      if (item.type === 'income') {
        dateMap[dateKey].Pemasukan += amt;
      } else {
        dateMap[dateKey].Pengeluaran += amt;
      }
      dateMap[dateKey].Net = dateMap[dateKey].Pemasukan - dateMap[dateKey].Pengeluaran;
    });

    // Sort by date ascending
    return Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [finances]);

  // Pie chart category distribution
  const pieCategoryData = useMemo(() => {
    const catMap = {};
    finances.forEach(item => {
      const cat = item.category || 'Lainnya';
      if (!catMap[cat]) {
        catMap[cat] = { name: cat, value: 0, type: item.type };
      }
      catMap[cat].value += Number(item.amount) || 0;
    });
    return Object.values(catMap);
  }, [finances]);

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

  // Form Handlers
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'Tiket VR Siswa',
      title: '',
      amount: '',
      cityName: 'Semua Wilayah',
      schoolName: '',
      refNo: `REF-${Date.now().toString().slice(-6)}`,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      date: item.date || new Date().toISOString().split('T')[0],
      type: item.type || 'income',
      category: item.category || 'Tiket VR Siswa',
      title: item.title || '',
      amount: item.amount || '',
      cityName: item.cityName || 'Semua Wilayah',
      schoolName: item.schoolName || '',
      refNo: item.refNo || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      showToast('Judul dan jumlah nominal wajib diisi.', 'warning');
      return;
    }

    const payload = {
      ...(editingItem ? { id: editingItem.id } : {}),
      ...formData,
      amount: Number(formData.amount)
    };

    handleSaveFinance(payload);
    setIsModalOpen(false);
  };

  const handleChangePasscodeSubmit = (e) => {
    e.preventDefault();
    if (newPasscode.length < 4) {
      showToast('PIN Passcode minimal 4 karakter!', 'warning');
      return;
    }
    changeFinancePasscode(newPasscode);
    setIsPasscodeChangeOpen(false);
    setNewPasscode('');
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['ID,Tanggal,Tipe,Kategori,Judul,Nominal (Rp),Wilayah,Sekolah,No. Referensi,Catatan'];
    const rows = filteredFinances.map(f => [
      f.id,
      f.date,
      f.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${f.category}"`,
      `"${f.title}"`,
      f.amount,
      `"${f.cityName || ''}"`,
      `"${f.schoolName || ''}"`,
      `"${f.refNo || ''}"`,
      `"${f.notes || ''}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Cashflow_EduEvent_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Keuangan berhasil di-export ke CSV', 'success');
  };

  if (!isFinanceUnlocked) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl mx-auto flex items-center justify-center text-red-400">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Modul Keuangan Terkunci</h2>
          <p className="text-xs text-slate-400 mt-2">
            Akses ke data cashflow, pemasukan, dan pengeluaran bersifat rahasia. Silakan klik tombol bertuliskan <strong>Admin</strong> di bagian header atau masukkan PIN untuk membuka akses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
                Manajemen Keuangan & Cashflow
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Terproteksi
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Kontrol penuh arus kas pemasukan dan pengeluaran edutainment yang terintegrasi dengan seluruh kegiatan VR sekolah, honor operator/pioneer, dan operasional lembaga.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={autoSyncActivityFinances}
              className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all shadow-md active:scale-95"
              title="Sinkronkan otomatis pemasukan dari event siswa VR"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Activity VR</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsPasscodeChangeOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all"
              title="Ubah PIN Passcode"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Ganti PIN</span>
            </button>

            <button
              onClick={lockFinance}
              className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all shadow-md active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Kunci Keuangan</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Income */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pemasukan</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {formatIDR(totals.income)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Hasil dari tiket VR & kemitraan sekolah</span>
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Pengeluaran</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-400 font-mono tracking-tight">
              {formatIDR(totals.expense)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Honor, operasional, & perangkat VR</span>
            </p>
          </div>
        </div>

        {/* Net Cashflow (Saldo) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Arus Kas Bersih (Net)</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black font-mono tracking-tight ${totals.netCashflow >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
              {formatIDR(totals.netCashflow)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Status: <span className="font-bold text-slate-200">{totals.netCashflow >= 0 ? 'Surplus / Untung' : 'Defisit / Rugi'}</span>
            </p>
          </div>
        </div>

        {/* Profit Margin % */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profit Margin</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <PieIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-400 font-mono tracking-tight">
              {totals.profitMargin}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Rasio efisiensi keuangan edutainment
            </p>
          </div>
        </div>
      </div>

      {/* Cashflow Trends & Category Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Composed Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Tren Arus Kas (Cashflow Over Time)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Perbandingan grafik pemasukan, pengeluaran, dan net kas per tanggal transaksi
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(value) => [formatIDR(value), '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Pemasukan" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Line type="monotone" dataKey="Net" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-400" />
              Sebaran Kategori Keuangan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proporsi nominal berdasarkan kategori transaksi
            </p>

            <div className="h-56 w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(value) => [formatIDR(value), 'Nominal']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Legend */}
          <div className="space-y-1.5 pt-2 max-h-24 overflow-y-auto pr-1">
            {pieCategoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-2 text-slate-300 truncate">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="font-mono font-bold text-slate-200">{formatIDR(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Transactions Management Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Daftar Transaksi Arus Kas (Cashflow Logs)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Menampilkan {filteredFinances.length} transaksi tercatat
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Type Pills */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'income' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterType === 'expense' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pengeluaran
              </button>
            </div>

            {/* City Dropdown */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Wilayah</option>
              {cities.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>

            {/* Add Transaction Button */}
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Transaksi</span>
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Tipe</th>
                <th className="py-3.5 px-4">Kategori & Judul</th>
                <th className="py-3.5 px-4">Wilayah / Sekolah</th>
                <th className="py-3.5 px-4">No. Referensi</th>
                <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredFinances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Belum ada data transaksi keuangan yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredFinances.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {item.date}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.type === 'income' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Pemasukan
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Pengeluaran
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        <span>{item.category}</span>
                        {item.notes && <span className="text-slate-500">· {item.notes}</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      <div>{item.cityName || 'Semua Wilayah'}</div>
                      {item.schoolName && <div className="text-[10px] text-slate-400">{item.schoolName}</div>}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {item.refNo || '-'}
                    </td>

                    <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm whitespace-nowrap ${
                      item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {item.type === 'income' ? '+' : '-'}{formatIDR(item.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus transaksi "${item.title}"?`)) {
                              handleDeleteFinance(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 bg-slate-950 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-400" />
                {editingItem ? 'Edit Transaksi Keuangan' : 'Tambah Transaksi Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: INCOME_CATEGORIES[0] })}
                  className={`py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all ${
                    formData.type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Pemasukan (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: EXPENSE_CATEGORIES[0] })}
                  className={`py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 border transition-all ${
                    formData.type === 'expense'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>Pengeluaran (-)</span>
                </button>
              </div>

              {/* Title & Amount */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Judul / Deskripsi Transaksi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemasukan Tiket VR SMA 1 Bone"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Nominal Rp *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Contoh: 1500000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Category & City */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Kategori Transaksi</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Wilayah / Kota</label>
                  <select
                    value={formData.cityName}
                    onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Semua Wilayah">Semua Wilayah</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* School Name & Ref No */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Nama Sekolah (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: SMA Negeri 1 Bone"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">No. Kwitansi / Ref</label>
                  <input
                    type="text"
                    placeholder="Contoh: INV-2026-001"
                    value={formData.refNo}
                    onChange={(e) => setFormData({ ...formData, refNo: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Detail keterangan transaksi..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Change Passcode */}
      {isPasscodeChangeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Ubah PIN Passcode Keuangan
              </h3>
              <button
                onClick={() => setIsPasscodeChangeOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePasscodeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Passcode Baru (Minimal 4 Angka)</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan PIN baru..."
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-center font-bold tracking-widest text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasscodeChangeOpen(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-600/20"
                >
                  Simpan PIN Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
