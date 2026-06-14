import { ApiClientError } from "@/lib/api";

export type FormErrors<T extends string> = Partial<Record<T, string>>;

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function getClientError(error: unknown, fallback: string) {
  return error instanceof ApiClientError ? error.message : fallback;
}
