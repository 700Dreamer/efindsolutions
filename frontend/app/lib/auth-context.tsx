"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin" | "delivery" | "rider";
  avatar?: string;
  address?: string;
  city?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isRider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem("efind_token");
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await fetchApi<User>("/auth/me");
      setUser(userData);
      setToken(savedToken);
    } catch {
      localStorage.removeItem("efind_token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetchApi<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      data: { email, password },
    });
    localStorage.setItem("efind_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData: any): Promise<User> => {
    const res = await fetchApi<{ access_token: string; user: User }>("/auth/register", {
      method: "POST",
      data: userData,
    });
    localStorage.setItem("efind_token", res.access_token);
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("efind_token");
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "admin";
  const isRider = user?.role === "delivery" || user?.role === "rider";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isRider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
