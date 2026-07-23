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
