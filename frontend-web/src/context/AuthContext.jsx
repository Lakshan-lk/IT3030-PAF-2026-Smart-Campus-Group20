import React, { createContext, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'smartcampus-auth-user';

const AuthContext = createContext();

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

  const login = (username, password) => {
    const normalizedUser = username.trim().toLowerCase();

    if (normalizedUser === 'admin' && password === 'admin') {
      const user = { username: 'admin', role: 'admin' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthUser(user);
      return { success: true, role: 'admin' };
    }

    if (normalizedUser === 'user' && password === 'user') {
      const user = { username: 'user', role: 'user' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthUser(user);
      return { success: true, role: 'user' };
    }

    if (normalizedUser === 'test123' && password === 'test123') {
      const user = { username: 'test123', role: 'user' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthUser(user);
      return { success: true, role: 'user' };
    }

    return { success: false, message: 'Invalid username or password' };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthUser(null);
  };

  const value = useMemo(() => ({ authUser, login, logout }), [authUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
