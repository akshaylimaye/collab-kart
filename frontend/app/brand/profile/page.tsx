"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError, api } from "@/lib/api";

export default function BrandProfilePage() {
  const [exists, setExists] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ brandName: "", website: "", instagramHandle: "", category: "", description: "" });

  useEffect(() => {
    api.getBrandProfile().then((profile) => {
      setExists(true);
      setForm({ brandName: profile.brandName || "", website: profile.website || "", instagramHandle: profile.instagramHandle || "", category: profile.category || "", description: profile.description || "" });
    }).catch(() => setExists(false));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      exists ? await api.updateBrandProfile(form) : await api.createBrandProfile(form);
      setExists(true);
      setMessage("Profile saved.");
    } catch (err) {
      setMessage(err instanceof ApiClientError ? err.message : "Unable to save profile");
    }
  }

  return (
    <ProtectedRoute role="BRAND"><AppShell><section className="section"><Card className="max-w-2xl"><CardHeader><CardTitle>Brand profile</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2"><Label>Brand name</Label><Input required value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Website</Label><Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div><div className="space-y-2"><Label>Instagram handle</Label><Input value={form.instagramHandle} onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })} /></div></div>
      <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}<Button>{exists ? "Update profile" : "Create profile"}</Button>
    </form></CardContent></Card></section></AppShell></ProtectedRoute>
  );
}
