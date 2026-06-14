"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { getClientError, isEmail, type FormErrors } from "@/lib/form";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import { FieldError } from "@/components/field-error";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type RegisterField = "name" | "email" | "password";

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<Exclude<Role, "ADMIN">>("CREATOR");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FormErrors<RegisterField>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    if (requestedRole === "CREATOR" || requestedRole === "BRAND") setRole(requestedRole);
  }, []);

  function validate() {
    const nextErrors: FormErrors<RegisterField> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (form.password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, role });
      toast({ title: "Account created", description: "Your workspace is ready.", variant: "success" });
    } catch (err) {
      toast({ title: "Registration failed", description: getClientError(err, "Unable to register"), variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_30px_-18px_rgba(15,118,110,0.9)]">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Join as a creator or a brand.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" /><FieldError message={errors.name} /></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} type="email" autoComplete="email" /><FieldError message={errors.email} /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} type="password" autoComplete="new-password" /><FieldError message={errors.password} /></div>
            <div className="space-y-2"><Label htmlFor="role">Role</Label><Select id="role" value={role} options={[{ label: "Creator", value: "CREATOR" }, { label: "Brand", value: "BRAND" }]} onValueChange={(value) => setRole(value as Exclude<Role, "ADMIN">)} placeholder="Select role" /></div>
            <Button className="w-full" disabled={saving}>{saving ? "Creating..." : "Create account"}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">Already registered? <Link className="font-semibold text-primary" href="/login">Login</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
