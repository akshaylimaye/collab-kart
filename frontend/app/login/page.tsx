"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { getClientError, isEmail, type FormErrors } from "@/lib/form";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginField = "email" | "password";

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors<LoginField>>({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const nextErrors: FormErrors<LoginField> = {};
    if (!isEmail(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await login(email.trim(), password);
      toast({ title: "Welcome back", description: "You are signed in.", variant: "success" });
    } catch (err) {
      toast({ title: "Login failed", description: getClientError(err, "Unable to login"), variant: "error" });
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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Access your CollabKart workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
              <FieldError message={errors.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
              <FieldError message={errors.password} />
            </div>
            <Button className="w-full" disabled={saving}>{saving ? "Signing in..." : "Sign in"}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">New here? <Link className="font-semibold text-primary" href="/register">Create an account</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
