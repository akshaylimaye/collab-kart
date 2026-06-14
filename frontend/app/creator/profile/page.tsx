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

export default function CreatorProfilePage() {
  const [exists, setExists] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ instagramHandle: "", followerCount: "", category: "", bio: "", city: "" });

  useEffect(() => {
    api.getCreatorProfile().then((profile) => {
      setExists(true);
      setForm({
        instagramHandle: profile.instagramHandle || "",
        followerCount: profile.followerCount ? String(profile.followerCount) : "",
        category: profile.category || "",
        bio: profile.bio || "",
        city: profile.city || ""
      });
    }).catch(() => setExists(false));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const payload = { ...form, followerCount: form.followerCount ? Number(form.followerCount) : undefined };
    try {
      exists ? await api.updateCreatorProfile(payload) : await api.createCreatorProfile(payload);
      setExists(true);
      setMessage("Profile saved.");
    } catch (err) {
      setMessage(err instanceof ApiClientError ? err.message : "Unable to save profile");
    }
  }

  return (
    <ProtectedRoute role="CREATOR"><AppShell><section className="section"><Card className="max-w-2xl"><CardHeader><CardTitle>Creator profile</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Instagram handle</Label><Input value={form.instagramHandle} onChange={(e) => setForm({ ...form, instagramHandle: e.target.value })} /></div><div className="space-y-2"><Label>Follower count</Label><Input type="number" min="0" value={form.followerCount} onChange={(e) => setForm({ ...form, followerCount: e.target.value })} /></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div><div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div></div>
      <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}<Button>{exists ? "Update profile" : "Create profile"}</Button>
    </form></CardContent></Card></section></AppShell></ProtectedRoute>
  );
}
