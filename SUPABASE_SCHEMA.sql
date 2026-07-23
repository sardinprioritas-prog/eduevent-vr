-- ============================================================
-- EduEvent VR Monitoring System - Supabase PostgreSQL Schema
-- Jalankan script ini di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. TABLE: cities (Master Data Wilayah)
-- ============================================================
CREATE TABLE IF NOT EXISTS cities (
  id          TEXT PRIMARY KEY DEFAULT ('city-' || floor(extract(epoch from now()) * 1000)::text),
  name        TEXT NOT NULL,
  province    TEXT NOT NULL DEFAULT 'Sulawesi Selatan',
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABLE: users (Pengguna & Akses RBAC)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT ('usr-' || floor(extract(epoch from now()) * 1000)::text),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'operator'
                CHECK (role IN ('operator', 'admin', 'pimpinan', 'kadin')),
  city        TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABLE: events (Data Kegiatan VR)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id                    TEXT PRIMARY KEY DEFAULT ('evt-' || floor(extract(epoch from now()) * 1000)::text),
  school_name           TEXT NOT NULL,
  date                  DATE NOT NULL,
  city_id               TEXT REFERENCES cities(id) ON DELETE SET NULL,
  city_name             TEXT NOT NULL,
  duration              TEXT NOT NULL DEFAULT '1 Hari',
  session               TEXT NOT NULL DEFAULT 'Fullday',
  dapodik_students      INTEGER NOT NULL DEFAULT 0 CHECK (dapodik_students >= 0),
  participating_students INTEGER NOT NULL DEFAULT 0 CHECK (participating_students >= 0),
  operator_name         TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Menggunakan anon key → policy terbuka untuk MVP
-- Bisa dikunci lebih ketat saat production dengan Supabase Auth
-- ============================================================
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies jika re-run
DROP POLICY IF EXISTS "Allow all cities"  ON cities;
DROP POLICY IF EXISTS "Allow all users"   ON users;
DROP POLICY IF EXISTS "Allow all events"  ON events;

-- Buka akses penuh via anon key (gunakan untuk MVP/demo)
CREATE POLICY "Allow all cities"  ON cities  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all users"   ON users   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all events"  ON events  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA AWAL (Data Contoh Sulawesi Selatan)
-- ============================================================
INSERT INTO cities (id, name, province, active) VALUES
  ('city-1', 'Bone',     'Sulawesi Selatan', true),
  ('city-2', 'Parepare', 'Sulawesi Selatan', true),
  ('city-3', 'Makassar', 'Sulawesi Selatan', true),
  ('city-4', 'Palopo',   'Sulawesi Selatan', true),
  ('city-5', 'Gowa',     'Sulawesi Selatan', true),
  ('city-6', 'Maros',    'Sulawesi Selatan', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, role, city, active) VALUES
  ('usr-1', 'Budi Santoso',             'operator@eduevent.id',       'operator', 'Bone',     true),
  ('usr-2', 'Siti Aminah',              'admin@eduevent.id',          'admin',    'Makassar', true),
  ('usr-3', 'Dr. Hendra Wijaya',        'pimpinan@eduevent.id',       'pimpinan', 'Makassar', true),
  ('usr-4', 'Drs. H. Andi Syamsul, M.Si.', 'kadin.bone@eduevent.id', 'kadin',    'Bone',     true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, school_name, date, city_id, city_name, duration, session, dapodik_students, participating_students, operator_name) VALUES
  ('evt-101', 'SMA Negeri 1 Bone',        '2026-07-15', 'city-1', 'Bone',     '2 Hari', 'Hari-1',  450, 380, 'Budi Santoso'),
  ('evt-102', 'SMA Negeri 1 Bone',        '2026-07-16', 'city-1', 'Bone',     '2 Hari', 'Hari-2',  450, 410, 'Budi Santoso'),
  ('evt-103', 'SMK Negeri 2 Parepare',    '2026-07-18', 'city-2', 'Parepare', '1 Hari', 'Fullday', 320, 295, 'Budi Santoso'),
  ('evt-104', 'SMA Islam Athirah Makassar','2026-07-20', 'city-3', 'Makassar', '1 Hari', 'Fullday', 600, 540, 'Budi Santoso'),
  ('evt-105', 'SMA Negeri 3 Palopo',      '2026-07-21', 'city-4', 'Palopo',   '2 Hari', 'Hari-1',  280, 230, 'Budi Santoso'),
  ('evt-106', 'SMA Negeri 1 Gowa',        '2026-07-22', 'city-5', 'Gowa',     '1 Hari', 'Fullday', 500, 465, 'Budi Santoso')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INDEXES untuk performa query
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_city_name ON events(city_name);
CREATE INDEX IF NOT EXISTS idx_events_date      ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_city_id   ON events(city_id);
CREATE INDEX IF NOT EXISTS idx_users_role       ON users(role);

-- ============================================================
-- SELESAI! Cek tabel di: Table Editor (sidebar kiri Supabase)
-- ============================================================
