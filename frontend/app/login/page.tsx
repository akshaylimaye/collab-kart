"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ApiClientError } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Unable to login");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Access your CollabKart workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required /></div>
            <div className="space-y-2"><Label>Password</Label><Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required /></div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" disabled={saving}>{saving ? "Signing in..." : "Sign in"}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">New here? <Link className="text-primary" href="/register">Create an account</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
