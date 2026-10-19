// ============================================================
// Pembagian jumlah siswa untuk perhitungan fee Operator
// ============================================================
// Aturan:
//   - Penugasan "Full Team" (semua operator di kota) pada hari kegiatan →
//     jumlah siswa hari itu DIBAGI RATA dengan jumlah operator di kota tersebut.
//     Contoh: 300 siswa, 2 operator → masing-masing 150 siswa.
//   - Penugasan "Partial" (operator spesifik) → operator yang ditugaskan
//     mendapat 100% jumlah siswa (tidak dibagi).
//   - Pioneer tidak terpengaruh (selalu 100%).

const norm = (v) => (v || '').toString().trim().toLowerCase();

const toIdList = (assigned) => {
  if (!assigned) return [];
  return Array.isArray(assigned) ? assigned : [assigned];
};

/** Cari data target sekolah untuk sebuah event (berdasarkan nama sekolah). */
export const findSchoolForEvent = (evt, schools) =>
  (schools || []).find((s) => norm(s.name) === norm(evt.schoolName));

/**
 * Tentukan penugasan (assignedTo / assignedTo2) yang berlaku untuk event ini.
 * Hari ke-2 dipakai jika sekolah punya eventDate2 dan event tersebut adalah
 * sesi Hari-2 / Hari-3 atau tanggalnya sama dengan eventDate2.
 */
const getAssignmentForEvent = (evt, school) => {
  const hasDay2 = Boolean(school.eventDate2 && String(school.eventDate2).trim() !== '');
  const isDay2 =
    hasDay2 &&
    (evt.date === school.eventDate2 || evt.session === 'Hari-2' || evt.session === 'Hari-3');
  return isDay2 ? school.assignedTo2 : school.assignedTo;
};

/**
 * Hitung porsi siswa milik `user` untuk satu event.
 * @returns {{ eligible: boolean, students: number, totalStudents: number, isFullTeam: boolean, divisor: number }}
 */
export const getOperatorShare = (evt, user, { schools, users }) => {
  const totalStudents = parseInt(evt.participatingStudents, 10) || 0;
  const full = { eligible: true, students: totalStudents, totalStudents, isFullTeam: false, divisor: 1 };

  if (user?.role !== 'operator') return full;

  const school = findSchoolForEvent(evt, schools);

  // Sekolah tidak ada di target → hanya operator penginput yang mendapat fee (100%)
  if (!school) {
    const isInputter = norm(evt.operatorName) === norm(user.name);
    return isInputter ? full : { ...full, eligible: false, students: 0 };
  }

  const assignedIds = toIdList(getAssignmentForEvent(evt, school));
  const isFullTeam = assignedIds.length === 0;

  if (!isFullTeam) {
    // Partial: hanya operator terpilih, masing-masing 100%
    return assignedIds.includes(user.id) ? full : { ...full, eligible: false, students: 0 };
  }

  // Full Team: bagi rata dengan jumlah operator di kota event
  const cityOperators = (users || []).filter(
    (u) => u.role === 'operator' && norm(u.city) === norm(evt.cityName)
  );
  const divisor = Math.max(cityOperators.length, 1);

  return {
    eligible: true,
    students: totalStudents / divisor,
    totalStudents,
    isFullTeam: true,
    divisor,
  };
};

/** Format angka siswa (mendukung pecahan .5 hasil pembagian). */
export const formatStudents = (n) =>
  Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });
