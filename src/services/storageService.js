import { INITIAL_CITIES, INITIAL_USERS, INITIAL_EVENTS } from '../data/mockData';

const KEYS = {
  CITIES: 'eduevent_cities',
  USERS: 'eduevent_users',
  EVENTS: 'eduevent_events',
  ACTIVE_USER: 'eduevent_active_user',
};

// Initialize Storage if empty
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.CITIES)) {
    localStorage.setItem(KEYS.CITIES, JSON.stringify(INITIAL_CITIES));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.EVENTS)) {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
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

export const saveEvent = (event) => {
  const events = getEvents();
  let updated;
  if (event.id) {
    updated = events.map((e) => (e.id === event.id ? { ...e, ...event } : e));
  } else {
    const newEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updated = [newEvent, ...events];
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

// Active User Session API
export const getActiveUser = () => {
  initStorage();
  return JSON.parse(localStorage.getItem(KEYS.ACTIVE_USER) || 'null');
};

export const setActiveUserSession = (user) => {
  localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(user));
  return user;
};
