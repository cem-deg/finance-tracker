"use client";

/**
 * Auth context — provides authentication state across the app.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/services/api";
import type { User, AuthToken } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const stored = localStorage.getItem("datafle_token");
    if (stored) {
      setToken(stored);
      authApi.getMe()
        .then((u) => setUser(u as User))
        .catch(() => {
          localStorage.removeItem("datafle_token");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = (await authApi.login({ email, password })) as AuthToken;
    localStorage.setItem("datafle_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, name: string, password: string) => {
    const data = (await authApi.register({ email, name, password })) as AuthToken;
    localStorage.setItem("datafle_token", data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("datafle_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
