/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, BadgeCheck, Camera, CheckCircle2, FileText, Globe2, HeartHandshake, ImagePlus, Languages, MapPin, PenLine, Sparkles, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FieldError } from "@/components/field-error";
import { LoadingState, ErrorState } from "@/components/page-state";
import { ProfileAvatar } from "@/components/profile-image";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, api } from "@/lib/api";
import { getClientError, type FormErrors } from "@/lib/form";
import type { CreatorProfile } from "@/lib/types";

type CreatorProfileField = "instagramHandle" | "followerCount" | "category" | "bio" | "city" | "profileImage";
type CreatorForm = { instagramHandle: string; followerCount: string; category: string; bio: string; city: string };

const CATEGORY_OPTIONS = ["Fashion & Lifestyle", "Beauty & Skincare", "Fitness & Health", "Food & Cooking", "Travel", "Technology", "Finance & Investing", "Comedy & Entertainment", "Other"].map((category) => ({ label: category, value: category === "Food & Cooking" ? "Food & Beverages" : category }));
const LANGUAGE_OPTIONS = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Gujarati", "Punjabi", "Other"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const EMPTY_FORM: CreatorForm = { instagramHandle: "", followerCount: "", category: "", bio: "", city: "" };

function normalizeCategory(category?: string) {
  if (!category?.trim()) return "";
  return CATEGORY_OPTIONS.some((option) => option.value === category.trim()) ? category.trim() : "Other";
}

function imageError(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Upload JPG, PNG, or WEBP only.";
  if (file.size > MAX_IMAGE_SIZE) return "Image must be 5MB or smaller.";
  return "";
}

function profileToForm(profile: CreatorProfile): CreatorForm {
  return {
    instagramHandle: profile.instagramHandle || "",
    followerCount: profile.followerCount ? String(profile.followerCount) : "",
    category: normalizeCategory(profile.category),
    bio: profile.bio || "",
    city: profile.city || ""
  };
}

function cleanInstagramHandle(handle: string) {
  return handle.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/$/, "");
}

function instagramUrl(handle: string) {
  const clean = cleanInstagramHandle(handle);
  return clean ? `https://instagram.com/${clean}` : "";
}

function completionFor(form: CreatorForm, displayName: string, imageUrl: string) {
  const items = [
    { label: "Display name", done: Boolean(displayName.trim()) },
    { label: "Instagram username", done: Boolean(form.instagramHandle.trim()) },
    { label: "City", done: Boolean(form.city.trim()) },
    { label: "Bio", done: Boolean(form.bio.trim()) },
    { label: "Follower count", done: Boolean(form.followerCount.trim()) && Number(form.followerCount) >= 0 },
    { label: "Category", done: Boolean(form.category.trim()) },
    { label: "Profile image", done: Boolean(imageUrl.trim()) }
  ];
  const completed = items.filter((item) => item.done).length;
  return { items, completed, total: items.length, percentage: Math.round((completed / items.length) * 100) };
}

export default function CreatorOnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<FormErrors<CreatorProfileField>>({});
  const [form, setForm] = useState<CreatorForm>(EMPTY_FORM);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const displayName = user?.name || "";
  const initials = (displayName || "CK").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const activeImageUrl = previewUrl || existingImageUrl;
  const completion = useMemo(() => completionFor(form, displayName, activeImageUrl), [activeImageUrl, displayName, form]);
  const profileUrl = instagramUrl(form.instagramHandle);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(existingImageUrl);
      return;
    }
    const next = URL.createObjectURL(profileImage);
    setPreviewUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [existingImageUrl, profileImage]);

  const loadProfile = useCallback(async function loadProfile() {
    setLoading(true);
    setLoadError("");
    try {
      const profile = await api.getCreatorProfile();
      if (completionFor(profileToForm(profile), displayName, profile.profileImageUrl || "").percentage === 100) {
        router.replace("/creator/campaigns");
        return;
      }
      setExists(true);
      setForm(profileToForm(profile));
      setExistingImageUrl(profile.profileImageUrl || "");
      setProfileImage(null);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setExists(false);
        setForm(EMPTY_FORM);
        setExistingImageUrl("");
        setProfileImage(null);
      } else {
        setLoadError(getClientError(err, "Unable to load creator profile"));
      }
    } finally {
      setLoading(false);
    }
  }, [displayName, router]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    const error = imageError(file);
    if (error) {
      event.target.value = "";
      setErrors({ ...errors, profileImage: error });
      return;
    }
    setProfileImage(file);
    setErrors(({ profileImage: _profileImage, ...rest }) => rest);
  }

  function validate() {
    const nextErrors: FormErrors<CreatorProfileField> = {};
    if (!form.instagramHandle.trim()) nextErrors.instagramHandle = "Instagram username is required.";
    if (!form.followerCount.trim()) nextErrors.followerCount = "Follower count is required.";
    if (form.followerCount && Number(form.followerCount) < 0) nextErrors.followerCount = "Follower count cannot be negative.";
    if (!form.category.trim()) nextErrors.category = "Please select a creator category.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!form.bio.trim()) nextErrors.bio = "Bio is required.";
    if (!activeImageUrl.trim()) nextErrors.profileImage = "Please upload a profile image.";
    if (profileImage) {
      const error = imageError(profileImage);
      if (error) nextErrors.profileImage = error;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      window.requestAnimationFrame(() => document.querySelector('[data-field-error="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, followerCount: Number(form.followerCount), instagramHandle: cleanInstagramHandle(form.instagramHandle), profileImage };
      await (exists ? api.updateCreatorProfile(payload) : api.createCreatorProfile(payload));
      toast({ title: "Creator profile saved", description: "You can now browse campaigns.", variant: "success" });
      router.push("/creator/campaigns");
    } catch (err) {
      toast({ title: "Unable to save profile", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute role="CREATOR">
      <AppShell>
        <section className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_34%),radial-gradient(circle_at_80%_0%,rgba(196,181,253,0.24),transparent_30%),linear-gradient(135deg,#fff,#f0fdfa_48%,#faf5ff)] py-6 md:py-10">
          <div className="container max-w-7xl space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_28px_80px_-48px_rgba(15,118,110,0.55)] backdrop-blur">
              <div className="h-2 bg-gradient-to-r from-primary via-purple-300 to-amber-200" />
              <div className="grid gap-5 p-5 md:grid-cols-[1fr_360px] md:items-center md:p-7">
                <div className="flex min-w-0 items-start gap-4">
                  <ProfileAvatar src={activeImageUrl} initials={initials} size="md" />
                  <div className="min-w-0 space-y-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Creator onboarding</Badge>
                    <h1 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">Instagram Creator Profile</h1>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">Create your professional creator profile and connect with brands looking for your unique content style.</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-border/70 bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-sm font-semibold"><span>Profile completion</span><span>{completion.percentage}%</span></div>
                  <div className="mt-3 h-3 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-300 transition-all" style={{ width: `${completion.percentage}%` }} /></div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">Complete all required profile details before browsing campaigns.</p>
                </div>
              </div>
            </div>

            {loading ? <LoadingState label="Preparing profile builder..." /> : loadError ? <ErrorState message={loadError} onRetry={loadProfile} /> : (
              <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={onSubmit} noValidate>
                <div className="space-y-6">
                  <OnboardingSection icon={<Sparkles className="h-5 w-5" />} title="Basic Info" accent="from-primary to-emerald-300">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Display name" htmlFor="displayName"><Input id="displayName" value={displayName} disabled className="bg-white/70" /></Field>
                      <Field label="Instagram username" htmlFor="instagramHandle" error={errors.instagramHandle}><Input id="instagramHandle" value={form.instagramHandle} onChange={(event) => setForm({ ...form, instagramHandle: event.target.value })} placeholder="yourhandle" /></Field>
                      <Field label="Instagram profile URL" htmlFor="instagramUrl"><Input id="instagramUrl" value={profileUrl} disabled placeholder="https://instagram.com/yourhandle" className="bg-white/70" /></Field>
                      <Field label="City" htmlFor="city" error={errors.city}><Input id="city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Pune" /></Field>
                      <div className="space-y-2 sm:col-span-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" className="min-h-28" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Describe your audience, content style, and products you like to promote." /><FieldError message={errors.bio} /></div>
                    </div>
                  </OnboardingSection>

                  <OnboardingSection icon={<UsersRound className="h-5 w-5" />} title="Audience & Engagement" accent="from-purple-300 to-primary">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Follower count" htmlFor="followerCount" error={errors.followerCount}><Input id="followerCount" type="number" min="0" value={form.followerCount} onChange={(event) => setForm({ ...form, followerCount: event.target.value })} placeholder="5000" /></Field>
                      <InfoPanel icon={<BadgeCheck className="h-4 w-4" />} title="Engagement rate" text="Not collected in the MVP profile yet. Add it later with backend support." />
                    </div>
                  </OnboardingSection>

                  <OnboardingSection icon={<FileText className="h-5 w-5" />} title="Content & Audience" accent="from-amber-200 to-primary">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Primary content category" htmlFor="category" error={errors.category}><Select id="category" value={form.category} options={CATEGORY_OPTIONS} onValueChange={(category) => { setForm({ ...form, category }); setErrors(({ category: _category, ...rest }) => rest); }} placeholder="Select creator category" searchable contentClassName="z-[9999] max-h-[340px]" /></Field>
                      <InfoPanel icon={<Languages className="h-4 w-4" />} title="Content languages" text={`Planned options: ${LANGUAGE_OPTIONS.slice(0, 5).join(", ")} and more.`} />
                      <div className="sm:col-span-2"><InfoPanel icon={<PenLine className="h-4 w-4" />} title="Future multi-select" text="CollabKart currently stores one primary category. This section is laid out so multi-category selection can be added when the API supports it." /></div>
                    </div>
                  </OnboardingSection>

                  <OnboardingSection icon={<HeartHandshake className="h-5 w-5" />} title="Collaboration Experience" accent="from-primary to-purple-300">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <PreferencePreview title="Affiliate/coupon campaigns" active />
                      <PreferencePreview title="Nano and micro brands" active />
                      <PreferencePreview title="Paid collaboration rates" />
                      <PreferencePreview title="Barter collaborations" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">Collaboration preferences and pricing are intentionally shown as future profile signals only after backend persistence is added.</p>
                    {/* TODO: Add persisted pricing and collaboration preference fields after backend support is added. */}
                  </OnboardingSection>
                </div>

                <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                  <Card className="overflow-visible rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm">
                    <CardHeader><CardTitle className="flex items-center gap-2"><ImagePlus className="h-5 w-5 text-primary" />Profile Image</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <label htmlFor="profileImage" className="flex cursor-pointer flex-col items-center rounded-3xl border border-dashed border-primary/35 bg-gradient-to-br from-white to-primary/5 p-6 text-center transition-colors hover:bg-white">
                        <ProfileAvatar src={activeImageUrl} initials={initials} size="lg" className="mb-4" />
                        <span className="font-semibold text-foreground">{activeImageUrl ? "Replace profile image" : "Upload profile image"}</span>
                        <span className="mt-1 text-xs leading-5 text-muted-foreground">Upload JPG, PNG, or WEBP. Max size 5MB.</span>
                      </label>
                      <Input id="profileImage" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} />
                      <FieldError message={errors.profileImage} />
                    </CardContent>
                  </Card>

                  <Card className="rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm"><CardContent className="space-y-3 p-5"><h2 className="font-semibold">Completion checklist</h2>{completion.items.map((item) => <ChecklistItem key={item.label} label={item.label} done={item.done} />)}</CardContent></Card>

                  <Card className="rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm"><CardContent className="space-y-3 p-5"><h2 className="font-semibold">Tips for a strong profile</h2><Tip icon={<AtSign className="h-4 w-4" />} text="Use the same Instagram username brands will search for." /><Tip icon={<MapPin className="h-4 w-4" />} text="Add your city so local brands can find you faster." /><Tip icon={<Globe2 className="h-4 w-4" />} text="Keep your bio specific: audience, content style, and product fit." /></CardContent></Card>

                  <div className="rounded-[1.75rem] border border-white/80 bg-white/95 p-4 shadow-sm"><Button className="w-full" size="lg" disabled={saving}>{saving ? "Saving..." : "Save & View Campaigns"}</Button><p className="mt-3 text-center text-xs leading-5 text-muted-foreground">No skip option: complete your profile to apply to campaigns.</p></div>
                </aside>
              </form>
            )}
          </div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}

function OnboardingSection({ icon, title, accent, children }: { icon: ReactNode; title: string; accent: string; children: ReactNode }) {
  return <Card className="overflow-visible rounded-[1.75rem] border-white/80 bg-white/90 shadow-sm"><div className={`h-1.5 rounded-t-[1.75rem] bg-gradient-to-r ${accent}`} /><CardHeader className="pb-3"><CardTitle className="flex items-center gap-3 text-xl"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</span>{title}</CardTitle></CardHeader><CardContent className="pt-0">{children}</CardContent></Card>;
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}<FieldError message={error} /></div>;
}

function InfoPanel({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-4 text-sm"><div className="mb-1 flex items-center gap-2 font-semibold text-foreground">{icon}{title}</div><p className="leading-6 text-muted-foreground">{text}</p></div>;
}

function PreferencePreview({ title, active = false }: { title: string; active?: boolean }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-white/75 p-3 text-sm"><span className="font-medium text-foreground">{title}</span><span className={active ? "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary" : "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"}>{active ? "Core" : "Later"}</span></div>;
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return <div className="flex items-center gap-2 text-sm"><CheckCircle2 className={done ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground/45"} /><span className={done ? "font-medium" : "text-muted-foreground"}>{label}</span></div>;
}

function Tip({ icon, text }: { icon: ReactNode; text: string }) {
  return <div className="flex items-start gap-2 rounded-2xl bg-secondary/45 p-3 text-sm leading-6 text-muted-foreground"><span className="mt-0.5 text-primary">{icon}</span><span>{text}</span></div>;
}
