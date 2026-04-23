import React, { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

const STORAGE_KEY = 'smartcampus-auth-user';
const USERS_STORAGE_KEY = 'smartcampus-auth-users';
const DEFAULT_USERS = [{ username: 'user', password: 'user', provider: 'local' }];

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

function readStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return DEFAULT_USERS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_USERS;

    const validUsers = parsed.filter((user) => user?.username && typeof user.username === 'string');
    return withDefaultUser(validUsers);
  } catch {
    return DEFAULT_USERS;
  }
}

function withDefaultUser(users) {
  const hasDefault = users.some((user) => normalizeUsername(user.username) === 'user');
  if (hasDefault) return users;
  return [...users, ...DEFAULT_USERS];
}

function persistUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(withDefaultUser(users)));
}

function buildSessionUser(username, id = null) {
  return { username, role: 'user', id };
}

function ensureUniqueUsername(baseUsername, existingUsers) {
  let candidate = baseUsername;
  let suffix = 1;
  const existing = new Set(existingUsers.map((u) => normalizeUsername(u.username)));

  while (existing.has(candidate)) {
    candidate = `${baseUsername}${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(() => readStoredUser());
  const [registeredUsers, setRegisteredUsers] = useState(() => readStoredUsers());

  const login = (username, password) => {
    const normalizedUser = normalizeUsername(username);

    if (normalizedUser === 'admin' && password === 'admin') {
      // Fetch admin user from backend to get correct ID
      fetch('http://localhost:8080/api/v1/users/debug/all')
        .then(r => r.json())
        .then(users => {
          const adminUser = users.find(u => u.email === 'admin@campus.lk' || u.role === 'ADMIN');
          const user = { 
            username: 'admin', 
            role: 'admin', 
            id: adminUser?.id || 1, 
            name: adminUser?.name || 'Admin' 
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          setAuthUser(user);
          console.log('Admin login - stored user:', user);
        })
        .catch(err => {
          // Fallback if fetch fails
          const user = { username: 'admin', role: 'admin', id: 1, name: 'Admin' };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          setAuthUser(user);
        });
      return { success: true, role: 'admin' };
    }

    const matchedUser = registeredUsers.find((user) =>
      normalizeUsername(user.username) === normalizedUser && user.password === password
    );

    if (matchedUser) {
      const user = buildSessionUser(matchedUser.username, matchedUser.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setAuthUser(user);
      return { success: true, role: 'user' };
    }

    return { success: false, message: 'Invalid username or password' };
  };

  const register = (username, password) => {
    const normalizedUser = normalizeUsername(username);

    if (!normalizedUser || normalizedUser.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters' };
    }

    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters' };
    }

    if (normalizedUser === 'admin') {
      return { success: false, message: 'This username is reserved' };
    }

    const alreadyExists = registeredUsers.some(
      (user) => normalizeUsername(user.username) === normalizedUser
    );

    if (alreadyExists) {
      return { success: false, message: 'Username already exists' };
    }

    const newId = Date.now();
    const nextUsers = withDefaultUser([
      ...registeredUsers,
      { username: normalizedUser, password, provider: 'local', id: newId },
    ]);

    setRegisteredUsers(nextUsers);
    persistUsers(nextUsers);

    const sessionUser = buildSessionUser(normalizedUser, newId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    setAuthUser(sessionUser);

    return { success: true, role: 'user' };
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
    [authUser, registeredUsers]
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
