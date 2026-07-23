/**
 * useAuth.js — Custom hook untuk mengakses AuthContext
 *
 * Dipisahkan dari AuthContext.jsx agar Vite Fast Refresh
 * tidak menampilkan peringatan "export incompatible" saat development.
 *
 * File AuthContext.jsx hanya mengekspor React Component (AuthProvider),
 * sedangkan hook non-komponen (useAuth) diekspor dari file ini.
 */
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => useContext(AuthContext);
