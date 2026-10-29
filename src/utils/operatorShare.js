// ============================================================
// Pembagian jumlah siswa untuk perhitungan fee Operator
// ============================================================
// Aturan:
//   - Penugasan "Full Team" (semua operator di kota) pada hari kegiatan →
//     jumlah siswa hari itu DIBAGI 2 karena terdapat 2 tim operasional di lapangan.
//     Setiap operator untuk masing-masing tim berhak atas porsi siswa hasil pembagian 2 tersebut.
//     Contoh: 359 siswa, Full Team (2 tim) → masing-masing 179,5 siswa.
//   - Penugasan "Partial" (operator spesifik) → operator yang ditugaskan
//     mendapat 100% jumlah siswa (tidak dibagi).
//   - Pioneer tidak terpengaruh (selalu 100%).

import { isSameRegion } from '../config/regionSchoolSources.js';

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
  const opAssignments = school.operatorAssignments || school.operator_assignments;
  if (Array.isArray(opAssignments) && opAssignments.length > 0) {
    const isDay2 = evt.session === 'Hari-2' || (school.eventDate2 && evt.date === school.eventDate2);
    const isDay3 = evt.session === 'Hari-3';
    const targetDay = isDay3 ? 3 : (isDay2 ? 2 : 1);
    const dayAssign = opAssignments.find(a => a.day === targetDay);
    if (dayAssign) {
      return {
        isFullTeam: Boolean(dayAssign.isFullTeam),
        operators: toIdList(dayAssign.operators),
      };
    }
  }

  const hasDay2 = Boolean(school.eventDate2 && String(school.eventDate2).trim() !== '');
  const isDay2 =
    hasDay2 &&
    (evt.date === school.eventDate2 || evt.session === 'Hari-2' || evt.session === 'Hari-3');
  const legacyAssigned = isDay2 ? school.assignedTo2 : school.assignedTo;
  const list = toIdList(legacyAssigned);
  return {
    isFullTeam: list.length === 0,
    operators: list,
  };
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

  const assignment = getAssignmentForEvent(evt, school);
  const assignedIds = assignment.operators;
  const isFullTeam = assignment.isFullTeam;

  // Jika penugasan memiliki daftar operator dari Pioneer (baik Partial maupun Full Team),
  // operator harus terdaftar di dalamnya agar berhak mendapatkan fee/siswa kegiatan ini.
  if (assignedIds.length > 0) {
    if (!assignedIds.includes(user.id)) {
      return { ...full, eligible: false, students: 0 };
    }
  } else if (!isFullTeam) {
    // Partial tapi daftar kosong → tidak ada yang berhak
    return { ...full, eligible: false, students: 0 };
  }

  if (!isFullTeam) {
    // Partial: hanya operator terpilih, masing-masing 100%
    return full;
  }

  // Full Team: dibagi 2 karena terdapat 2 tim operasional di lapangan.
  // Setiap operator untuk masing-masing tim berhak atas porsi siswa hasil pembagian 2 tersebut.
  const cityOperators = (users || []).filter(
    (u) => u.role === 'operator' && isSameRegion(u.city, evt.cityName)
  );
  const divisor = cityOperators.length === 1 ? 1 : 2;

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
