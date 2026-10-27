-- ============================================================
-- SQL Update: Ubah Nama Kota "Kota Palu" -> "Kota Palu/Kab.Sigi"
-- Jalankan query ini di Supabase SQL Editor jika menggunakan database online
-- ============================================================

UPDATE cities 
SET name = 'Kota Palu/Kab.Sigi' 
WHERE id = 'city-palu' OR name = 'Kota Palu';
