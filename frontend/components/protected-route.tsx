"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import type { Role } from "@/lib/types";

export function ProtectedRoute({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(user.role === "CREATOR" ? "/creator/dashboard" : user.role === "BRAND" ? "/brand/dashboard" : "/");
    }
  }, [loading, role, router, user]);

  if (loading || !user || user.role !== role) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading...</div>;
  }

  return <>{children}</>;
}
