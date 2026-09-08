'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserAccount, UserRole, UserPermissions } from '@/types';
import { INITIAL_ACCOUNTS } from '@/lib/mockData';

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  teamAccounts: UserAccount[];
  login: (username: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  can: (permission: keyof UserPermissions) => boolean;
  addTeamAccount: (account: any) => Promise<{ success: boolean; message?: string }>;
  updateTeamAccount: (id: string, updates: any) => Promise<{ success: boolean; message?: string }>;
  deleteTeamAccount: (id: string) => Promise<{ success: boolean; message?: string }>;
  refreshAccounts: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_NAME = 'prism_auth_session';
const AUTH_STORAGE_KEY = 'studio_prism_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [teamAccounts, setTeamAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS as UserAccount[]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/accounts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTeamAccounts(data);
        }
      }
    } catch (e) {
      console.warn('Auth accounts fetch warning:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    const interval = setInterval(fetchAccounts, 3000);

    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }

    return () => clearInterval(interval);
  }, [fetchAccounts]);

  const login = async (username: string, password?: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const found = teamAccounts.find(
      acc => acc.username.toLowerCase() === cleanUsername
    );
    if (!found) {
      return { success: false, message: '존재하지 않는 아이디입니다.' };
    }
    if (found.password && password && found.password !== password) {
      return { success: false, message: '비밀번호가 일치하지 않습니다.' };
    }

    setUser(found);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
    document.cookie = `${AUTH_COOKIE_NAME}=${cleanUsername}; path=/; max-age=86400`;
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
    router.push('/login');
  };

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  const can = (permission: keyof UserPermissions) => {
    if (!user) return false;
    if ((user.role as any) === 'SUPER_ADMIN' || user.username === 'admin') return true;
    return !!user.permissions?.[permission];
  };

  const addTeamAccount = async (account: any) => {
    const newAccount: UserAccount = {
      ...account,
      id: account.username.trim().toLowerCase(),
      username: account.username.trim().toLowerCase(),
      createdAt: new Date().toISOString()
    };

    setTeamAccounts(prev => [...prev.filter(a => a.username !== newAccount.username), newAccount]);

    try {
      const res = await fetch('/api/auth/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', payload: newAccount })
      });
      return await res.json();
    } catch (err: any) {
      console.error('Failed to add account:', err);
      return { success: false, message: err?.message || '계정 추가 중 오류가 발생했습니다.' };
    }
  };

  const updateTeamAccount = async (id: string, updates: any) => {
    const targetUsername = updates.username ? updates.username.trim().toLowerCase() : id;

    setTeamAccounts(prev =>
      prev.map(a => (a.id === id || a.username === id ? { ...a, ...updates, id: targetUsername, username: targetUsername } : a))
    );

    if (user && (user.id === id || user.username === id)) {
      const updatedUser = { ...user, ...updates, username: targetUsername, id: targetUsername };
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      document.cookie = `${AUTH_COOKIE_NAME}=${targetUsername}; path=/; max-age=86400`;
    }

    try {
      const res = await fetch('/api/auth/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', payload: { id, updates } })
      });
      return await res.json();
    } catch (err: any) {
      console.error('Failed to update account:', err);
      return { success: false, message: err?.message || '계정 수정 중 오류가 발생했습니다.' };
    }
  };

  const deleteTeamAccount = async (id: string) => {
    setTeamAccounts(prev => prev.filter(a => a.id !== id && a.username !== id));

    if (user && (user.id === id || user.username === id)) {
      setUser(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
    }

    try {
      const res = await fetch('/api/auth/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', payload: { id } })
      });
      return await res.json();
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      return { success: false, message: err?.message || '계정 삭제 중 오류가 발생했습니다.' };
    }
  };

  const refreshAccounts = async () => {
    await fetchAccounts();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        teamAccounts,
        login,
        logout,
        hasRole,
        can,
        addTeamAccount,
        updateTeamAccount,
        deleteTeamAccount,
        refreshAccounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}