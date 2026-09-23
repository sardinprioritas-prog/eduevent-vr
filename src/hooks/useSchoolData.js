/**
 * useSchoolData.js
 * Hook untuk membaca data sekolah dari /public/schoolData.json
 * yang telah di-generate dari file Excel (Book1.xlsx).
 *
 * Return: { schoolData, loading, error }
 * schoolData = [{ schoolName, kecamatan, jumlahSiswa }, ...]
 */

import { useState, useEffect } from 'react';

export const useSchoolData = () => {
  const [schoolData, setSchoolData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/schoolData.json');
        if (!response.ok) throw new Error('File data sekolah tidak ditemukan');
        const data = await response.json();
        setSchoolData(data);
        setError(null);
      } catch (err) {
        console.error('[useSchoolData] Gagal memuat data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { schoolData, loading, error };
};
