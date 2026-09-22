/**
 * useSchoolData.js
 * Hook untuk membaca data sekolah dari file Excel di /public/Book1.xlsx
 * menggunakan SheetJS (xlsx).
 * 
 * Return: { schoolData, loading, error }
 * schoolData = [{ schoolName, kecamatan }, ...]
 */

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

// Normalisasi nama kecamatan dari Excel ke format dropdown
const KECAMATAN_MAP = {
  'PALU BARAT': 'Palu Barat',
  'ULUJADI': 'Ulujadi',
  'PALU SELATAN': 'Palu Selatan',
  'PALU TIMUR': 'Palu Timur',
  'PALU UTARA': 'Palu Utara',
  'MANTIKULORE': 'Montikulore',
  'TATANGA': 'Tatanga',
  'TAWAELI': 'Tawaeli',
};

export const useSchoolData = () => {
  const [schoolData, setSchoolData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        setLoading(true);
        const response = await fetch('/Book1.xlsx');
        if (!response.ok) throw new Error('File Excel tidak ditemukan');

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row (index 0), parse dari baris 1
        const parsed = rawData
          .slice(1)
          .filter(row => row[0] && row[1])
          .map(row => ({
            schoolName: String(row[0]).trim(),
            kecamatan: KECAMATAN_MAP[String(row[1]).trim().toUpperCase()] || String(row[1]).trim(),
          }));

        setSchoolData(parsed);
        setError(null);
      } catch (err) {
        console.error('[useSchoolData] Gagal membaca Excel:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadExcel();
  }, []);

  return { schoolData, loading, error };
};
