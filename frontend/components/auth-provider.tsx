"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClientError, api, clearSession, getStoredUser, storeSession } from "@/lib/api";
import { getBrandProfileCompletion, getCreatorProfileCompletion } from "@/lib/profile";
import type { AuthResponse, Role } from "@/lib/types";

interface AuthContextValue {
  user: AuthResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: Exclude<Role, "ADMIN"> }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function dashboardFor(role: Role) {
  if (role === "CREATOR") return "/creator/dashboard";
  if (role === "BRAND") return "/brand/dashboard";
  return "/admin";
}

async function postAuthDestination(auth: AuthResponse) {
  if (auth.role === "CREATOR") {
    try {
      const profile = await api.getCreatorProfile();
      return getCreatorProfileCompletion(profile).percentage === 100 ? dashboardFor(auth.role) : "/creator/onboarding";
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) return "/creator/onboarding";
      return dashboardFor(auth.role);
    }
  }

  if (auth.role === "BRAND") {
    try {
      const profile = await api.getBrandProfile();
      return getBrandProfileCompletion(profile).percentage === 100 ? dashboardFor(auth.role) : "/brand/onboarding";
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) return "/brand/onboarding";
      return dashboardFor(auth.role);
    }
  }

  return dashboardFor(auth.role);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async login(email, password) {
      const auth = await api.login({ email, password });
      storeSession(auth);
      setUser(auth);
      router.push(await postAuthDestination(auth));
    },
    async register(payload) {
      const auth = await api.register(payload);
      storeSession(auth);
      setUser(auth);
      router.push(await postAuthDestination(auth));
    },
    logout() {
      clearSession();
      setUser(null);
      router.push("/login");
    }
  }), [loading, router, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
