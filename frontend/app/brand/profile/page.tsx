/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AtSign, Camera, CheckCircle2, Globe2, Store } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BrandLogo } from "@/components/profile-image";
import { FieldError } from "@/components/field-error";
import { ErrorState, LoadingState } from "@/components/page-state";
import { ProtectedRoute } from "@/components/protected-route";
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
import { getBrandProfileCompletion } from "@/lib/profile";
import type { BrandProfile } from "@/lib/types";

type BrandProfileField = "brandName" | "category" | "logoImage";
type Mode = "create" | "view" | "edit";
type BrandForm = { brandName: string; website: string; instagramHandle: string; category: string; description: string };

const CATEGORY_OPTIONS = ["Beauty & Skincare", "Fashion & Lifestyle", "Food & Beverages", "Fitness & Health", "Travel", "Technology", "Finance & Investing", "Comedy & Entertainment", "Other"].map((category) => ({ label: category, value: category }));
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const EMPTY_FORM: BrandForm = { brandName: "", website: "", instagramHandle: "", category: "", description: "" };

function normalizeCategory(category?: string) {
  if (!category?.trim()) return "";
  return CATEGORY_OPTIONS.some((option) => option.value === category.trim()) ? category.trim() : "Other";
}

function imageError(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Upload JPG, PNG, or WEBP only.";
  if (file.size > MAX_IMAGE_SIZE) return "Image must be 5MB or smaller.";
  return "";
}

function profileToForm(profile: BrandProfile): BrandForm {
  return {
    brandName: profile.brandName || "",
    website: profile.website || "",
    instagramHandle: profile.instagramHandle || "",
    category: normalizeCategory(profile.category),
    description: profile.description || ""
  };
}

function completionProfile(form: BrandForm, logoUrl: string): Partial<BrandProfile> {
  return { ...form, logoImageUrl: logoUrl };
}

export default function BrandProfilePage() {
  const { toast } = useToast();
  const [exists, setExists] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors<BrandProfileField>>({});
  const [loadError, setLoadError] = useState("");
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [form, setForm] = useState<BrandForm>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<BrandForm>(EMPTY_FORM);

  const displayLogoUrl = mode === "edit" || mode === "create" ? previewUrl : existingLogoUrl;
  const profilePreview = useMemo(() => completionProfile(form, displayLogoUrl), [displayLogoUrl, form]);
  const completion = getBrandProfileCompletion(profilePreview);
  const checklist = ["Brand name", "Website", "Instagram handle", "Category", "Description"];
  const initials = (form.brandName || "CK").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!logoImage) {
      setPreviewUrl(existingLogoUrl);
      return;
    }
    const next = URL.createObjectURL(logoImage);
    setPreviewUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [existingLogoUrl, logoImage]);

  async function loadProfile() {
    setLoading(true);
    setLoadError("");
    try {
      const profile = await api.getBrandProfile();
      const nextForm = profileToForm(profile);
      setExists(true);
      setMode("view");
      setExistingLogoUrl(profile.logoImageUrl || "");
      setLogoImage(null);
      setForm(nextForm);
      setSavedForm(nextForm);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setExists(false);
        setMode("create");
        setExistingLogoUrl("");
        setLogoImage(null);
        setForm(EMPTY_FORM);
        setSavedForm(EMPTY_FORM);
      } else {
        setLoadError(getClientError(err, "Unable to load brand profile"));
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
      setErrors({ ...errors, logoImage: error });
      return;
    }
    setLogoImage(file);
    setErrors(({ logoImage: _logoImage, ...rest }) => rest);
  }

  function validate() {
    const nextErrors: FormErrors<BrandProfileField> = {};
    if (!form.brandName.trim()) nextErrors.brandName = "Brand name is required.";
    if (!form.category.trim()) nextErrors.category = "Please select a brand category.";
    if (logoImage) {
      const error = imageError(logoImage);
      if (error) nextErrors.logoImage = error;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function cancelEdit() {
    setForm(savedForm);
    setLogoImage(null);
    setErrors({});
    setMode("view");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = { ...form, brandName: form.brandName.trim(), logoImage };
    try {
      const saved = exists ? await api.updateBrandProfile(payload) : await api.createBrandProfile(payload);
      const nextForm = profileToForm(saved);
      setExists(true);
      setMode("view");
      setExistingLogoUrl(saved.logoImageUrl || "");
      setLogoImage(null);
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
    <ProtectedRoute role="BRAND">
      <AppShell>
        <section className="section space-y-5 py-6 md:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">Brand profile</p>
              <h1 className="text-3xl font-semibold tracking-normal">{isCreating ? "Create brand profile" : "Brand details"}</h1>
              <p className="max-w-2xl text-muted-foreground">{isCreating ? "Add the brand details creators need before applying to your campaigns." : "This is the brand profile creators use to understand your campaigns."}</p>
            </div>
            {mode === "view" ? <Button onClick={() => setMode("edit")}>Edit profile</Button> : null}
          </div>

          {loading ? <LoadingState label="Loading profile..." /> : loadError ? <ErrorState message={loadError} onRetry={loadProfile} /> : mode === "view" ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <Card className="overflow-hidden">
                <CardContent className="p-5 md:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <BrandLogo src={existingLogoUrl} initials={initials} size="lg" />
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold tracking-normal">{form.brandName || "Brand profile"}</h2>
                          <Badge variant={completion.percentage === 100 ? "default" : "warning"}>{completion.percentage}% complete</Badge>
                        </div>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{form.description.trim() || "Add a description so creators understand your brand and campaign style."}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <ProfileFact icon={<Globe2 className="h-4 w-4" />} label="Website" value={form.website || "Not added"} />
                        <ProfileFact icon={<AtSign className="h-4 w-4" />} label="Instagram" value={form.instagramHandle || "Not added"} />
                        <ProfileFact icon={<Store className="h-4 w-4" />} label="Category" value={form.category || "Not added"} />
                      </div>
                      <Badge variant={form.category ? "secondary" : "outline"}>{form.category || "Category not added"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <ReadinessCard title="Profile completeness" completion={completion} checklist={checklist} />
            </div>
          ) : (
            <Card id="profile-form" className="mx-auto w-full max-w-3xl overflow-visible">
              <CardHeader className="p-5 pb-2">
                <CardTitle>{isCreating ? "Create brand profile" : "Edit profile"}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="logoImage">Brand logo</Label>
                    <label htmlFor="logoImage" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-primary/30 bg-white/75 p-3 text-sm text-muted-foreground hover:bg-white">
                      <BrandLogo src={previewUrl} initials={initials} size="sm" className="border-0" />
                      <span><span className="block font-semibold text-foreground">{previewUrl ? "Replace brand logo" : "Upload brand logo"}</span><span className="text-xs">Upload JPG, PNG, or WEBP. Max size 5MB.</span></span>
                      <Camera className="ml-auto h-4 w-4 text-primary" />
                    </label>
                    <Input id="logoImage" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} />
                    <FieldError message={errors.logoImage} />
                  </div>
                  <div className="space-y-2"><Label htmlFor="brandName">Brand name</Label><Input id="brandName" value={form.brandName} onChange={(event) => setForm({ ...form, brandName: event.target.value })} /><FieldError message={errors.brandName} /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="website">Website</Label><Input id="website" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder="https://example.com" /></div>
                    <div className="space-y-2"><Label htmlFor="instagramHandle">Instagram handle</Label><Input id="instagramHandle" value={form.instagramHandle} onChange={(event) => setForm({ ...form, instagramHandle: event.target.value })} placeholder="@brand" /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="category">Category</Label><Select id="category" value={form.category} options={CATEGORY_OPTIONS} onValueChange={(category) => { setForm({ ...form, category }); setErrors(({ category: _category, ...rest }) => rest); }} placeholder="Select brand category" /><FieldError message={errors.category} /></div>
                  <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" className="min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe your brand and campaign style." /></div>
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

function ReadinessCard({ title, completion, checklist }: { title: string; completion: ReturnType<typeof getBrandProfileCompletion>; checklist: string[] }) {
  if (completion.percentage === 100) {
    return <Card><CardContent className="space-y-2 p-5"><Badge>100% complete</Badge><h3 className="text-lg font-semibold">Your profile is ready.</h3><p className="text-sm text-muted-foreground">Creators have the key details they need to understand your brand.</p></CardContent></Card>;
  }
  return <Card><CardHeader className="p-5 pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="grid gap-2 p-5 pt-0">{checklist.map((item) => { const done = !completion.missingFields.includes(item); return <div key={item} className="flex items-center gap-2 rounded-xl border border-border/70 bg-white/70 px-3 py-2 text-sm"><CheckCircle2 className={done ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground/55"} /><span className={done ? "font-medium text-foreground" : "text-muted-foreground"}>{item}</span></div>; })}</CardContent></Card>;
}
