import { createClient } from '@supabase/supabase-js';

// ============================================================
// Supabase Client Singleton
// Env vars diisi dari file .env (salin dari .env.example)
// Jika tidak ada env → mode offline (localStorage only)
// ============================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validasi: hanya buat client jika env tersedia & valid
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-public-key-here';

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Tidak pakai Supabase Auth (pakai RBAC custom via users table)
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Apakah Supabase dikonfigurasi & tersedia?
 * Digunakan oleh komponen UI untuk menampilkan status koneksi.
 */
export const isSupabaseConfigured = isConfigured;
