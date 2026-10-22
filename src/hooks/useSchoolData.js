/**
 * useSchoolData.js
 * Hook untuk membaca data sekolah & kecamatan berdasarkan wilayah:
 * - Palu  -> /Book1.xlsx
 * - BauBau -> /Book2.xlsx
 * - Fallback / backward-compat: /schoolData.json (jika regionName tidak diberikan)
 *
 * Return: { schoolData, kecamatanList, loading, error, hasSource }
 */

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { getExcelSourceForRegion } from '../config/regionSchoolSources';

// In-memory cache agar file Excel tidak perlu di-download & di-parse berulang kali
const memoryCache = new Map();

export const useSchoolData = (regionName) => {
  const [schoolData, setSchoolData] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSource, setHasSource] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Kasus 1: Region Name tidak diberikan -> gunakan schoolData.json default
        if (!regionName) {
          const cacheKey = '__default_json__';
          if (memoryCache.has(cacheKey)) {
            const cached = memoryCache.get(cacheKey);
            if (!isCancelled) {
              setSchoolData(cached.schools);
              setKecamatanList(cached.kecamatans);
              setHasSource(true);
              setLoading(false);
            }
            return;
          }

          const response = await fetch('/schoolData.json');
          if (!response.ok) throw new Error('File data sekolah default tidak ditemukan');
          const data = await response.json();
          const kecs = Array.from(
            new Set(data.map((s) => (s.kecamatan || '').trim().toUpperCase()).filter(Boolean))
          ).sort();

          memoryCache.set(cacheKey, { schools: data, kecamatans: kecs });
          if (!isCancelled) {
            setSchoolData(data);
            setKecamatanList(kecs);
            setHasSource(true);
          }
          return;
        }

        // Kasus 2: Ada regionName -> cari file Excel yang dikonfigurasi
        const excelPath = getExcelSourceForRegion(regionName);

        if (!excelPath) {
          // Wilayah belum memiliki file Excel yang terdaftar
          if (!isCancelled) {
            setSchoolData([]);
            setKecamatanList([]);
            setHasSource(false);
            setLoading(false);
          }
          return;
        }

        if (memoryCache.has(excelPath)) {
          const cached = memoryCache.get(excelPath);
          if (!isCancelled) {
            setSchoolData(cached.schools);
            setKecamatanList(cached.kecamatans);
            setHasSource(true);
            setLoading(false);
          }
          return;
        }

        const res = await fetch(excelPath, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Gagal memuat berkas Excel untuk ${regionName} (${excelPath})`);

        const arrayBuffer = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsedSchools = rows
          .map((row) => {
            const schoolName =
              row['Nama Sekolah'] ||
              row['NAMA SEKOLAH'] ||
              row['Sekolah'] ||
              row['Nama'] ||
              '';

            const rawKec =
              row['Kecamatan'] ||
              row['KECAMATAN'] ||
              row['Kec.'] ||
              row['Kec'] ||
              '';

            const rawCount =
              row['Jumlah'] ||
              row['Jumlah Siswa'] ||
              row['PD'] ||
              row['Peserta Didik'] ||
              row['JML SISWA'] ||
              row['Total'] ||
              0;

            const jumlahSiswa = parseInt(String(rawCount).replace(/[^0-9]/g, ''), 10) || 0;
            const kecamatan = String(rawKec).trim().toUpperCase();

            return {
              schoolName: String(schoolName).trim(),
              kecamatan,
              jumlahSiswa,
            };
          })
          .filter((item) => item.schoolName.length > 0);

        const kecs = Array.from(
          new Set(parsedSchools.map((s) => s.kecamatan).filter(Boolean))
        ).sort();

        memoryCache.set(excelPath, { schools: parsedSchools, kecamatans: kecs });

        if (!isCancelled) {
          setSchoolData(parsedSchools);
          setKecamatanList(kecs);
          setHasSource(true);
        }
      } catch (err) {
        console.error('[useSchoolData] Error loading school data:', err);
        if (!isCancelled) {
          setError(err.message);
          setSchoolData([]);
          setKecamatanList([]);
          setHasSource(false);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [regionName]);

  return { schoolData, kecamatanList, loading, error, hasSource };
};
