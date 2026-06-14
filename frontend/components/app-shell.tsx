"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast-provider";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const navByRole: Record<Role, Array<{ href: string; label: string }>> = {
  CREATOR: [
    { href: "/creator/dashboard", label: "Dashboard" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/creator/applications", label: "Applications" },
    { href: "/creator/profile", label: "Profile" }
  ],
  BRAND: [
    { href: "/brand/dashboard", label: "Dashboard" },
    { href: "/brand/campaigns", label: "Campaigns" },
    { href: "/brand/campaigns/new", label: "New Campaign" },
    { href: "/brand/profile", label: "Profile" }
  ],
  ADMIN: [{ href: "/admin", label: "Admin" }]
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const links = user ? navByRole[user.role] : [];

  function onLogout() {
    logout();
    toast({ title: "Logged out", description: "You have been signed out.", variant: "success" });
  }

  return (
    <div className="page-shell">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/82 backdrop-blur-xl supports-[backdrop-filter]:bg-white/72">
        <div className="container flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Link href={user?.role === "BRAND" ? "/brand/dashboard" : user?.role === "CREATOR" ? "/creator/dashboard" : "/"} className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_14px_30px_-18px_rgba(15,118,110,0.9)]">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="text-base">CollabKart</span>
          </Link>
          <nav className="order-3 flex w-full gap-2 overflow-x-auto md:order-2 md:w-auto md:items-center md:gap-1 md:overflow-visible" aria-label="Primary navigation">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-all hover:bg-white/85 hover:text-primary hover:shadow-sm",
                    active && "bg-white text-primary shadow-sm ring-1 ring-primary/10"
                  )}
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="order-2 flex items-center gap-2 md:order-3">
            {user ? <span className="hidden rounded-full border border-secondary bg-secondary/70 px-3 py-1 text-xs font-semibold text-secondary-foreground sm:inline-flex">{user.role}</span> : null}
            {user ? <span className="hidden max-w-32 truncate text-sm font-medium text-muted-foreground lg:block">{user.name}</span> : null}
            {user ? (
              <Button variant="outline" size="sm" onClick={onLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : null}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
