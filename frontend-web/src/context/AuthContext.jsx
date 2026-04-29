import React, { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

const STORAGE_KEY = 'smartcampus-auth-user';

const AuthContext = createContext();

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.role || !parsed?.username) return null;
    return parsed;
  } catch {
    return null;
  }
}


export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(() => readStoredUser());

  const login = async (username, password) => {
    const normalizedUser = normalizeUsername(username);

    // Keep admin/admin hardcoded fallback if needed, but return same structure
    if (normalizedUser === 'admin' && password === 'admin') {
      const user = { id: 1, username: 'admin', role: 'admin', name: 'System Administrator' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthUser(user);
      return { success: true, role: 'admin' };
    }

    try {
      const res = await authApi.localLogin(username, password);
      const user = res.data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthUser(user);
      return { success: true, role: user.role };
    } catch (error) {
      return {
        success: false,
        message: error?.response?.status === 401
          ? 'Invalid username or password'
          : (error?.response?.data?.message || 'Unable to sign in right now'),
      };
    }
  };

  const register = (username, password) => {
    return { success: false, message: 'Direct registration is disabled. Ask an admin or use Google sign-in.' };
  };

  const loginWithGoogle = async (credential) => {
    if (!credential) {
      return { success: false, message: 'Google credential is required' };
    }

    try {
      const response = await authApi.googleLogin(credential);
      const user = response.data;
      const sessionUser = {
        id: user.id,
        username: user.username || user.name || user.email?.split('@')[0] || 'user',
        role: user.role || 'user',
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      setAuthUser(sessionUser);

      return {
        success: true,
        role: sessionUser.role,
        newUser: user.newUser,
        user: sessionUser,
      };
    } catch (error) {
      const message = error?.response?.data?.message || 'Google sign-in failed';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthUser(null);
  };

  const value = useMemo(
    () => ({ authUser, login, register, loginWithGoogle, logout }),
    [authUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
