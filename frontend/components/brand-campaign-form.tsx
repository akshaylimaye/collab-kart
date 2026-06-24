"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import { BadgeIndianRupee, FileText, ImageIcon, Package, Send, Upload } from "lucide-react";
import { FieldError } from "@/components/field-error";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCommission } from "@/lib/format";
import type { CampaignStatus, CommissionType } from "@/lib/types";
import type { FormErrors } from "@/lib/form";

export type BrandCampaignFormValues = {
  title: string;
  productName: string;
  description: string;
  category: string;
  productImage: File | null;
  commissionType: CommissionType;
  commissionValue: string;
};

export type BrandCampaignSubmitPayload = {
  title: string;
  productName: string;
  description: string;
  category: string;
  productImage: File | null;
  commissionType: CommissionType;
  commissionValue: number;
};

type CampaignField = "title" | "productName" | "description" | "category" | "commissionValue" | "productImage";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const CATEGORY_OPTIONS = [
  "Beauty & Skincare",
  "Fashion & Lifestyle",
  "Food & Beverages",
  "Fitness & Health",
  "Travel",
  "Technology",
  "Finance & Investing",
  "Comedy & Entertainment",
  "Other"
];

function normalizeCategory(category?: string) {
  if (!category?.trim()) return "";
  return CATEGORY_OPTIONS.includes(category.trim()) ? category.trim() : "Other";
}

const emptyValues: BrandCampaignFormValues = {
  title: "",
  productName: "",
  description: "",
  category: "",
  productImage: null,
  commissionType: "PERCENTAGE",
  commissionValue: ""
};

export function BrandCampaignForm({
  initialValues,
  existingImageUrl,
  submitLabel,
  submitting,
  onSubmit,
  actions,
  status = "DRAFT"
}: {
  initialValues?: Partial<BrandCampaignFormValues>;
  existingImageUrl?: string;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (payload: BrandCampaignSubmitPayload, intent: string) => Promise<void> | void;
  actions?: ReactNode;
  status?: CampaignStatus;
}) {
  const [errors, setErrors] = useState<FormErrors<CampaignField>>({});
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl || "");
  const [form, setForm] = useState<BrandCampaignFormValues>({ ...emptyValues, ...initialValues, category: normalizeCategory(initialValues?.category), productImage: null });

  useEffect(() => {
    setForm({ ...emptyValues, ...initialValues, category: normalizeCategory(initialValues?.category), productImage: null });
    setPreviewUrl(existingImageUrl || "");
    setErrors({});
  }, [existingImageUrl, initialValues]);

  useEffect(() => {
    if (!form.productImage) {
      setPreviewUrl(existingImageUrl || "");
      return;
    }
    const nextPreviewUrl = URL.createObjectURL(form.productImage);
    setPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [existingImageUrl, form.productImage]);

  function imageError(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Product image must be a JPG, JPEG, PNG, or WEBP file.";
    if (file.size > MAX_IMAGE_SIZE) return "Product image must be 5MB or smaller.";
    return "";
  }

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setForm({ ...form, productImage: null });
      setErrors(({ productImage, ...rest }) => rest);
      return;
    }
    const error = imageError(file);
    if (error) {
      event.target.value = "";
      setForm({ ...form, productImage: null });
      setErrors({ ...errors, productImage: error });
      return;
    }
    setForm({ ...form, productImage: file });
    setErrors(({ productImage, ...rest }) => rest);
  }

  function validate(intent: string) {
    const nextErrors: FormErrors<CampaignField> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.productName.trim()) nextErrors.productName = "Product name is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!form.category.trim()) nextErrors.category = "Please select a category.";
    if (!form.commissionValue || Number(form.commissionValue) <= 0) nextErrors.commissionValue = "Commission value must be greater than zero.";
    if (intent === "publish" && !form.productImage && !existingImageUrl) nextErrors.productImage = "Please upload a product image before publishing.";
    if (form.productImage) {
      const error = imageError(form.productImage);
      if (error) nextErrors.productImage = error;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      window.requestAnimationFrame(() => document.querySelector('[data-field-error="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const intent = submitter?.getAttribute("data-intent") || "save";
    if (!validate(intent)) return;
    await onSubmit({
      title: form.title.trim(),
      productName: form.productName.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      productImage: form.productImage,
      commissionType: form.commissionType,
      commissionValue: Number(form.commissionValue)
    }, intent);
  }

  const previewCommission = form.commissionValue && Number(form.commissionValue) > 0 ? formatCommission(form.commissionType, Number(form.commissionValue)) : "Commission not set";

  return (
    <form className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-8" onSubmit={submit} noValidate>
      <div className="min-w-0 space-y-6 xl:space-y-8">
        <Card className="relative z-40 overflow-visible">
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" />Campaign Basics</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="title">Campaign title</Label><Input id="title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><FieldError message={errors.title} /></div>
            <div className="space-y-2"><Label htmlFor="productName">Product name</Label><Input id="productName" value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} /><FieldError message={errors.productName} /></div>
            <div className="space-y-2 sm:col-span-1"><Label htmlFor="category">Category</Label><Select id="category" value={form.category} options={CATEGORY_OPTIONS.map((category) => ({ label: category, value: category }))} onValueChange={(category) => { setForm({ ...form, category }); setErrors(({ category: _category, ...rest }) => rest); }} placeholder="Select category" /><FieldError message={errors.category} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" />Product Image</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <label htmlFor="productImage" className="flex min-w-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/30 bg-white/75 px-4 py-5 text-center text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/45 hover:bg-white sm:px-5 sm:py-6"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Upload className="h-5 w-5" /></span><span className="max-w-full break-words font-semibold text-foreground">{form.productImage ? form.productImage.name : existingImageUrl ? "Replace product image" : "Upload product image"}</span><span className="text-xs leading-5">JPG, PNG, or WEBP up to 5MB. Click to choose from your device.</span></label>
            <Input id="productImage" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} />
            <FieldError message={errors.productImage} />
            <p className="text-xs text-muted-foreground">Required before publishing. Max size 5MB.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BadgeIndianRupee className="h-5 w-5 text-primary" />Commission</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="commissionType">Commission type</Label><Select id="commissionType" value={form.commissionType} options={[{ label: "Percentage", value: "PERCENTAGE" }, { label: "Fixed", value: "FIXED" }]} onValueChange={(value) => setForm({ ...form, commissionType: value as CommissionType })} /></div>
            <div className="space-y-2"><Label htmlFor="commissionValue">Commission value</Label><Input id="commissionValue" type="number" min="1" step="0.01" value={form.commissionValue} onChange={(event) => setForm({ ...form, commissionValue: event.target.value })} /><FieldError message={errors.commissionValue} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Description</CardTitle></CardHeader>
          <CardContent className="space-y-2"><Label htmlFor="description">Campaign brief</Label><Textarea id="description" className="min-h-36" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><FieldError message={errors.description} /></CardContent>
        </Card>

      </div>

      <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:h-fit">
        <Card className="overflow-hidden">
          <div className="relative aspect-[4/3] bg-secondary/55">
            {previewUrl ? (
              <ProductImage src={previewUrl} alt={form.productName || "Campaign product preview"} category={form.category} variant="preview" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6 text-center text-muted-foreground">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-border/70">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </span>
                <span className="text-sm font-semibold text-foreground">Product image preview</span>
                <span className="max-w-48 text-xs leading-5">Upload an image to preview your campaign.</span>
              </div>
            )}
          </div>
          <CardContent className="space-y-3 p-4">
            <div className="space-y-1"><p className="text-sm font-medium text-primary">Campaign preview</p><h3 className="line-clamp-2 text-lg font-semibold">{form.title || "Campaign title"}</h3><p className="text-sm text-muted-foreground">{form.productName || "Product name"}</p></div>
            <div className="flex flex-wrap gap-2"><Badge variant="secondary">{form.category || "Category"}</Badge><Badge>{previewCommission}</Badge><Badge variant="outline">{status}</Badge></div>
            <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">{form.description || "Campaign description preview will appear here."}</p>
          </CardContent>
        </Card>
        <Card className="sticky bottom-3 z-20 border-primary/15 shadow-lg max-xl:mx-[-0.25rem] xl:static">
          <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" />Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button data-intent="save" disabled={submitting}>{submitting ? "Saving..." : submitLabel}</Button>
            {actions}
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}
