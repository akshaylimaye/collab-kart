/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Building2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  src?: string | null;
  initials: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

type BrandLogoProps = ProfileAvatarProps;

const avatarSize = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-28 w-28 text-3xl"
};

const logoSize = {
  sm: "h-12 w-12 text-sm",
  md: "h-16 w-16 text-base",
  lg: "h-28 w-28 text-3xl"
};

function cleanInitials(initials: string) {
  return initials.trim().slice(0, 2).toUpperCase() || "CK";
}

export function ProfileAvatar({ src, initials, alt = "Creator avatar", size = "md", className }: ProfileAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <div className={cn("shrink-0 overflow-hidden rounded-full border-4 border-white bg-primary font-semibold text-primary-foreground shadow-sm", avatarSize[size], className)}>
      {src && !failed ? <img src={src} alt={alt} className="h-full w-full object-cover object-center" onError={() => setFailed(true)} /> : <div className="flex h-full w-full items-center justify-center">{cleanInitials(initials) || <UserRound className="h-5 w-5" />}</div>}
    </div>
  );
}

export function BrandLogo({ src, initials, alt = "Brand logo", size = "md", className }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <div className={cn("shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-white font-semibold text-primary shadow-sm ring-1 ring-border/70", logoSize[size], className)}>
      {src && !failed ? <img src={src} alt={alt} className="h-full w-full object-contain object-center p-2" onError={() => setFailed(true)} /> : <div className="flex h-full w-full items-center justify-center bg-primary/10">{cleanInitials(initials) || <Building2 className="h-5 w-5" />}</div>}
    </div>
  );
}
