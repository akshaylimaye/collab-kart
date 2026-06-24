/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AtSign, BadgeCheck, Camera, CheckCircle2, Clock3, ExternalLink, FileText, MapPin, UsersRound, XCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProfileAvatar } from "@/components/profile-image";
import { FieldError } from "@/components/field-error";
import { ErrorState, LoadingState } from "@/components/page-state";
import { ProtectedRoute } from "@/components/protected-route";
import { StatusBadge } from "@/components/status-badge";
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
import { formatDate } from "@/lib/format";
import { getClientError, type FormErrors } from "@/lib/form";
import { getCreatorProfileCompletion } from "@/lib/profile";
import type { CampaignApplication, CreatorProfile } from "@/lib/types";

type CreatorProfileField = "followerCount" | "category" | "profileImage";
type Mode = "create" | "view" | "edit";
type CreatorForm = { instagramHandle: string; followerCount: string; category: string; bio: string; city: string };

const CATEGORY_OPTIONS = ["Beauty & Skincare", "Fashion & Lifestyle", "Food & Beverages", "Fitness & Health", "Travel", "Technology", "Finance & Investing", "Comedy & Entertainment", "Other"].map((category) => ({ label: category, value: category }));
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

function completionProfile(form: CreatorForm, imageUrl: string): Partial<CreatorProfile> {
  return {
    instagramHandle: form.instagramHandle,
    followerCount: form.followerCount ? Number(form.followerCount) : undefined,
    category: form.category,
    bio: form.bio,
    city: form.city,
    profileImageUrl: imageUrl
  };
}

function instagramUrl(handle: string) {
  const clean = handle.trim().replace(/^@/, "");
  return clean ? `https://www.instagram.com/${encodeURIComponent(clean)}/` : "";
}

export default function CreatorProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exists, setExists] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors<CreatorProfileField>>({});
  const [loadError, setLoadError] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [form, setForm] = useState<CreatorForm>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<CreatorForm>(EMPTY_FORM);

  const displayImageUrl = mode === "edit" || mode === "create" ? previewUrl : existingImageUrl;
  const profilePreview = useMemo(() => completionProfile(form, displayImageUrl), [displayImageUrl, form]);
  const completion = getCreatorProfileCompletion(profilePreview);
  const initials = (user?.name || "CK").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const checklist = ["Instagram handle", "Follower count", "Category", "Bio", "City"];
  const applicationSummary = useMemo(() => ({
    total: applications.length,
    accepted: applications.filter((application) => application.status === "ACCEPTED").length,
    pending: applications.filter((application) => application.status === "APPLIED").length,
    rejected: applications.filter((application) => application.status === "REJECTED").length
  }), [applications]);
  const recentApplications = applications.slice(0, 3);
  const instagramHref = instagramUrl(form.instagramHandle);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(existingImageUrl);
      return;
    }
    const next = URL.createObjectURL(profileImage);
    setPreviewUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [existingImageUrl, profileImage]);

  async function loadProfile() {
    setLoading(true);
    setLoadError("");
    setApplicationError("");
    try {
      const profile = await api.getCreatorProfile();
      const nextForm = profileToForm(profile);
      setExists(true);
      setMode("view");
      setExistingImageUrl(profile.profileImageUrl || "");
      setProfileImage(null);
      setForm(nextForm);
      setSavedForm(nextForm);
      try {
        setApplications(await api.getCreatorApplications());
      } catch (err) {
        setApplications([]);
        setApplicationError(getClientError(err, "Unable to load application summary"));
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setExists(false);
        setMode("create");
        setExistingImageUrl("");
        setProfileImage(null);
        setForm(EMPTY_FORM);
        setSavedForm(EMPTY_FORM);
        setApplications([]);
      } else {
        setLoadError(getClientError(err, "Unable to load creator profile"));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadProfile(); }, []);

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
    if (form.followerCount && Number(form.followerCount) < 0) nextErrors.followerCount = "Follower count cannot be negative.";
    if (!form.category.trim()) nextErrors.category = "Please select a creator category.";
    if (profileImage) {
      const error = imageError(profileImage);
      if (error) nextErrors.profileImage = error;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function cancelEdit() {
    setForm(savedForm);
    setProfileImage(null);
    setErrors({});
    setMode("view");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, followerCount: form.followerCount ? Number(form.followerCount) : undefined, profileImage };
    try {
      const saved = exists ? await api.updateCreatorProfile(payload) : await api.createCreatorProfile(payload);
      const nextForm = profileToForm(saved);
      setExists(true);
      setMode("view");
      setExistingImageUrl(saved.profileImageUrl || "");
      setProfileImage(null);
      setForm(nextForm);
      setSavedForm(nextForm);
      toast({ title: "Profile saved", variant: "success" });
    } catch (err) {
      toast({ title: "Unable to save profile", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  const isEditing = mode === "edit";
  const isCreating = mode === "create";

  return (
    <ProtectedRoute role="CREATOR">
      <AppShell>
        <section className="section space-y-5 py-6 md:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Creator profile</p>
              <h1 className="text-3xl font-semibold tracking-normal">{isCreating ? "Create creator profile" : "Profile details"}</h1>
              <p className="max-w-2xl text-muted-foreground">{isCreating ? "Add the details brands need before reviewing your applications." : "This is the profile brands see when reviewing your applications."}</p>
            </div>
            {mode === "view" ? <Button onClick={() => setMode("edit")}>Edit profile</Button> : null}
          </div>

          {loading ? <LoadingState label="Loading profile..." /> : loadError ? <ErrorState message={loadError} onRetry={loadProfile} /> : mode === "view" ? (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
              <div className="space-y-5">
              <Card className="overflow-hidden">
                <CardContent className="p-5 md:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <ProfileAvatar src={existingImageUrl} initials={initials} size="lg" />
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold tracking-normal">{user?.name || "Creator profile"}</h2>
                          <Badge variant={completion.percentage === 100 ? "default" : "warning"}>{completion.percentage}% complete</Badge>
                        </div>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{form.bio.trim() || "Add a short bio so brands can understand your content style."}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <ProfileFact icon={<AtSign className="h-4 w-4" />} label="Instagram" value={form.instagramHandle || "Not added"} />
                        <ProfileFact icon={<UsersRound className="h-4 w-4" />} label="Followers" value={form.followerCount ? Number(form.followerCount).toLocaleString("en-IN") : "Not added"} />
                        <ProfileFact icon={<MapPin className="h-4 w-4" />} label="City" value={form.city || "Not added"} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={form.category ? "secondary" : "outline"}>{form.category || "Category not added"}</Badge>
                        {instagramHref ? <Button asChild variant="outline" size="sm"><a href={instagramHref} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Open Instagram</a></Button> : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"><CardTitle>Application summary</CardTitle><Button asChild variant="outline" size="sm"><Link href="/creator/applications">View applications</Link></Button></CardHeader>
                <CardContent>
                  {applicationError ? <p className="text-sm text-muted-foreground">{applicationError}</p> : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <SummaryItem icon={<FileText className="h-4 w-4" />} label="Submitted" value={applicationSummary.total} />
                      <SummaryItem icon={<BadgeCheck className="h-4 w-4" />} label="Accepted" value={applicationSummary.accepted} />
                      <SummaryItem icon={<Clock3 className="h-4 w-4" />} label="Pending" value={applicationSummary.pending} />
                      <SummaryItem icon={<XCircle className="h-4 w-4" />} label="Rejected" value={applicationSummary.rejected} />
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
              <div className="space-y-5">
                <ReadinessCard title="Profile completeness" completion={completion} checklist={checklist} />
                <Card>
                  <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"><CardTitle>Recent applications</CardTitle><Button asChild variant="outline" size="sm"><Link href="/creator/applications">View applications</Link></Button></CardHeader>
                  <CardContent className="space-y-3">
                    {applicationError ? <p className="text-sm text-muted-foreground">{applicationError}</p> : recentApplications.length === 0 ? <p className="text-sm text-muted-foreground">No applications yet. Apply to a live campaign and your latest submissions will appear here.</p> : recentApplications.map((application) => (
                      <Link key={application.applicationId} href={`/creator/applications?status=${application.status}`} className="block rounded-2xl border border-border/70 bg-white/70 p-3.5 shadow-sm transition-colors hover:border-primary/30 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <div className="flex items-start justify-between gap-3"><p className="line-clamp-2 font-medium leading-snug">{application.campaignTitle}</p><StatusBadge status={application.status} /></div>
                        <p className="mt-1 text-xs text-muted-foreground">Applied {formatDate(application.appliedAt)}</p>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card id="profile-form" className="mx-auto w-full max-w-3xl overflow-visible">
              <CardHeader className="p-5 pb-2">
                <CardTitle>{isCreating ? "Create creator profile" : "Edit profile"}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="profileImage">Profile image</Label>
                    <label htmlFor="profileImage" className="flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-white/75 p-3 text-sm text-muted-foreground hover:bg-white">
                      <ProfileAvatar src={previewUrl} initials={initials} size="sm" className="border-0" />
                      <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-foreground">{previewUrl ? "Replace profile image" : "Upload profile image"}</span><span className="text-xs leading-5">Upload JPG, PNG, or WEBP. Max size 5MB.</span></span>
                      <Camera className="h-4 w-4 shrink-0 text-primary" />
                    </label>
                    <Input id="profileImage" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} />
                    <FieldError message={errors.profileImage} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="instagramHandle">Instagram handle</Label><Input id="instagramHandle" value={form.instagramHandle} onChange={(event) => setForm({ ...form, instagramHandle: event.target.value })} placeholder="@yourhandle" /></div>
                    <div className="space-y-2"><Label htmlFor="followerCount">Follower count</Label><Input id="followerCount" type="number" min="0" value={form.followerCount} onChange={(event) => setForm({ ...form, followerCount: event.target.value })} /><FieldError message={errors.followerCount} /></div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="category">Category</Label><Select id="category" value={form.category} options={CATEGORY_OPTIONS} onValueChange={(category) => { setForm({ ...form, category }); setErrors(({ category: _category, ...rest }) => rest); }} placeholder="Select creator category" /><FieldError message={errors.category} /></div>
                    <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" className="min-h-24" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Describe your audience, content style, and the products you like to promote." /></div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    {isEditing ? <Button type="button" variant="outline" onClick={cancelEdit}>Cancel</Button> : null}
                    <Button disabled={saving}>{saving ? "Saving..." : isCreating ? "Create profile" : "Update profile"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}

function ProfileFact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-border/70 bg-white/70 p-3 text-sm"><div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{icon}{label}</div><div className="truncate font-semibold text-foreground">{value}</div></div>;
}

function SummaryItem({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return <div className="rounded-2xl border border-border/70 bg-white/70 p-3 shadow-sm"><div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{icon}{label}</div><p className="text-2xl font-semibold">{value}</p></div>;
}

function ReadinessCard({ title, completion, checklist }: { title: string; completion: ReturnType<typeof getCreatorProfileCompletion>; checklist: string[] }) {
  if (completion.percentage === 100) {
    return <Card><CardContent className="space-y-2 p-5"><Badge>100% complete</Badge><h3 className="text-lg font-semibold">Your profile is ready.</h3><p className="text-sm text-muted-foreground">Brands have the key details they need to review your applications.</p></CardContent></Card>;
  }
  return <Card><CardHeader className="p-5 pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="grid gap-2 p-5 pt-0">{checklist.map((item) => { const done = !completion.missingFields.includes(item); return <div key={item} className="flex items-center gap-2 rounded-xl border border-border/70 bg-white/70 px-3 py-2 text-sm"><CheckCircle2 className={done ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground/55"} /><span className={done ? "font-medium text-foreground" : "text-muted-foreground"}>{item}</span></div>; })}</CardContent></Card>;
}
