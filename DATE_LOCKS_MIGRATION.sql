-- ============================================================
-- EduEvent VR - Migration: Date Locks (Akses Keamanan Tanggal)
-- Jalankan script ini di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- TABLE: date_locks
-- Admin dapat mengunci tanggal tertentu sehingga hanya 1 sekolah
-- yang diizinkan dapat memilih tanggal tersebut.
-- Jika school_name IS NULL → tanggal dikunci penuh (tidak ada sekolah manapun)
-- Jika school_name diisi  → tanggal eksklusif untuk sekolah tersebut
-- ============================================================
CREATE TABLE IF NOT EXISTS date_locks (
  id           TEXT PRIMARY KEY DEFAULT ('dlk-' || floor(extract(epoch from now()) * 1000)::text),
  day          INTEGER NOT NULL CHECK (day >= 1 AND day <= 31),
  month        INTEGER NOT NULL DEFAULT 10 CHECK (month >= 1 AND month <= 12),
  year         INTEGER NOT NULL DEFAULT 2026,
  school_name  TEXT,     -- Nama sekolah yang DIIZINKAN (NULL = dikunci total)
  reg_id       TEXT,     -- Referensi ke school_registrations.id (opsional)
  note         TEXT,     -- Catatan admin
  locked_by    TEXT,     -- user_id admin yang mengunci
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (day, month, year)  -- Satu tanggal hanya bisa ada 1 kunci
);

-- Index untuk query cepat berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_date_locks_day   ON date_locks(day);
CREATE INDEX IF NOT EXISTS idx_date_locks_date  ON date_locks(year, month, day);

-- RLS
ALTER TABLE date_locks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all date_locks" ON date_locks;
CREATE POLICY "Allow all date_locks" ON date_locks FOR ALL USING (true);

-- ============================================================
-- SELESAI! Tabel date_locks siap digunakan.
-- ============================================================
