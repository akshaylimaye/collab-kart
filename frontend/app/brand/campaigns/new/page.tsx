"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, api } from "@/lib/api";
import type { CommissionType } from "@/lib/types";

export default function BrandCampaignNewPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", productName: "", description: "", category: "", productImageUrl: "", commissionType: "PERCENTAGE" as CommissionType, commissionValue: "" });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.createBrandCampaign({ ...form, commissionValue: Number(form.commissionValue) });
      router.push("/brand/dashboard");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to create campaign");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute role="BRAND">
      <AppShell>
        <section className="section">
          <Card className="max-w-3xl">
            <CardHeader><CardTitle>Create campaign</CardTitle><CardDescription>Campaigns are saved as drafts. Submit from the dashboard when ready for admin review.</CardDescription></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div className="space-y-2"><Label>Product name</Label><Input required value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></div></div>
                <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Category</Label><Input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div><div className="space-y-2"><Label>Product image URL</Label><Input value={form.productImageUrl} onChange={(e) => setForm({ ...form, productImageUrl: e.target.value })} /></div></div>
                <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Commission type</Label><Select value={form.commissionType} onChange={(e) => setForm({ ...form, commissionType: e.target.value as CommissionType })}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed</option></Select></div><div className="space-y-2"><Label>Commission value</Label><Input required type="number" min="1" step="0.01" value={form.commissionValue} onChange={(e) => setForm({ ...form, commissionValue: e.target.value })} /></div></div>
                <div className="space-y-2"><Label>Description</Label><Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                <Button disabled={saving}>{saving ? "Creating..." : "Create draft"}</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </AppShell>
    </ProtectedRoute>
  );
}
