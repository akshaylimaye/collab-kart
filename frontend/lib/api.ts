import type {
  AuthResponse,
  BrandProfile,
  Campaign,
  CampaignApplication,
  CommissionType,
  CreatorProfile,
  Role
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const TOKEN_KEY = "collabkart_token";
const USER_KEY = "collabkart_user";

export class ApiClientError extends Error {
  status: number;
  validationErrors?: Record<string, string>;

  constructor(message: string, status: number, validationErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthResponse) : null;
}

export function storeSession(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiClientError(
      body?.message || "Request failed",
      response.status,
      body?.validationErrors
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  login: (payload: { email: string; password: string }) =>
    request<AuthResponse>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload: { name: string; email: string; password: string; role: Exclude<Role, "ADMIN"> }) =>
    request<AuthResponse>("/api/v1/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  getCreatorProfile: () => request<CreatorProfile>("/api/v1/creator/profile"),
  createCreatorProfile: (payload: Partial<CreatorProfile>) =>
    request<CreatorProfile>("/api/v1/creator/profile", { method: "POST", body: JSON.stringify(payload) }),
  updateCreatorProfile: (payload: Partial<CreatorProfile>) =>
    request<CreatorProfile>("/api/v1/creator/profile", { method: "PUT", body: JSON.stringify(payload) }),

  getBrandProfile: () => request<BrandProfile>("/api/v1/brand/profile"),
  createBrandProfile: (payload: Partial<BrandProfile>) =>
    request<BrandProfile>("/api/v1/brand/profile", { method: "POST", body: JSON.stringify(payload) }),
  updateBrandProfile: (payload: Partial<BrandProfile>) =>
    request<BrandProfile>("/api/v1/brand/profile", { method: "PUT", body: JSON.stringify(payload) }),

  getCreatorCampaigns: () => request<Campaign[]>("/api/v1/creator/campaigns"),
  getCreatorCampaign: (id: string) => request<Campaign>(`/api/v1/creator/campaigns/${id}`),
  applyToCampaign: (id: string, message?: string) =>
    request<CampaignApplication>(`/api/v1/creator/campaigns/${id}/apply`, {
      method: "POST",
      body: JSON.stringify({ message })
    }),
  getCreatorApplications: () => request<CampaignApplication[]>("/api/v1/creator/applications"),

  getBrandCampaigns: () => request<Campaign[]>("/api/v1/brand/campaigns"),
  getBrandCampaign: (id: string) => request<Campaign>(`/api/v1/brand/campaigns/${id}`),
  createBrandCampaign: (payload: {
    title: string;
    productName: string;
    description: string;
    category: string;
    productImageUrl?: string;
    commissionType: CommissionType;
    commissionValue: number;
  }) => request<Campaign>("/api/v1/brand/campaigns", { method: "POST", body: JSON.stringify(payload) }),
  publishBrandCampaign: (id: string) => request<Campaign>(`/api/v1/brand/campaigns/${id}/publish`, { method: "PATCH" }),
  archiveBrandCampaign: (id: string) => request<Campaign>(`/api/v1/brand/campaigns/${id}/archive`, { method: "PATCH" }),
  getBrandApplications: (campaignId: string) =>
    request<CampaignApplication[]>(`/api/v1/brand/campaigns/${campaignId}/applications`)
};
