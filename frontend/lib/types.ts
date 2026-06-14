export type Role = "CREATOR" | "BRAND" | "ADMIN";
export type CampaignStatus = "DRAFT" | "LIVE" | "ARCHIVED";
export type CommissionType = "FIXED" | "PERCENTAGE";
export type ApplicationStatus = "APPLIED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
export type CouponStatus = "ACTIVE" | "INACTIVE";

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
  profileImageUrl?: string;
}

export interface BrandProfile {
  id: string;
  userId: string;
  brandName: string;
  website?: string;
  instagramHandle?: string;
  category?: string;
  description?: string;
  logoImageUrl?: string;
}

export interface Campaign {
  id: string;
  brandProfileId: string;
  brandName?: string;
  brandInstagramHandle?: string;
  brandWebsite?: string;
  brandCategory?: string;
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
  applicationId: string;
  campaignId: string;
  campaignTitle: string;
  campaignProductImageUrl?: string;
  brandName?: string;
  campaignCategory?: string;
  campaignStatus?: CampaignStatus;
  campaignCommissionType?: CommissionType;
  campaignCommissionValue?: number;
  message?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  couponCode?: string;
  couponStatus?: CouponStatus;
  brandInstructions?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  couponAssignedAt?: string;
  couponDisabledAt?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface BrandApplication {
  applicationId: string;
  campaignId: string;
  campaignTitle: string;
  campaignCommissionType?: CommissionType;
  campaignCommissionValue?: number;
  creatorId: string;
  creatorName: string;
  creatorInstagramHandle?: string;
  creatorFollowerCount?: number;
  creatorCategory?: string;
  creatorCity?: string;
  creatorBio?: string;
  creatorProfileImageUrl?: string;
  message?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  couponCode?: string;
  couponStatus?: CouponStatus;
  brandInstructions?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  couponAssignedAt?: string;
  couponDisabledAt?: string;
  appliedAt: string;
  updatedAt: string;
}
