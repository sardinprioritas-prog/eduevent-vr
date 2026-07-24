export const INITIAL_CITIES = [
  { id: 'city-1', name: 'Bone', province: 'Sulawesi Selatan', active: true },
  { id: 'city-2', name: 'Parepare', province: 'Sulawesi Selatan', active: true },
  { id: 'city-3', name: 'Makassar', province: 'Sulawesi Selatan', active: true },
  { id: 'city-4', name: 'Palopo', province: 'Sulawesi Selatan', active: true },
  { id: 'city-5', name: 'Gowa', province: 'Sulawesi Selatan', active: true },
  { id: 'city-6', name: 'Maros', province: 'Sulawesi Selatan', active: true },
];

export const INITIAL_SCHOOLS = [
  { id: 'sch-1', cityId: 'city-1', name: 'SMA Negeri 1 Bone', studentCount: 450, demoDate: '2026-07-10', eventDate: '2026-07-15', active: true },
  { id: 'sch-2', cityId: 'city-2', name: 'SMK Negeri 2 Parepare', studentCount: 300, demoDate: '2026-07-12', eventDate: '2026-07-18', active: true },
  { id: 'sch-3', cityId: 'city-3', name: 'SMA Negeri 5 Makassar', studentCount: 800, demoDate: '2026-07-20', eventDate: '2026-07-25', active: true },
];

export const INITIAL_USER_SALARY_SETTINGS = [
  {
    userId: 'usr-1', // Budi Santoso (Operator)
    fee: 1000,
    bonus: 500,
  }
];

export const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Budi Santoso',
    email: 'operator@eduevent.id',
    role: 'operator',
    active: true,
    city: 'Bone',
    passcode: 'op123',
  },
  {
    id: 'usr-2',
    name: 'Siti Aminah',
    email: 'admin@eduevent.id',
    role: 'admin',
    active: true,
    city: 'Makassar',
    passcode: 'ad123',
  },
  {
    id: 'usr-3',
    name: 'Dr. Hendra Wijaya',
    email: 'pimpinan@eduevent.id',
    role: 'pimpinan',
    active: true,
    city: 'Makassar',
    passcode: 'pim123',
  },
  {
    id: 'usr-4',
    name: 'Drs. H. Andi Syamsul, M.Si.',
    email: 'kadin.bone@eduevent.id',
    role: 'kadin',
    active: true,
    city: 'Bone',
    passcode: 'kad123',
  },
];

export const INITIAL_EVENTS = [
  {
    id: 'evt-101',
    schoolName: 'SMA Negeri 1 Bone',
    date: '2026-07-15',
    cityId: 'city-1',
    cityName: 'Bone',
    duration: '2 Hari',
    session: 'Hari-1',
    dapodikStudents: 450,
    participatingStudents: 380,
    operatorName: 'Budi Santoso',
    createdAt: '2026-07-15T09:30:00Z'
  },
  {
    id: 'evt-102',
    schoolName: 'SMA Negeri 1 Bone',
    date: '2026-07-16',
    cityId: 'city-1',
    cityName: 'Bone',
    duration: '2 Hari',
    session: 'Hari-2',
    dapodikStudents: 450,
    participatingStudents: 410,
    operatorName: 'Budi Santoso',
    createdAt: '2026-07-16T14:20:00Z'
  },
  {
    id: 'evt-103',
    schoolName: 'SMK Negeri 2 Parepare',
    date: '2026-07-18',
    cityId: 'city-2',
    cityName: 'Parepare',
    duration: '1 Hari',
    session: 'Fullday',
    dapodikStudents: 320,
    participatingStudents: 295,
    operatorName: 'Budi Santoso',
    createdAt: '2026-07-18T11:00:00Z'
  },
  {
    id: 'evt-104',
    schoolName: 'SMA Islam Athirah Makassar',
    date: '2026-07-20',
    cityId: 'city-3',
    cityName: 'Makassar',
    duration: '1 Hari',
    session: 'Fullday',
    dapodikStudents: 600,
    participatingStudents: 540,
    operatorName: 'Budi Santoso',
    createdAt: '2026-07-20T15:45:00Z'
  },
  {
    id: 'evt-105',
    schoolName: 'SMA Negeri 3 Palopo',
    date: '2026-07-21',
    cityId: 'city-4',
    cityName: 'Palopo',
    duration: '2 Hari',
    session: 'Hari-1',
    dapodikStudents: 280,
    participatingStudents: 230,
    operatorName: 'Budi Santoso',
    createdAt: '2026-07-21T10:15:00Z'
  },
  {
    id: 'evt-106',
    schoolName: 'SMA Negeri 1 Gowa',
    date: '2026-07-22',
    cityId: 'city-5',
    cityName: 'Gowa',
    duration: '1 Hari',
    session: 'Fullday',
    dapodikStudents: 500,
    participatingStudents: 465,
    operatorName: 'Budi Santoso',
    createdAt: '2026-07-22T13:00:00Z'
  }
];

export const INITIAL_FINANCIAL_TRANSACTIONS = [
  {
    id: 'fin-101',
    date: '2026-07-15',
    type: 'income',
    category: 'Tiket VR Siswa',
    title: 'Pemasukan Kegiatan VR SMA Negeri 1 Bone (Hari-1)',
    amount: 11400000, // 380 siswa * 30.000
    cityName: 'Bone',
    schoolName: 'SMA Negeri 1 Bone',
    refNo: 'INV-20260715-01',
    notes: 'Siswa berpartisipasi 380 siswa @ Rp 30.000',
    createdAt: '2026-07-15T12:00:00Z'
  },
  {
    id: 'fin-102',
    date: '2026-07-16',
    type: 'income',
    category: 'Tiket VR Siswa',
    title: 'Pemasukan Kegiatan VR SMA Negeri 1 Bone (Hari-2)',
    amount: 12300000, // 410 siswa * 30.000
    cityName: 'Bone',
    schoolName: 'SMA Negeri 1 Bone',
    refNo: 'INV-20260716-02',
    notes: 'Siswa berpartisipasi 410 siswa @ Rp 30.000',
    createdAt: '2026-07-16T15:00:00Z'
  },
  {
    id: 'fin-103',
    date: '2026-07-17',
    type: 'expense',
    category: 'Honor Operator & Pioneer',
    title: 'Pencairan Honor Event VR SMA Negeri 1 Bone',
    amount: 1185000, // Fee & Bonus Operator Budi Santoso
    cityName: 'Bone',
    schoolName: 'SMA Negeri 1 Bone',
    refNo: 'OUT-20260717-01',
    notes: 'Honor Budi Santoso (790 siswa x Rp 1.500)',
    createdAt: '2026-07-17T10:00:00Z'
  },
  {
    id: 'fin-104',
    date: '2026-07-18',
    type: 'income',
    category: 'Tiket VR Siswa',
    title: 'Pemasukan Kegiatan VR SMK Negeri 2 Parepare',
    amount: 8850000, // 295 siswa * 30.000
    cityName: 'Parepare',
    schoolName: 'SMK Negeri 2 Parepare',
    refNo: 'INV-20260718-03',
    notes: 'Siswa berpartisipasi 295 siswa @ Rp 30.000',
    createdAt: '2026-07-18T13:30:00Z'
  },
  {
    id: 'fin-105',
    date: '2026-07-19',
    type: 'expense',
    category: 'Operasional Event VR',
    title: 'Sewa Transportasi & Konsumsi Tim Lapangan Parepare',
    amount: 1450000,
    cityName: 'Parepare',
    schoolName: 'SMK Negeri 2 Parepare',
    refNo: 'OUT-20260719-02',
    notes: 'Bensin, konsumsi 3 personil operator & tim VR',
    createdAt: '2026-07-19T09:00:00Z'
  },
  {
    id: 'fin-106',
    date: '2026-07-20',
    type: 'income',
    category: 'Kerjasama Kemitraan Sekolah',
    title: 'Paket Kemitraan EduVR SMA Islam Athirah Makassar',
    amount: 18900000, // 540 siswa * 35.000
    cityName: 'Makassar',
    schoolName: 'SMA Islam Athirah Makassar',
    refNo: 'INV-20260720-04',
    notes: 'Modul Premium VR Konten Edukasi + Sertifikat',
    createdAt: '2026-07-20T16:00:00Z'
  },
  {
    id: 'fin-107',
    date: '2026-07-21',
    type: 'expense',
    category: 'Lisensi & Maintenance Hardware VR',
    title: 'Pembaruan Lisensi Software EduVR & Kalibrasi 10 Headset Meta Quest',
    amount: 4500000,
    cityName: 'Makassar',
    schoolName: 'Pusat Edutainment',
    refNo: 'OUT-20260721-03',
    notes: 'Perawatan rutin bulanan perangkat VR & lisensi konten 3D',
    createdAt: '2026-07-21T11:00:00Z'
  },
  {
    id: 'fin-108',
    date: '2026-07-22',
    type: 'income',
    category: 'Tiket VR Siswa',
    title: 'Pemasukan Kegiatan VR SMA Negeri 1 Gowa',
    amount: 13950000, // 465 siswa * 30.000
    cityName: 'Gowa',
    schoolName: 'SMA Negeri 1 Gowa',
    refNo: 'INV-20260722-05',
    notes: 'Siswa berpartisipasi 465 siswa @ Rp 30.000',
    createdAt: '2026-07-22T14:30:00Z'
  },
  {
    id: 'fin-109',
    date: '2026-07-23',
    type: 'income',
    category: 'Sponsorship & Donasi',
    title: 'Sponsorship CSR Telkomsel untuk Edukasi VR Sekolah',
    amount: 25000000,
    cityName: 'Makassar',
    schoolName: 'Pusat Edutainment',
    refNo: 'SP-20260723-01',
    notes: 'Dukungan program literasi teknologi sekolah daerah',
    createdAt: '2026-07-23T10:00:00Z'
  },
  {
    id: 'fin-110',
    date: '2026-07-24',
    type: 'expense',
    category: 'Pemasaran & Transportasi',
    title: 'Promosi & Biaya Sosialisasi Pioneer Sekolah Wilayah Palopo',
    amount: 2800000,
    cityName: 'Palopo',
    schoolName: 'SMA Negeri 3 Palopo',
    refNo: 'OUT-20260724-04',
    notes: 'Brosur, Banner, dan Akomodasi Tim Marketing Pioneer',
    createdAt: '2026-07-24T08:30:00Z'
  }
];

