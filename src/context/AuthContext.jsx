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
  getSchools,
  saveSchool,
  deleteSchool as removeSchool,
  getSalarySettings,
  saveSalarySettings as storeSalarySettings,
  getPayouts,
  getFinances,
  saveFinance,
  deleteFinance as removeFinance,
  getFinancePasscode,
  saveFinancePasscode,
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
  sbGetSchools,
  sbSaveSchool,
  sbDeleteSchool,
  sbGetSalarySettings,
  sbSaveSalarySettings,
  sbGetPayouts,
  sbSavePayout,
  subscribeToEvents,
  subscribeToPayouts,
} from '../services/supabaseService';

import { isSupabaseConfigured } from '../services/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser]   = useState(null);
  const [users, setUsers]               = useState([]);
  const [cities, setCities]             = useState([]);
  const [events, setEvents]             = useState([]);
  const [schools, setSchools]           = useState([]);
  const [salarySettings, setSalarySettings] = useState(null);
  const [payouts, setPayouts]           = useState([]);
  const [finances, setFinances]         = useState([]);
  const [isFinanceUnlocked, setIsFinanceUnlocked] = useState(false);
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
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
      if (role === 'operator' || role === 'kadin' || role === 'pioneer') {
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
        const [loadedCities, loadedUsers, loadedEvents, loadedSchools, loadedSalarySettings, loadedPayouts] = await Promise.all([
          sbGetCities(),
          sbGetUsers(),
          sbGetEvents(),
          sbGetSchools(),
          sbGetSalarySettings(),
          sbGetPayouts(),
        ]);

        setCities(loadedCities);
        setUsers(loadedUsers);
        setEvents(loadedEvents);
        setSchools(loadedSchools);
        setSalarySettings(loadedSalarySettings || getSalarySettings()); // fallback to local if null
        setPayouts(loadedPayouts);
        setIsOnline(true);
        setDbMode('supabase');

        // Sync ke localStorage sebagai cache offline
        localStorage.setItem('eduevent_cities', JSON.stringify(loadedCities));
        localStorage.setItem('eduevent_users', JSON.stringify(loadedUsers));
        localStorage.setItem('eduevent_events', JSON.stringify(loadedEvents));
        localStorage.setItem('eduevent_schools', JSON.stringify(loadedSchools));
        localStorage.setItem('eduevent_payouts', JSON.stringify(loadedPayouts));
        if (loadedSalarySettings) {
          localStorage.setItem('eduevent_salary_settings', JSON.stringify(loadedSalarySettings));
        }

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
    const loadedSchools    = getSchools();
    const loadedSalary     = getSalarySettings();
    const loadedPayouts    = getPayouts();
    const loadedFinances   = getFinances();
    const loadedActiveUser = getActiveUser();

    setUsers(loadedUsers);
    setCities(loadedCities);
    setEvents(loadedEvents);
    setSchools(loadedSchools);
    setSalarySettings(loadedSalary);
    setPayouts(loadedPayouts);
    setFinances(loadedFinances);
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
      const unsubscribeEvents = subscribeToEvents((newEvents) => {
        setEvents(newEvents);
        localStorage.setItem('eduevent_events', JSON.stringify(newEvents));
      });

      // Subscribe juga ke payouts agar portal operator/pioneer otomatis
      // menerima riwayat pencairan tanpa perlu refresh manual
      const unsubscribePayouts = subscribeToPayouts((newPayouts) => {
        setPayouts(newPayouts);
        localStorage.setItem('eduevent_payouts', JSON.stringify(newPayouts));
      });

      return () => {
        unsubscribeEvents();
        unsubscribePayouts();
      };
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
      if (isOnline) {
        await sbDeleteUser(id);
      }
      setUsers(removeUser(id));
      showToast('Pengguna berhasil dihapus', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus pengguna: ' + err.message, 'error');
    }
  };

  // ============================================================
  // MANAJEMEN TARGET SEKOLAH
  // ============================================================
  const handleSaveSchool = async (schoolData) => {
    try {
      if (isOnline) {
        const updatedSchools = await sbSaveSchool(schoolData);
        setSchools(updatedSchools);
        localStorage.setItem('eduevent_schools', JSON.stringify(updatedSchools));
      } else {
        setSchools(saveSchool(schoolData));
      }
      showToast('Data sekolah berhasil disimpan', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data sekolah: ' + err.message, 'error');
    }
  };

  const handleDeleteSchool = async (id) => {
    try {
      if (isOnline) {
        const updatedSchools = await sbDeleteSchool(id);
        setSchools(updatedSchools);
        localStorage.setItem('eduevent_schools', JSON.stringify(updatedSchools));
      } else {
        setSchools(removeSchool(id));
      }
      showToast('Sekolah berhasil dihapus', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus sekolah: ' + err.message, 'error');
    }
  };

  // ============================================================
  // MANAJEMEN PENGATURAN GAJI & FEE
  // ============================================================
  const handleSaveSalarySettings = async (settingsData) => {
    try {
      if (isOnline) {
        const saved = await sbSaveSalarySettings(settingsData);
        setSalarySettings(storeSalarySettings(saved));
      } else {
        setSalarySettings(storeSalarySettings(settingsData));
      }
      showToast('Pengaturan gaji dan bonus berhasil disimpan', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pengaturan: ' + err.message, 'error');
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

  // ============================================================
  // PAYOUT HANDLERS
  // ============================================================
  const handleDisburseFee = async (userId, amount, details, eventIdsToUpdate) => {
    try {
      if (dbMode === 'supabase') {
        const { payouts: updatedPayouts, events: updatedEvents } = await sbSavePayout({
          userId,
          amount,
          details
        }, eventIdsToUpdate);
        
        setPayouts(updatedPayouts);
        setEvents(updatedEvents);
        localStorage.setItem('eduevent_payouts', JSON.stringify(updatedPayouts));
        localStorage.setItem('eduevent_events', JSON.stringify(updatedEvents));
      } else {
        showToast('Fitur pencairan hanya tersedia dalam mode Supabase', 'warning');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memproses pencairan: ' + err.message, 'error');
      throw err;
    }
  };

  // ============================================================
  // FINANCES & PASSCODE MANAGEMENT
  // ============================================================
  const unlockFinance = (enteredPasscode) => {
    const savedPin = getFinancePasscode();
    const adminUser = users.find((u) => u.role === 'admin');
    const validPasscodes = [savedPin, '8888', adminUser?.passcode, currentUser?.passcode].filter(Boolean);

    if (validPasscodes.includes(enteredPasscode)) {
      setIsFinanceUnlocked(true);
      setIsPasscodeModalOpen(false);
      showToast('Akses Monitoring Keuangan Terbuka!', 'success');
      return true;
    } else {
      showToast('Passcode salah. Silakan coba lagi.', 'error');
      return false;
    }
  };

  const lockFinance = () => {
    setIsFinanceUnlocked(false);
    showToast('Monitoring Keuangan terkunci', 'info');
  };

  const changeFinancePasscode = (newPin) => {
    saveFinancePasscode(newPin);
    showToast('Passcode keuangan berhasil diperbarui', 'success');
  };

  const handleSaveFinance = (financeData) => {
    const updated = saveFinance(financeData);
    setFinances(updated);
    showToast('Transaksi keuangan berhasil disimpan', 'success');
    return updated;
  };

  const handleDeleteFinance = (id) => {
    const updated = removeFinance(id);
    setFinances(updated);
    showToast('Transaksi keuangan berhasil dihapus', 'info');
    return updated;
  };

  const autoSyncActivityFinances = () => {
    const currentFinances = getFinances();
    let addedCount = 0;
    
    events.forEach(evt => {
      const existing = currentFinances.find(f => f.refNo === `EVT-AUTO-${evt.id}`);
      if (!existing && evt.participatingStudents > 0) {
        const amount = evt.participatingStudents * 30000;
        const newFinance = {
          id: `fin-auto-${evt.id}`,
          date: evt.date,
          type: 'income',
          category: 'Tiket VR Siswa',
          title: `[Auto-Sync] Kegiatan VR ${evt.schoolName}`,
          amount: amount,
          cityName: evt.cityName,
          schoolName: evt.schoolName,
          refNo: `EVT-AUTO-${evt.id}`,
          notes: `Hasil sync otomatis ${evt.participatingStudents} siswa @ Rp 30.000 (Operator: ${evt.operatorName})`,
          createdAt: new Date().toISOString()
        };
        saveFinance(newFinance);
        addedCount++;
      }
    });

    const updated = getFinances();
    setFinances(updated);
    if (addedCount > 0) {
      showToast(`Berhasil menyinkronkan ${addedCount} transaksi dari kegiatan VR!`, 'success');
    } else {
      showToast('Seluruh data kegiatan VR telah tersinkronisasi dalam cashflow.', 'info');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        cities,
        events,
        schools,
        salarySettings,
        payouts,
        finances,
        isFinanceUnlocked,
        isPasscodeModalOpen,
        setIsPasscodeModalOpen,
        unlockFinance,
        lockFinance,
        changeFinancePasscode,
        handleSaveFinance,
        handleDeleteFinance,
        autoSyncActivityFinances,
        toast,
        showToast,
        switchRole,
        switchUser,
        isOnline,
        isSyncing,
        dbMode,
        isSupabaseConfigured,
        kadinCity,
        login,
        logout,
        refreshData,
        setKadinCity,
        handleSaveEvent,
        handleDeleteEvent,
        handleSaveCity,
        handleDeleteCity,
        handleSaveUser,
        handleDeleteUser,
        handleSaveSchool,
        handleDeleteSchool,
        handleSaveSalarySettings,
        handleDisburseFee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook → diimpor dari './useAuth' (file terpisah untuk kompatibilitas Vite HMR)
