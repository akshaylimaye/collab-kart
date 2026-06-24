/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AtSign, Camera, CheckCircle2, FileText, Globe2, Package, Sparkles, Store } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FieldError } from "@/components/field-error";
import { LoadingState, ErrorState } from "@/components/page-state";
import { BrandLogo } from "@/components/profile-image";
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

type BrandProfileField = "brandName" | "website" | "instagramHandle" | "category" | "description" | "logoImage";
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

export default function BrandOnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<FormErrors<BrandProfileField>>({});
  const [form, setForm] = useState<BrandForm>(EMPTY_FORM);
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const initials = (form.brandName || "CK").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const completion = getBrandProfileCompletion(useMemo(() => completionProfile(form, previewUrl || existingLogoUrl), [existingLogoUrl, form, previewUrl]));
  const checklist = ["Brand name", "Website", "Instagram handle", "Category", "Description"];

  useEffect(() => {
    if (!logoImage) {
      setPreviewUrl(existingLogoUrl);
      return;
    }
    const next = URL.createObjectURL(logoImage);
    setPreviewUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [existingLogoUrl, logoImage]);

  const loadProfile = useCallback(async function loadProfile() {
    setLoading(true);
    setLoadError("");
    try {
      const profile = await api.getBrandProfile();
      if (getBrandProfileCompletion(profile).percentage === 100) {
        router.replace("/brand/dashboard");
        return;
      }
      setExists(true);
      setForm(profileToForm(profile));
      setExistingLogoUrl(profile.logoImageUrl || "");
      setLogoImage(null);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setExists(false);
        setForm(EMPTY_FORM);
        setExistingLogoUrl("");
        setLogoImage(null);
      } else {
        setLoadError(getClientError(err, "Unable to load brand profile"));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

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
    if (!form.website.trim()) nextErrors.website = "Brand website is required.";
    if (!form.instagramHandle.trim()) nextErrors.instagramHandle = "Instagram handle is required.";
    if (!form.category.trim()) nextErrors.category = "Please select a brand category.";
    if (!form.description.trim()) nextErrors.description = "Brand description is required.";
    if (logoImage) {
      const error = imageError(logoImage);
      if (error) nextErrors.logoImage = error;
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
      const payload = { ...form, brandName: form.brandName.trim(), logoImage };
      await (exists ? api.updateBrandProfile(payload) : api.createBrandProfile(payload));
      toast({ title: "Brand profile saved", description: "You can now create your first campaign.", variant: "success" });
      router.push("/brand/campaigns/new");
    } catch (err) {
      toast({ title: "Unable to save profile", description: getClientError(err, "Try again later"), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute role="BRAND">
      <AppShell>
        <section className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,250,0.88)_45%,rgba(245,243,255,0.9))] py-6 md:py-10">
          <div className="container max-w-6xl space-y-6">
            <div className="flex flex-col gap-5 rounded-3xl border border-white/80 bg-white/82 p-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between md:p-6">
              <div className="flex min-w-0 items-center gap-4">
                <BrandLogo src={previewUrl || existingLogoUrl} initials={initials} size="md" />
                <div className="min-w-0">
                  <Badge className="mb-2">Brand onboarding</Badge>
                  <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">Create your brand profile</h1>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Creators need to understand your brand before they apply to your campaigns.</p>
                </div>
              </div>
              <div className="w-full md:max-w-xs">
                <div className="flex items-center justify-between text-sm font-medium"><span>Profile completion</span><span>{completion.percentage}%</span></div>
                <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completion.percentage}%` }} /></div>
              </div>
            </div>

            {loading ? <LoadingState label="Preparing onboarding..." /> : loadError ? <ErrorState message={loadError} onRetry={loadProfile} /> : (
              <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]" onSubmit={onSubmit} noValidate>
                <div className="space-y-6">
                  <Card className="overflow-visible"><CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5 text-primary" />Brand Info</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="brandName">Brand name</Label><Input id="brandName" value={form.brandName} onChange={(event) => setForm({ ...form, brandName: event.target.value })} placeholder="Your brand" /><FieldError message={errors.brandName} /></div>
                    <div className="space-y-2"><Label htmlFor="website">Brand website</Label><Input id="website" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder="https://example.com" /><FieldError message={errors.website} /></div>
                    <div className="space-y-2"><Label htmlFor="category">Brand category</Label><Select id="category" value={form.category} options={CATEGORY_OPTIONS} onValueChange={(category) => { setForm({ ...form, category }); setErrors(({ category: _category, ...rest }) => rest); }} placeholder="Select brand category" /><FieldError message={errors.category} /></div>
                    <div className="space-y-2"><Label htmlFor="instagramHandle">Instagram handle</Label><Input id="instagramHandle" value={form.instagramHandle} onChange={(event) => setForm({ ...form, instagramHandle: event.target.value })} placeholder="brand.handle" /><FieldError message={errors.instagramHandle} /></div>
                    <div className="space-y-2 sm:col-span-2"><Label htmlFor="description">Brand description</Label><Textarea id="description" className="min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe your brand, products, and creator campaign style." /><FieldError message={errors.description} /></div>
                  </CardContent></Card>

                  <Card className="overflow-visible"><CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Campaign Readiness</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-3">
                    <ReadinessHint icon={<Package className="h-4 w-4" />} title="Products" text="Add product details when you create a campaign." />
                    <ReadinessHint icon={<Globe2 className="h-4 w-4" />} title="Brand trust" text="Website and Instagram help creators evaluate fit." />
                    <ReadinessHint icon={<AtSign className="h-4 w-4" />} title="Creator fit" text="Category helps creators find relevant campaigns." />
                  </CardContent></Card>
                </div>

                <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                  <Card className="overflow-visible"><CardHeader><CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary" />Brand Identity</CardTitle></CardHeader><CardContent className="space-y-3">
                    <label htmlFor="logoImage" className="flex cursor-pointer flex-col items-center rounded-3xl border border-dashed border-primary/30 bg-white/70 p-5 text-center hover:bg-white">
                      <BrandLogo src={previewUrl} initials={initials} size="lg" className="mb-3" />
                      <span className="font-semibold text-foreground">{previewUrl ? "Replace brand logo" : "Upload brand logo"}</span>
                      <span className="mt-1 text-xs leading-5 text-muted-foreground">Upload JPG, PNG, or WEBP. Max size 5MB.</span>
                    </label>
                    <Input id="logoImage" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} />
                    <FieldError message={errors.logoImage} />
                  </CardContent></Card>

                  <Card><CardContent className="space-y-3 p-5"><h2 className="font-semibold">Completion checklist</h2>{checklist.map((item) => { const done = !completion.missingFields.includes(item); return <div key={item} className="flex items-center gap-2 text-sm"><CheckCircle2 className={done ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground/45"} /><span className={done ? "font-medium" : "text-muted-foreground"}>{item}</span></div>; })}</CardContent></Card>

                  <div className="rounded-3xl border border-white/80 bg-white/90 p-4 shadow-sm"><Button className="w-full" size="lg" disabled={saving}>{saving ? "Saving..." : "Save & Create Campaign"}</Button><p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Complete your brand profile before launching campaigns.</p></div>
                </aside>
              </form>
            )}
          </div>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}

function ReadinessHint({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-border/70 bg-white/70 p-3 text-sm"><div className="mb-2 flex items-center gap-2 font-semibold text-foreground">{icon}{title}</div><p className="leading-5 text-muted-foreground">{text}</p></div>;
}
