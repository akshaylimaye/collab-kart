export type Role = "CREATOR" | "BRAND" | "ADMIN";
export type CampaignStatus = "DRAFT" | "PENDING_REVIEW" | "LIVE" | "REJECTED" | "ARCHIVED";
export type CommissionType = "FIXED" | "PERCENTAGE";
export type ApplicationStatus = "APPLIED" | "ACCEPTED" | "REJECTED";

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: Role;
}

export interface ApiError {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  validationErrors?: Record<string, string>;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  instagramHandle?: string;
  followerCount?: number;
  category?: string;
  bio?: string;
  city?: string;
}

export interface BrandProfile {
  id: string;
  userId: string;
  brandName: string;
  website?: string;
  instagramHandle?: string;
  category?: string;
  description?: string;
}

export interface Campaign {
  id: string;
  brandProfileId: string;
  title: string;
  productName: string;
  description: string;
  category: string;
  productImageUrl?: string;
  commissionType: CommissionType;
  commissionValue: number;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  creatorProfileId: string;
  creatorProfile?: CreatorProfile;
  status: ApplicationStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
  campaign: Campaign;
}
