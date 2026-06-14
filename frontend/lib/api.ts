import type {
  AuthResponse,
  BrandApplication,
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

type CampaignPayload = {
  title: string;
  productName: string;
  description: string;
  category: string;
  productImage?: File | null;
  commissionType: CommissionType;
  commissionValue: number;
};

type CreatorProfilePayload = Partial<CreatorProfile> & { profileImage?: File | null };
type BrandProfilePayload = Partial<BrandProfile> & { logoImage?: File | null };

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

function profileBody(payload: CreatorProfilePayload | BrandProfilePayload, imageField: "profileImage" | "logoImage") {
  const payloadRecord = payload as Record<string, unknown>;
  const image = payloadRecord[imageField] as File | null | undefined;
  const cleanPayload = { ...payloadRecord };
  delete cleanPayload[imageField];

  if (!image) return JSON.stringify(cleanPayload);

  const formData = new FormData();
  Object.entries(cleanPayload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  formData.append(imageField, image);
  return formData;
}

function campaignBody(payload: CampaignPayload) {
  if (!payload.productImage) {
    return JSON.stringify({
      title: payload.title,
      productName: payload.productName,
      description: payload.description,
      category: payload.category,
      commissionType: payload.commissionType,
      commissionValue: payload.commissionValue
    });
  }

  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("productName", payload.productName);
  formData.append("description", payload.description);
  formData.append("category", payload.category);
  formData.append("commissionType", payload.commissionType);
  formData.append("commissionValue", String(payload.commissionValue));
  formData.append("productImage", payload.productImage);
  return formData;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!isFormData) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new ApiClientError("Unable to reach the API. Check that the backend is running.", 0);
  }

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
  createCreatorProfile: (payload: CreatorProfilePayload) =>
    request<CreatorProfile>("/api/v1/creator/profile", { method: "POST", body: profileBody(payload, "profileImage") }),
  updateCreatorProfile: (payload: CreatorProfilePayload) =>
    request<CreatorProfile>("/api/v1/creator/profile", { method: "PUT", body: profileBody(payload, "profileImage") }),

  getBrandProfile: () => request<BrandProfile>("/api/v1/brand/profile"),
  createBrandProfile: (payload: BrandProfilePayload) =>
    request<BrandProfile>("/api/v1/brand/profile", { method: "POST", body: profileBody(payload, "logoImage") }),
  updateBrandProfile: (payload: BrandProfilePayload) =>
    request<BrandProfile>("/api/v1/brand/profile", { method: "PUT", body: profileBody(payload, "logoImage") }),

  getCreatorCampaigns: () => request<Campaign[]>("/api/v1/creator/campaigns"),
  getCreatorCampaign: (id: string) => request<Campaign>(`/api/v1/creator/campaigns/${id}`),
  applyToCampaign: (id: string, message?: string) =>
    request<CampaignApplication>(`/api/v1/creator/campaigns/${id}/apply`, {
      method: "POST",
      body: JSON.stringify({ message })
    }),
  getCreatorApplications: () => request<CampaignApplication[]>("/api/v1/creator/applications"),
  updateCreatorApplicationMessage: (applicationId: string, message: string) =>
    request<CampaignApplication>(`/api/v1/creator/applications/${applicationId}`, { method: "PUT", body: JSON.stringify({ message }) }),
  withdrawCreatorApplication: (applicationId: string) =>
    request<CampaignApplication>(`/api/v1/creator/applications/${applicationId}/withdraw`, { method: "PATCH" }),

  getBrandCampaigns: () => request<Campaign[]>("/api/v1/brand/campaigns"),
  getBrandCampaign: (id: string) => request<Campaign>(`/api/v1/brand/campaigns/${id}`),
  createBrandCampaign: (payload: CampaignPayload) => request<Campaign>("/api/v1/brand/campaigns", { method: "POST", body: campaignBody(payload) }),
  updateBrandCampaign: (id: string, payload: CampaignPayload) => request<Campaign>(`/api/v1/brand/campaigns/${id}`, { method: "PUT", body: campaignBody(payload) }),
  publishBrandCampaign: (id: string) => request<Campaign>(`/api/v1/brand/campaigns/${id}/publish`, { method: "PATCH" }),
  archiveBrandCampaign: (id: string) => request<Campaign>(`/api/v1/brand/campaigns/${id}/archive`, { method: "PATCH" }),
  getBrandApplications: (campaignId: string) => request<BrandApplication[]>(`/api/v1/brand/campaigns/${campaignId}/applications`),
  acceptBrandApplication: (applicationId: string, payload: { couponCode: string; brandInstructions?: string }) =>
    request<BrandApplication>(`/api/v1/brand/applications/${applicationId}/accept`, { method: "PATCH", body: JSON.stringify(payload) }),
  rejectBrandApplication: (applicationId: string, payload?: { rejectionReason?: string }) =>
    request<BrandApplication>(`/api/v1/brand/applications/${applicationId}/reject`, { method: "PATCH", body: JSON.stringify(payload || {}) })
};
