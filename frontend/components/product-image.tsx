/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

function suspiciousImageUrl(src?: string | null) {
  if (!src) return true;
  const lower = src.toLowerCase();
  return lower.includes("next/static") || lower.includes("webpack") || lower.includes("error-overlay");
}

export function ProductImage({ src, alt, className, fallbackClassName }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || suspiciousImageUrl(src)) {
    return (
      <div className={cn("flex h-full w-full flex-col items-center justify-center gap-2 bg-secondary/55 text-center text-muted-foreground", fallbackClassName)}>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-border/70">
          <ImageIcon className="h-5 w-5" />
        </span>
        <span className="px-3 text-xs font-semibold uppercase tracking-wide">Product image</span>
      </div>
    );
  }

  return <img className={cn("h-full w-full object-cover", className)} src={src || ""} alt={alt} onError={() => setFailed(true)} />;
}
