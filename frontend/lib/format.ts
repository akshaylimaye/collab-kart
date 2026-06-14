import type { CommissionType } from "@/lib/types";

export function formatCommission(type: CommissionType, value: number) {
  if (type === "PERCENTAGE") return `${value}% commission`;
  return `₹${Number(value).toLocaleString("en-IN")} commission`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function shortText(value: string, fallback = "Not added") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}
