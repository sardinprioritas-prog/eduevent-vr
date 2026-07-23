/**
 * supabaseService.js
 * ============================================================
 * Semua operasi CRUD ke Supabase PostgreSQL.
 * Setiap fungsi mengembalikan data yang sama dengan storageService
 * sehingga AuthContext bisa beralih antara keduanya secara transparan.
 *
 * Konvensi nama kolom: Supabase menggunakan snake_case (school_name),
 * app menggunakan camelCase (schoolName). Transformasi terjadi di sini.
 * ============================================================
 */

import { supabase } from './supabaseClient';

// ============================================================
// HELPERS: Transformasi snake_case ↔ camelCase
// ============================================================

/**
 * Ubah row dari Supabase (snake_case) → format app (camelCase)
 */
const toAppCity = (row) => ({
  id: row.id,
  name: row.name,
  province: row.province,
  active: row.active,
  createdAt: row.created_at,
});

const toAppUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  city: row.city,
  passcode: row.passcode,
  active: row.active,
  createdAt: row.created_at,
});

const toAppSchool = (row) => ({
  id: row.id,
  cityId: row.city_id,
  name: row.name,
  studentCount: row.student_count,
  demoDate: row.demo_date,
  eventDate: row.event_date,
  active: row.active,
  createdAt: row.created_at,
});

const toAppSalarySettings = (row) => ({
  userId: row.user_id,
  fee: row.fee,
  bonus: row.bonus,
  updatedAt: row.updated_at,
});

const toAppEvent = (row) => ({
  id: row.id,
  schoolName: row.school_name,
  date: row.date,
  cityId: row.city_id,
  cityName: row.city_name,
  duration: row.duration,
  session: row.session,
  dapodikStudents: row.dapodik_students,
  participatingStudents: row.participating_students,
  operatorName: row.operator_name,
  createdAt: row.created_at,
});

/**
 * Ubah format app (camelCase) → Supabase row (snake_case)
 */
const toDbSchool = (sch) => ({
  id: sch.id,
  city_id: sch.cityId,
  name: sch.name,
  student_count: sch.studentCount,
  demo_date: sch.demoDate,
  event_date: sch.eventDate,
  active: sch.active,
});

const toDbSalarySettings = (settings) => ({
  user_id: settings.userId,
  fee: settings.fee,
  bonus: settings.bonus,
  updated_at: new Date().toISOString(),
});

const toDbEvent = (evt) => ({
  id: evt.id,
  school_name: evt.schoolName,
  date: evt.date,
  city_id: evt.cityId || null,
  city_name: evt.cityName,
  duration: evt.duration,
  session: evt.session,
  dapodik_students: evt.dapodikStudents,
  participating_students: evt.participatingStudents,
  operator_name: evt.operatorName,
});

const toDbUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  city: u.city,
  passcode: u.passcode,
  active: u.active !== false,
});

const toDbCity = (c) => ({
  id: c.id,
  name: c.name,
  province: c.province || 'Sulawesi Selatan',
  active: c.active !== false,
});

// ============================================================
// CITIES API
// ============================================================

export const sbGetCities = async () => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data.map(toAppCity);
};

export const sbSaveCity = async (city) => {
  if (city.id) {
    // UPDATE
    const { error } = await supabase
      .from('cities')
      .update(toDbCity(city))
      .eq('id', city.id);
    if (error) throw error;
  } else {
    // INSERT — generate ID di sisi klien agar konsisten dengan localStorage
    const newId = `city-${Date.now()}`;
    const { error } = await supabase
      .from('cities')
      .insert({ ...toDbCity(city), id: newId });
    if (error) throw error;
  }
  // Kembalikan list terbaru
  return sbGetCities();
};

export const sbDeleteCity = async (id) => {
  const { error } = await supabase.from('cities').delete().eq('id', id);
  if (error) throw error;
  return sbGetCities();
};

// ============================================================
// USERS API
// ============================================================

export const sbGetUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data.map(toAppUser);
};

export const sbSaveUser = async (user) => {
  if (user.id) {
    const { error } = await supabase
      .from('users')
      .update(toDbUser(user))
      .eq('id', user.id);
    if (error) throw error;
  } else {
    const newId = `usr-${Date.now()}`;
    const { error } = await supabase
      .from('users')
      .insert({ ...toDbUser(user), id: newId });
    if (error) throw error;
  }
  return sbGetUsers();
};

export const sbDeleteUser = async (id) => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
  return sbGetUsers();
};

// ============================================================
// EVENTS API
// ============================================================

export const sbGetEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data.map(toAppEvent);
};

export const sbSaveEvent = async (event) => {
  if (event.id) {
    const { error } = await supabase
      .from('events')
      .update(toDbEvent(event))
      .eq('id', event.id);
    if (error) throw error;
  } else {
    const newId = `evt-${Date.now()}`;
    const { error } = await supabase
      .from('events')
      .insert({ ...toDbEvent(event), id: newId });
    if (error) throw error;
  }
  return sbGetEvents();
};

export const sbDeleteEvent = async (id) => {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
  return sbGetEvents();
};

// ============================================================
// SCHOOLS API
// ============================================================
export const sbGetSchools = async () => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(toAppSchool);
};

export const sbSaveSchool = async (school) => {
  const dbData = toDbSchool(school);
  if (!school.id) {
    dbData.id = `sch-${Date.now()}`;
  }
  const { data, error } = await supabase
    .from('schools')
    .upsert(dbData, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return toAppSchool(data);
};

export const sbDeleteSchool = async (id) => {
  const { error } = await supabase.from('schools').delete().eq('id', id);
  if (error) throw error;
  return id;
};

// ============================================================
// SALARY SETTINGS API
// ============================================================
export const sbGetSalarySettings = async () => {
  const { data, error } = await supabase
    .from('user_salary_settings')
    .select('*');
  
  if (error) throw error;
  return data.map(toAppSalarySettings);
};

export const sbSaveSalarySettings = async (settings) => {
  const dbData = toDbSalarySettings(settings);
  const { data, error } = await supabase
    .from('user_salary_settings')
    .upsert(dbData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return toAppSalarySettings(data);
};

// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

/**
 * Berlangganan perubahan realtime pada tabel events.
 * callback(newEvents) dipanggil setiap ada INSERT/UPDATE/DELETE.
 * Mengembalikan fungsi unsubscribe.
 */
export const subscribeToEvents = (callback) => {
  const channel = supabase
    .channel('events-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events' },
      async () => {
        // Re-fetch semua data setiap ada perubahan
        try {
          const events = await sbGetEvents();
          callback(events);
        } catch (err) {
          console.warn('[Supabase Realtime] Gagal refresh events:', err);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
};
