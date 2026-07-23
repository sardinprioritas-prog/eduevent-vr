import { INITIAL_CITIES, INITIAL_USERS, INITIAL_EVENTS, INITIAL_SCHOOLS, INITIAL_SALARY_SETTINGS } from '../data/mockData';

const KEYS = {
  CITIES: 'eduevent_cities',
  USERS: 'eduevent_users',
  EVENTS: 'eduevent_events',
  SCHOOLS: 'eduevent_schools',
  SALARY_SETTINGS: 'eduevent_salary_settings',
  ACTIVE_USER: 'eduevent_active_user',
};

// Initialize Storage if empty
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.CITIES)) {
    localStorage.setItem(KEYS.CITIES, JSON.stringify(INITIAL_CITIES));
  }
  let existingUsers = localStorage.getItem(KEYS.USERS);
  if (!existingUsers) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  } else {
    // Migration: jika user belum punya passcode (dari versi sebelumnya), reset ke INITIAL_USERS
    const parsed = JSON.parse(existingUsers);
    if (parsed.length > 0 && parsed[0].passcode === undefined) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
  }
  if (!localStorage.getItem(KEYS.EVENTS)) {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
  }
  if (!localStorage.getItem(KEYS.SCHOOLS)) {
    localStorage.setItem(KEYS.SCHOOLS, JSON.stringify(INITIAL_SCHOOLS));
  }
  if (!localStorage.getItem(KEYS.SALARY_SETTINGS)) {
    localStorage.setItem(KEYS.SALARY_SETTINGS, JSON.stringify(INITIAL_SALARY_SETTINGS));
  }
};

// Cities API
export const getCities = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(KEYS.CITIES) || '[]');
};

export const saveCity = (city) => {
  const cities = getCities();
  let updated;
  if (city.id) {
    updated = cities.map((c) => (c.id === city.id ? { ...c, ...city } : c));
  } else {
    const newCity = {
      ...city,
      id: `city-${Date.now()}`,
      active: true,
    };
    updated = [newCity, ...cities];
  }
  localStorage.setItem(KEYS.CITIES, JSON.stringify(updated));
  return updated;
};

export const deleteCity = (id) => {
  const cities = getCities();
  const updated = cities.filter((c) => c.id !== id);
  localStorage.setItem(KEYS.CITIES, JSON.stringify(updated));
  return updated;
};

// Users API
export const getUsers = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
};

export const saveUser = (user) => {
  const users = getUsers();
  let updated;
  if (user.id) {
    updated = users.map((u) => (u.id === user.id ? { ...u, ...user } : u));
  } else {
    const newUser = {
      ...user,
      id: `usr-${Date.now()}`,
      active: true,
    };
    updated = [newUser, ...users];
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
  return updated;
};

export const deleteUser = (id) => {
  const users = getUsers();
  const updated = users.filter((u) => u.id !== id);
  localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
  return updated;
};

// Events API
export const getEvents = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(KEYS.EVENTS) || '[]');
};

export const saveEvent = (eventData) => {
  const events = getEvents();
  const existingIndex = events.findIndex((e) => e.id === eventData.id);

  let updated;
  if (existingIndex >= 0) {
    updated = events.map((e, idx) => (idx === existingIndex ? { ...e, ...eventData } : e));
  } else {
    updated = [{ ...eventData, id: `evt-${Date.now()}`, createdAt: new Date().toISOString() }, ...events];
  }
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(updated));
  return updated;
};

export const deleteEvent = (id) => {
  const events = getEvents();
  const updated = events.filter((e) => e.id !== id);
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(updated));
  return updated;
};

// Schools API
export const getSchools = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(KEYS.SCHOOLS) || '[]');
};

export const saveSchool = (school) => {
  const schools = getSchools();
  let updated;
  if (school.id) {
    updated = schools.map((s) => (s.id === school.id ? { ...s, ...school } : s));
  } else {
    const newSchool = {
      ...school,
      id: `sch-${Date.now()}`,
      active: true,
    };
    updated = [newSchool, ...schools];
  }
  localStorage.setItem(KEYS.SCHOOLS, JSON.stringify(updated));
  return updated;
};

export const deleteSchool = (id) => {
  const schools = getSchools();
  const updated = schools.filter((s) => s.id !== id);
  localStorage.setItem(KEYS.SCHOOLS, JSON.stringify(updated));
  return updated;
};

// Active User Session API
export const getActiveUser = () => {
  initStorage();
  const data = localStorage.getItem(KEYS.ACTIVE_USER);
  return data ? JSON.parse(data) : null;
};

export const setActiveUserSession = (user) => {
  if (user) {
    localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.ACTIVE_USER);
  }
};

// Salary Settings API
export const getSalarySettings = () => {
  initStorage();
  const data = localStorage.getItem(KEYS.SALARY_SETTINGS);
  return data ? JSON.parse(data) : INITIAL_SALARY_SETTINGS;
};

export const saveSalarySettings = (settings) => {
  localStorage.setItem(KEYS.SALARY_SETTINGS, JSON.stringify(settings));
  return settings;
};
