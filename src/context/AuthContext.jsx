// @refresh reset
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCities,
  getUsers,
  getEvents,
  getActiveUser,
  setActiveUserSession,
  saveCity,
  deleteCity as removeCity,
  saveUser,
  deleteUser as removeUser,
  saveEvent,
  deleteEvent as removeEvent,
} from '../services/storageService';

import {
  sbGetCities,
  sbSaveCity,
  sbDeleteCity,
  sbGetUsers,
  sbSaveUser,
  sbDeleteUser,
  sbGetEvents,
  sbSaveEvent,
  sbDeleteEvent,
  subscribeToEvents,
} from '../services/supabaseService';

import { isSupabaseConfigured } from '../services/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]   = useState(null);
  const [users, setUsers]               = useState([]);
  const [cities, setCities]             = useState([]);
  const [events, setEvents]             = useState([]);
  const [toast, setToast]               = useState(null);
  const [kadinCity, setKadinCity]       = useState('Bone');

  // Supabase sync state
  const [isOnline, setIsOnline]         = useState(false);
  const [isSyncing, setIsSyncing]       = useState(false);
  const [dbMode, setDbMode]             = useState('local'); // 'supabase' | 'local'

  // ============================================================
  // AUTHENTICATION (LOGIN/LOGOUT)
  // ============================================================
  const login = (role, city, passcode) => {
    // Cari user yang cocok
    const user = users.find(u => {
      if (role === 'operator' || role === 'kadin') {
        return u.role === role && u.city === city && u.passcode === passcode;
      }
      return u.role === role && u.passcode === passcode;
    });

    if (user) {
      setCurrentUser(user);
      setActiveUserSession(user);
      if (user.city) setKadinCity(user.city);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('eduevent_active_user'); // Clear session
  };

  // ============================================================
  // TOAST
  // ============================================================
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ============================================================
  // REFRESH DATA (Hybrid: Supabase first → localStorage fallback)
  // ============================================================
  const refreshData = useCallback(async () => {
    setIsSyncing(true);

    if (isSupabaseConfigured) {
      try {
        const [loadedCities, loadedUsers, loadedEvents] = await Promise.all([
          sbGetCities(),
          sbGetUsers(),
          sbGetEvents(),
        ]);

        setCities(loadedCities);
        setUsers(loadedUsers);
        setEvents(loadedEvents);
        setIsOnline(true);
        setDbMode('supabase');

        // Sync ke localStorage sebagai cache offline
        localStorage.setItem('eduevent_cities', JSON.stringify(loadedCities));
        localStorage.setItem('eduevent_users', JSON.stringify(loadedUsers));
        localStorage.setItem('eduevent_events', JSON.stringify(loadedEvents));

        // Set active user if there is a session
        const loadedActiveUser = getActiveUser();
        if (loadedActiveUser) {
          setCurrentUser(loadedActiveUser);
          if (loadedActiveUser.city) {
            setKadinCity(loadedActiveUser.city);
          }
        }

        setIsSyncing(false);
        return;
      } catch (err) {
        console.warn('[EduEvent] Supabase tidak dapat dijangkau, beralih ke localStorage:', err.message);
        setIsOnline(false);
        setDbMode('local');
      }
    }

    // Fallback: gunakan localStorage
    const loadedUsers      = getUsers();
    const loadedCities     = getCities();
    const loadedEvents     = getEvents();
    const loadedActiveUser = getActiveUser();

    setUsers(loadedUsers);
    setCities(loadedCities);
    setEvents(loadedEvents);
    if (loadedActiveUser) {
      setCurrentUser(loadedActiveUser);
      if (loadedActiveUser.city) {
        setKadinCity(loadedActiveUser.city);
      }
    }
    setDbMode('local');
    setIsSyncing(false);
  }, []);

  // ============================================================
  // INITIAL LOAD + REALTIME SUBSCRIPTION
  // ============================================================
  useEffect(() => {
    refreshData();

    // Aktifkan Realtime hanya jika Supabase dikonfigurasi
    if (isSupabaseConfigured) {
      const unsubscribe = subscribeToEvents((newEvents) => {
        setEvents(newEvents);
        localStorage.setItem('eduevent_events', JSON.stringify(newEvents));
      });
      return unsubscribe;
    }
  }, [refreshData]);

  // ============================================================
  // ROLE SWITCHING
  // ============================================================
  const switchRole = (role, cityOverride) => {
    const userWithRole = users.find((u) => u.role === role) || {
      id: `mock-${role}`,
      name: role === 'kadin' ? 'Drs. H. Andi Syamsul, M.Si.' : `Pengguna ${role.toUpperCase()}`,
      email: `${role}@eduevent.id`,
      role: role,
      active: true,
      city: cityOverride || 'Bone',
    };
    setCurrentUser(userWithRole);
    if (role === 'kadin') {
      const city = cityOverride || userWithRole.city || 'Bone';
      setKadinCity(city);
    }
    setActiveUserSession(userWithRole);
    showToast(`Beralih ke peran: ${role === 'kadin' ? 'KEPALA DINAS' : role.toUpperCase()}`, 'info');
  };

  const switchUser = (userId) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setActiveUserSession(target);
      showToast(`Login sebagai ${target.name} (${target.role.toUpperCase()})`, 'info');
    }
  };

  // ============================================================
  // CITY HANDLERS (Hybrid CRUD)
  // ============================================================
  const handleSaveCity = async (cityData) => {
    try {
      if (dbMode === 'supabase') {
        const updated = await sbSaveCity(cityData);
        setCities(updated);
        localStorage.setItem('eduevent_cities', JSON.stringify(updated));
      } else {
        const updated = saveCity(cityData);
        setCities(updated);
      }
      showToast(cityData.id ? 'Kota berhasil diperbarui' : 'Kota baru berhasil ditambahkan');
    } catch (err) {
      console.error('[handleSaveCity]', err);
      showToast('Gagal menyimpan kota: ' + err.message, 'error');
    }
  };

  const handleDeleteCity = async (id) => {
    try {
      if (dbMode === 'supabase') {
        const updated = await sbDeleteCity(id);
        setCities(updated);
        localStorage.setItem('eduevent_cities', JSON.stringify(updated));
      } else {
        const updated = removeCity(id);
        setCities(updated);
      }
      showToast('Kota telah dihapus dari sistem', 'warning');
    } catch (err) {
      console.error('[handleDeleteCity]', err);
      showToast('Gagal menghapus kota: ' + err.message, 'error');
    }
  };

  // ============================================================
  // USER HANDLERS (Hybrid CRUD)
  // ============================================================
  const handleSaveUser = async (userData) => {
    try {
      if (dbMode === 'supabase') {
        const updated = await sbSaveUser(userData);
        setUsers(updated);
        localStorage.setItem('eduevent_users', JSON.stringify(updated));
      } else {
        const updated = saveUser(userData);
        setUsers(updated);
      }
      showToast(userData.id ? 'Data akun berhasil diperbarui' : 'Akun baru berhasil didaftarkan');
    } catch (err) {
      console.error('[handleSaveUser]', err);
      showToast('Gagal menyimpan akun: ' + err.message, 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      if (dbMode === 'supabase') {
        const updated = await sbDeleteUser(id);
        setUsers(updated);
        localStorage.setItem('eduevent_users', JSON.stringify(updated));
      } else {
        const updated = removeUser(id);
        setUsers(updated);
      }
      showToast('Akun telah dihapus', 'warning');
    } catch (err) {
      console.error('[handleDeleteUser]', err);
      showToast('Gagal menghapus akun: ' + err.message, 'error');
    }
  };

  // ============================================================
  // EVENT HANDLERS (Hybrid CRUD)
  // ============================================================
  const handleSaveEvent = async (eventData) => {
    try {
      if (dbMode === 'supabase') {
        const updated = await sbSaveEvent(eventData);
        setEvents(updated);
        localStorage.setItem('eduevent_events', JSON.stringify(updated));
      } else {
        const updated = saveEvent(eventData);
        setEvents(updated);
      }
      showToast(eventData.id ? 'Data kegiatan berhasil diperbarui' : 'Kegiatan VR baru berhasil dicatat!');
    } catch (err) {
      console.error('[handleSaveEvent]', err);
      showToast('Gagal menyimpan kegiatan: ' + err.message, 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      if (dbMode === 'supabase') {
        const updated = await sbDeleteEvent(id);
        setEvents(updated);
        localStorage.setItem('eduevent_events', JSON.stringify(updated));
      } else {
        const updated = removeEvent(id);
        setEvents(updated);
      }
      showToast('Data kegiatan berhasil dihapus', 'warning');
    } catch (err) {
      console.error('[handleDeleteEvent]', err);
      showToast('Gagal menghapus kegiatan: ' + err.message, 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        cities,
        events,
        toast,
        showToast,
        switchRole,
        switchUser,
        kadinCity,
        setKadinCity,
        handleSaveCity,
        handleDeleteCity,
        handleSaveUser,
        handleDeleteUser,
        handleSaveEvent,
        handleDeleteEvent,
        refreshData,
        // Sync / DB status
        isOnline,
        isSyncing,
        dbMode,
        isSupabaseConfigured,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook → diimpor dari './useAuth' (file terpisah untuk kompatibilitas Vite HMR)
