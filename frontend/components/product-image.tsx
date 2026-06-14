/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Coffee, Dumbbell, ImageIcon, Laptop, Shirt, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductImageVariant = "card" | "detail" | "thumbnail" | "preview";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  category?: string | null;
  variant?: ProductImageVariant;
  className?: string;
  fallbackClassName?: string;
};

const categoryFallbacks = [
  { match: ["food", "snack", "beverage", "drink", "grocery"], label: "Food", icon: Coffee, className: "from-amber-50 via-orange-50 to-rose-50 text-orange-700" },
  { match: ["beauty", "skin", "makeup", "cosmetic"], label: "Beauty", icon: Sparkles, className: "from-rose-50 via-pink-50 to-violet-50 text-pink-700" },
  { match: ["tech", "gadget", "electronics", "software"], label: "Tech", icon: Laptop, className: "from-cyan-50 via-sky-50 to-indigo-50 text-sky-700" },
  { match: ["fashion", "style", "apparel", "clothing"], label: "Fashion", icon: Shirt, className: "from-fuchsia-50 via-violet-50 to-purple-50 text-violet-700" },
  { match: ["fitness", "wellness", "health", "sport"], label: "Fitness", icon: Dumbbell, className: "from-emerald-50 via-teal-50 to-lime-50 text-emerald-700" }
];

const imageClassByVariant: Record<ProductImageVariant, string> = {
  card: "object-cover object-center",
  detail: "object-contain object-center p-3 sm:p-4",
  thumbnail: "object-cover object-center",
  preview: "object-contain object-center p-3"
};

const fallbackSizeByVariant: Record<ProductImageVariant, string> = {
  card: "gap-2",
  detail: "gap-3 p-6",
  thumbnail: "gap-1 p-3",
  preview: "gap-2 p-5"
};

function suspiciousImageUrl(src?: string | null) {
  if (!src) return true;
  const lower = src.toLowerCase();
  return lower.includes("next/static") || lower.includes("webpack") || lower.includes("error-overlay") || lower.includes("/_next/") || lower.includes("stacktrace") || lower.includes("exception") || lower.includes("screenshot");
}

function getFallback(category?: string | null) {
  const normalized = (category || "").toLowerCase();
  return categoryFallbacks.find((fallback) => fallback.match.some((item) => normalized.includes(item))) || {
    label: category?.trim() || "Product",
    icon: ImageIcon,
    className: "from-slate-50 via-white to-emerald-50 text-primary"
  };
}

function looksLikePlaceholderImage(image: HTMLImageElement) {
  if (image.naturalWidth < 32 || image.naturalHeight < 32) return true;

  try {
    const canvas = document.createElement("canvas");
    const size = 24;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return false;
    context.drawImage(image, 0, 0, size, size);
    const data = context.getImageData(0, 0, size, size).data;
    let brightness = 0;
    let variance = 0;
    const samples = data.length / 4;

    for (let index = 0; index < data.length; index += 4) {
      const value = (data[index] + data[index + 1] + data[index + 2]) / 3;
      brightness += value;
    }

    const average = brightness / samples;
    for (let index = 0; index < data.length; index += 4) {
      const value = (data[index] + data[index + 1] + data[index + 2]) / 3;
      variance += Math.abs(value - average);
    }

    return average < 18 && variance / samples < 8;
  } catch {
    return false;
  }
}

export function ProductImage({ src, alt, category, variant = "card", className, fallbackClassName }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const fallback = getFallback(category);
  const FallbackIcon = fallback.icon;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || suspiciousImageUrl(src)) {
    return (
      <div className={cn("flex h-full w-full flex-col items-center justify-center bg-gradient-to-br text-center", fallbackSizeByVariant[variant], fallback.className, fallbackClassName)}>
        <span className={cn("flex items-center justify-center bg-white/85 shadow-sm ring-1 ring-border/70", variant === "thumbnail" ? "h-9 w-9 rounded-xl" : "h-12 w-12 rounded-2xl")}>
          <FallbackIcon className={variant === "thumbnail" ? "h-4 w-4" : "h-5 w-5"} />
        </span>
        <span className={cn("px-2 font-semibold uppercase tracking-wide", variant === "thumbnail" ? "text-[10px]" : "text-xs")}>{fallback.label} product</span>
      </div>
    );
  }

  return <img className={cn("h-full w-full", imageClassByVariant[variant], className)} src={src || ""} alt={alt} onError={() => setFailed(true)} onLoad={(event) => setFailed(looksLikePlaceholderImage(event.currentTarget))} />;
}
