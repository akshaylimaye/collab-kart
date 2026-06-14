/* eslint-disable @next/next/no-img-element */
"use client";

import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CommissionType } from "@/lib/types";
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
  actions
}: {
  initialValues?: Partial<BrandCampaignFormValues>;
  existingImageUrl?: string;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (payload: BrandCampaignSubmitPayload, intent: string) => Promise<void> | void;
  actions?: ReactNode;
}) {
  const [errors, setErrors] = useState<FormErrors<CampaignField>>({});
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl || "");
  const [form, setForm] = useState<BrandCampaignFormValues>({ ...emptyValues, ...initialValues, productImage: null });

  useEffect(() => {
    setForm({ ...emptyValues, ...initialValues, productImage: null });
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

  function validate() {
    const nextErrors: FormErrors<CampaignField> = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.productName.trim()) nextErrors.productName = "Product name is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (!form.commissionValue || Number(form.commissionValue) <= 0) nextErrors.commissionValue = "Commission value must be greater than zero.";
    if (form.productImage) {
      const error = imageError(form.productImage);
      if (error) nextErrors.productImage = error;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const intent = submitter?.getAttribute("data-intent") || "save";
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

  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><FieldError message={errors.title} /></div><div className="space-y-2"><Label htmlFor="productName">Product name</Label><Input id="productName" value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} /><FieldError message={errors.productName} /></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /><FieldError message={errors.category} /></div><div className="space-y-2"><Label htmlFor="commissionValue">Commission value</Label><Input id="commissionValue" type="number" min="1" step="0.01" value={form.commissionValue} onChange={(event) => setForm({ ...form, commissionValue: event.target.value })} /><FieldError message={errors.commissionValue} /></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="commissionType">Commission type</Label><Select id="commissionType" value={form.commissionType} onChange={(event) => setForm({ ...form, commissionType: event.target.value as CommissionType })}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed</option></Select></div><div className="space-y-2"><Label htmlFor="productImage">Product image</Label><label htmlFor="productImage" className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-primary/25 bg-white/70 px-3.5 py-2.5 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-white"><Upload className="h-4 w-4" />{form.productImage ? form.productImage.name : existingImageUrl ? "Replace product image" : "Choose JPG, PNG, or WEBP"}</label><Input id="productImage" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={onImageChange} /><FieldError message={errors.productImage} /><p className="text-xs text-muted-foreground">Required before publishing. Max size 5MB.</p></div></div>
      {previewUrl ? <div className="overflow-hidden rounded-2xl border border-white/70 shadow-sm"><img className="aspect-video w-full object-cover" src={previewUrl} alt="Selected product preview" /></div> : <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-white/60 text-center text-sm text-muted-foreground"><ImageIcon className="mb-2 h-8 w-8" />Product image preview will appear here.</div>}
      <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /><FieldError message={errors.description} /></div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button data-intent="save" disabled={submitting}>{submitting ? "Saving..." : submitLabel}</Button>
        {actions}
      </div>
    </form>
  );
}
