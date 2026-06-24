"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { ApiClientError, api } from "@/lib/api";
import { getBrandProfileCompletion, getCreatorProfileCompletion } from "@/lib/profile";
import { getClientError } from "@/lib/form";
import type { Role } from "@/lib/types";

type ProfileCheck = "idle" | "checking" | "allowed" | "redirecting" | "error";

export function ProtectedRoute({ role, requireProfile = false, children }: { role: Role; requireProfile?: boolean; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profileCheck, setProfileCheck] = useState<ProfileCheck>(requireProfile ? "checking" : "allowed");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (!requireProfile) {
      setProfileCheck("allowed");
      return;
    }
    setProfileCheck("checking");
    setProfileError("");
  }, [pathname, requireProfile]);

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

  useEffect(() => {
    if (!requireProfile || loading || !user || user.role !== role) return;

    let active = true;

    async function checkProfile() {
      try {
        if (role === "CREATOR") {
          const profile = await api.getCreatorProfile();
          if (getCreatorProfileCompletion(profile).percentage < 100) {
            if (active) {
              setProfileCheck("redirecting");
              router.replace("/creator/onboarding");
            }
            return;
          }
        }

        if (role === "BRAND") {
          const profile = await api.getBrandProfile();
          if (getBrandProfileCompletion(profile).percentage < 100) {
            if (active) {
              setProfileCheck("redirecting");
              router.replace("/brand/onboarding");
            }
            return;
          }
        }

        if (active) setProfileCheck("allowed");
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiClientError && err.status === 404) {
          setProfileCheck("redirecting");
          router.replace(role === "CREATOR" ? "/creator/onboarding" : "/brand/onboarding");
          return;
        }
        setProfileError(getClientError(err, "Unable to verify your profile. Please try again."));
        setProfileCheck("error");
      }
    }

    void checkProfile();

    return () => {
      active = false;
    };
  }, [loading, requireProfile, role, router, user, pathname]);

  if (loading || !user || user.role !== role || profileCheck === "checking" || profileCheck === "redirecting") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Checking your profile...</div>;
  }

  if (profileCheck === "error") {
    return <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-muted-foreground">{profileError}</div>;
  }

  return <>{children}</>;
}
