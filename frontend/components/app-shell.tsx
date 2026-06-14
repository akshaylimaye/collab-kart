"use client";

import Link from "next/link";
import { LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import type { Role } from "@/lib/types";

const navByRole: Record<Role, Array<{ href: string; label: string }>> = {
  CREATOR: [
    { href: "/creator/dashboard", label: "Dashboard" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/creator/profile", label: "Profile" }
  ],
  BRAND: [
    { href: "/brand/dashboard", label: "Dashboard" },
    { href: "/brand/campaigns/new", label: "New campaign" },
    { href: "/brand/profile", label: "Profile" }
  ],
  ADMIN: [{ href: "/admin", label: "Admin" }]
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const links = user ? navByRole[user.role] : [];

  return (
    <div className="page-shell">
      <header className="border-b bg-background/95">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShoppingBag className="h-5 w-5" />
            </span>
            CollabKart
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {links.map((link) => (
              <Link key={link.href} className="muted-link" href={link.href}>{link.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? <span className="hidden text-sm text-muted-foreground sm:block">{user.name}</span> : null}
            {user ? (
              <Button variant="outline" size="sm" onClick={logout}><LogOut className="h-4 w-4" /> Logout</Button>
            ) : null}
          </div>
        </div>
        <div className="container flex gap-4 pb-3 md:hidden">
          {links.map((link) => (
            <Link key={link.href} className="muted-link" href={link.href}>{link.label}</Link>
          ))}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
