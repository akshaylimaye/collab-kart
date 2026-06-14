"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiClientError } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function RegisterPage() {
  const { register } = useAuth();
  const [role, setRole] = useState<Exclude<Role, "ADMIN">>("CREATOR");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await register({ ...form, role });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to register");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Join as a creator or a brand.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required /></div>
            <div className="space-y-2"><Label>Password</Label><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" minLength={8} required /></div>
            <div className="space-y-2"><Label>Role</Label><Select value={role} onChange={(e) => setRole(e.target.value as Exclude<Role, "ADMIN">)}><option value="CREATOR">Creator</option><option value="BRAND">Brand</option></Select></div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" disabled={saving}>{saving ? "Creating..." : "Create account"}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">Already registered? <Link className="text-primary" href="/login">Login</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
