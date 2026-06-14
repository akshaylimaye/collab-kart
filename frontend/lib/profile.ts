import type { BrandProfile, CreatorProfile } from "@/lib/types";

type ProfileField<T> = {
  key: keyof T;
  label: string;
};

const creatorFields: ProfileField<Partial<CreatorProfile>>[] = [
  { key: "instagramHandle", label: "Instagram handle" },
  { key: "followerCount", label: "Follower count" },
  { key: "category", label: "Category" },
  { key: "bio", label: "Bio" },
  { key: "city", label: "City" }
];

const brandFields: ProfileField<Partial<BrandProfile>>[] = [
  { key: "brandName", label: "Brand name" },
  { key: "website", label: "Website" },
  { key: "instagramHandle", label: "Instagram handle" },
  { key: "category", label: "Category" },
  { key: "description", label: "Description" }
];

function hasValue(value: unknown) {
  if (typeof value === "number") return value >= 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

function completion<T extends Record<string, unknown>>(profile: Partial<T>, fields: ProfileField<Partial<T>>[]) {
  const missingFields = fields.filter((field) => !hasValue(profile[field.key])).map((field) => field.label);
  const completed = fields.length - missingFields.length;
  return {
    percentage: Math.round((completed / fields.length) * 100),
    missingFields,
    completed,
    total: fields.length
  };
}

export function getCreatorProfileCompletion(profile: Partial<CreatorProfile>) {
  return completion(profile, creatorFields);
}

export function getBrandProfileCompletion(profile: Partial<BrandProfile>) {
  return completion(profile, brandFields);
}
