/**
 * Konfigurasi Sumber Data Sekolah Excel & Normalisasi Wilayah
 */

export const REGION_EXCEL_MAP = {
  palu: '/Book1.xlsx',
  baubau: '/Book2.xlsx',
  sigi: '/Book3.xlsx',
  kabupatensigi: '/Book3.xlsx',
};

/**
 * Normalisasi nama wilayah agar variasi penulisan seperti
 * "Kota Palu", "Palu", "Kota Palu/Kab.Sigi", "Palu/Kab.Sigi", "Kota Bau-Bau", "BauBau", "Kabupaten Sigi", "Sigi" cocok secara presisi.
 */
export const normalizeRegion = (name = '') => {
  const clean = String(name || '')
    .toLowerCase()
    .replace(/^kota\s+/, '')
    .replace(/^kabupaten\s+/, '')
    .replace(/^kab\.?\s*/, '')
    .replace(/[\s\-_.]/g, '');

  if (
    clean === 'palu' ||
    clean.startsWith('palu/') ||
    (clean.includes('palu') && clean.includes('sigi'))
  ) {
    return 'palu';
  }

  return clean;
};

/**
 * Cek apakah dua nama kota mengacu pada wilayah yang sama.
 * Data lama yang kosong/null/undefined secara tegas dianggap milik 'palu' (legacy system default).
 */
export const isSameRegion = (cityA, cityB) => {
  const normA = normalizeRegion(cityA || 'palu');
  const normB = normalizeRegion(cityB || 'palu');
  return normA === normB;
};

/**
 * Dapatkan file Excel yang sesuai untuk wilayah tertentu.
 */
export const getExcelSourceForRegion = (regionName) => {
  const norm = normalizeRegion(regionName);
  return REGION_EXCEL_MAP[norm] || null;
};
