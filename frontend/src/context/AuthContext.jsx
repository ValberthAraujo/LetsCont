import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, testToken } from '../services/api';

const STORAGE_KEY = 'auth';

const AuthContext = createContext({
  token: null,
  user: null,
  isAuthenticated: false,
  isSuperuser: false,
  login: async () => {},
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) setToken(parsed.token);
        if (parsed?.user) setUser(parsed.user);
      }
    } catch {}
  }, []);

  const persist = useCallback((next) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const login = useCallback(async (email, password) => {
    const { access_token } = await apiLogin(email, password);
    const userData = await testToken(access_token);
    setToken(access_token);
    setUser(userData);
    persist({ token: access_token, user: userData });
    return userData;
  }, [persist]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return null;
    const userData = await testToken(token);
    setUser(userData);
    persist({ token, user: userData });
    return userData;
  }, [token, persist]);

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    isSuperuser: Boolean(user?.is_superuser),
    login,
    logout,
    refresh,
  }), [token, user, login, logout, refresh]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

