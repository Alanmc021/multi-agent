'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getProfile,
  login as loginApi,
  logout as logoutApi,
  registerCompany as registerCompanyApi,
} from '@/lib/api/services/auth';
import { clearAuthSession, getAccessToken, getAuthUser, setAuthSession } from '@/lib/auth/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | authenticated | guest
  const [user, setUser] = useState(() => getAuthUser());

  const hydrate = useCallback(async () => {
    // Auth desativado para demo do desafio técnico.
    setStatus('authenticated');
    setUser({ name: 'Demo', email: 'demo@multi-agente.local' });
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async ({ email, password, tenantId }) => {
    setStatus('loading');
    const result = await loginApi({ email, password, tenantId });
    setUser(result?.user || null);
    setStatus('authenticated');
    return result;
  }, []);

  const registerCompany = useCallback(
    async ({ name, email, password, companyName, subdomain }) => {
      setStatus('loading');
      const result = await registerCompanyApi({
        name,
        email,
        password,
        companyName,
        subdomain,
      });
      setUser(result?.user || null);
      setStatus('authenticated');
      return result;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    } finally {
      clearAuthSession();
      setUser(null);
      setStatus('guest');
    }
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      isAuthenticated: status === 'authenticated',
      login,
      registerCompany,
      logout,
      refreshProfile: hydrate,
    }),
    [status, user, login, registerCompany, logout, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider />');
  }
  return ctx;
}


